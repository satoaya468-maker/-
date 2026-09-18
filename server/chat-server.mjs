/**
 * Мини-сервер для чат-виджета СТРОЙ-БАЗА 74.
 *
 * Отдает статику сайта и держит два эндпоинта:
 *   POST /api/chat - прокси к Claude API (ключ читается из ANTHROPIC_API_KEY и наружу не уходит)
 *   POST /api/lead - заявка с номером телефона из чата
 *
 * Запуск:  ANTHROPIC_API_KEY=sk-ant-... node chat-server.mjs
 * Без ключа сервер отвечает 503 { error: "no_key" }, а виджет сам переключается
 * на встроенную офлайн-заглушку, так что сайт остается рабочим.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './prompt.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const SITE_ROOT = join(HERE, '..');
const PORT = Number(process.env.PORT) || 8080;
const INDEX_FILE = process.env.INDEX_FILE || 'stroy-baza-74.html';

const MODEL = 'claude-opus-5';
const MAX_TOKENS = 1024;
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 1200;

/* Ключ живет только здесь. Клиент про него ничего не знает. */
const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

if (!client) {
  console.warn('[chat] ANTHROPIC_API_KEY не задан: /api/chat вернет 503, виджет уйдет в заглушку');
}

/* Простой лимит по IP, чтобы чужой скрипт не сжег ключ */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 30;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT;
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'content-type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

async function readJson(req, limitBytes = 64 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limitBytes) throw new Error('payload_too_large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

/** Пропускаем только то, что реально отправит виджет */
function sanitizeHistory(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS).trim() }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_HISTORY);
}

async function handleChat(req, res, ip) {
  if (!client) {
    return send(res, 503, { error: 'no_key', message: 'ANTHROPIC_API_KEY не задан на сервере' });
  }
  if (rateLimited(ip)) {
    return send(res, 429, { error: 'rate_limited', message: 'Слишком много запросов, попробуйте позже' });
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: 'bad_request' });
  }

  const messages = sanitizeHistory(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return send(res, 400, { error: 'bad_request', message: 'Ожидается история с последним сообщением пользователя' });
  }

  try {
    /* Отказ классификатора не должен обрывать диалог: серверный fallback
       переигрывает тот же запрос на запасной модели внутри одного вызова. */
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });

    if (response.stop_reason === 'refusal') {
      return send(res, 200, {
        reply: 'Давайте вернемся к материалам: что нужно привезти и в каком объеме? Или позвоните напрямую: +7 (912) 805-49-47.',
      });
    }

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return send(res, 200, { reply: reply || 'Не расслышал вопрос. Уточните, что нужно привезти?' });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.error('[chat] лимит API');
      return send(res, 429, { error: 'rate_limited' });
    }
    if (error instanceof Anthropic.APIConnectionError) {
      console.error('[chat] нет связи с API:', error.message);
      return send(res, 502, { error: 'upstream_unreachable' });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`[chat] ошибка API ${error.status}:`, error.message);
      return send(res, 502, { error: 'upstream_error' });
    }
    console.error('[chat] непредвиденная ошибка:', error);
    return send(res, 500, { error: 'server_error' });
  }
}

async function handleLead(req, res, ip) {
  if (rateLimited(ip)) return send(res, 429, { error: 'rate_limited' });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: 'bad_request' });
  }

  const digits = String(body.phone || '').replace(/\D/g, '');
  if (digits.length !== 11) return send(res, 400, { error: 'bad_phone' });

  /* TODO: отправить заявку в CRM (Битрикс24, amoCRM) или в Telegram-бот отдела продаж */
  console.log('[lead] телефон:', digits, '| источник: чат', '| диалог:', sanitizeHistory(body.messages).length, 'сообщений');

  return send(res, 200, { ok: true });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
};

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const relative = url.pathname === '/' ? INDEX_FILE : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const target = normalize(join(SITE_ROOT, relative));

  /* Не выпускаем чтение за пределы папки сайта */
  if (!target.startsWith(SITE_ROOT + sep)) return send(res, 403, 'Forbidden');

  try {
    const file = await readFile(target);
    res.writeHead(200, { 'content-type': MIME[extname(target)] || 'application/octet-stream' });
    res.end(file);
  } catch {
    send(res, 404, 'Not found');
  }
}

const server = createServer(async (req, res) => {
  const ip = req.socket.remoteAddress || 'unknown';

  if (req.method === 'POST' && req.url === '/api/chat') return handleChat(req, res, ip);
  if (req.method === 'POST' && req.url === '/api/lead') return handleLead(req, res, ip);
  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res);

  send(res, 405, 'Method not allowed');
});

server.listen(PORT, () => {
  console.log(`[chat] сайт: http://localhost:${PORT}/`);
  console.log(`[chat] модель: ${MODEL}, ключ: ${apiKey ? 'подключен' : 'не задан (виджет в режиме заглушки)'}`);
});
