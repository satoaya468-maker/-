/**
 * ГБО-АВТО сервис (Златоуст) — приём заявок с сайта и отправка в Telegram.
 *
 * Секреты (wrangler secret put ...):
 *   TG_BOT_TOKEN — токен бота «ГБО-авто заявки» от @BotFather
 *   TG_CHAT_ID   — chat_id получателя (личка Владимира или группа)
 * Переменные (wrangler.toml [vars]):
 *   ALLOWED_ORIGINS — список доменов через запятую
 *
 * Эндпоинты:
 *   POST /lead    — заявка с формы
 *   GET  /health  — проверка живости
 */

const MAX_BODY = 16 * 1024;      // 16 КБ хватает с запасом
const RL_LIMIT = 5;              // не более 5 заявок
const RL_WINDOW = 10 * 60;       // за 10 минут с одного IP

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/health') {
      return json({ ok: true, ts: Date.now() }, 200, cors);
    }

    if (url.pathname !== '/lead' || request.method !== 'POST') {
      return json({ ok: false, error: 'not_found' }, 404, cors);
    }

    // Заявку принимаем только со своих доменов (Origin подделывается лишь вне браузера,
    // но вместе с honeypot и rate limit отсекает подавляющую часть мусора).
    if (origin && !isAllowedOrigin(origin, env)) {
      return json({ ok: false, error: 'forbidden_origin' }, 403, cors);
    }

    let data;
    try {
      data = await readBody(request);
    } catch (e) {
      return json({ ok: false, error: 'bad_request' }, 400, cors);
    }

    // Honeypot: скрытое поле, которое заполняют только боты.
    if (str(data.website) || str(data.fax)) {
      return json({ ok: true }, 200, cors); // тихо принимаем и выбрасываем
    }

    // Время заполнения формы: меньше 2 секунд — почти наверняка бот.
    const elapsed = Number(data.t_elapsed);
    if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 2000) {
      return json({ ok: true }, 200, cors);
    }

    const name = str(data.name).slice(0, 100);
    const phoneRaw = str(data.phone);
    const phone = normalizePhone(phoneRaw);

    if (!phone) {
      return json({ ok: false, error: 'bad_phone', message: 'Проверьте номер телефона' }, 422, cors);
    }

    const ip = request.headers.get('CF-Connecting-IP') || '';
    if (env.LEADS_RL && ip) {
      const key = `rl:${ip}`;
      const hits = Number((await env.LEADS_RL.get(key)) || 0);
      if (hits >= RL_LIMIT) {
        return json({ ok: false, error: 'rate_limited', message: 'Слишком много заявок. Позвоните нам: +7 908 819-63-69' }, 429, cors);
      }
      ctx.waitUntil(env.LEADS_RL.put(key, String(hits + 1), { expirationTtl: RL_WINDOW }));
    }

    const lead = {
      name,
      phone,
      phoneRaw,
      car: str(data.car).slice(0, 120),
      service: str(data.service).slice(0, 120),
      comment: str(data.comment || data.message).slice(0, 1000),
      source: str(data.source || 'Форма на сайте').slice(0, 80),
      page: str(data.page).slice(0, 200),
      utm: {
        source: str(data.utm_source).slice(0, 80),
        medium: str(data.utm_medium).slice(0, 80),
        campaign: str(data.utm_campaign).slice(0, 120),
        term: str(data.utm_term).slice(0, 120),
      },
      country: request.headers.get('CF-IPCountry') || '',
      city: request.cf && request.cf.city ? String(request.cf.city) : '',
    };

    const sent = await sendToTelegram(lead, env);
    if (!sent.ok) {
      // Заявку терять нельзя: логируем в консоль Worker'а (wrangler tail) с полным телом.
      console.error('TELEGRAM_FAILED', JSON.stringify({ lead, tg: sent.error }));
      return json({ ok: false, error: 'delivery_failed', message: 'Не удалось отправить. Позвоните: +7 908 819-63-69' }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

/* ---------- Telegram ---------- */

async function sendToTelegram(lead, env) {
  const token = env.TG_BOT_TOKEN;
  const chatId = env.TG_CHAT_ID;
  if (!token || !chatId) return { ok: false, error: 'missing_credentials' };

  const text = renderMessage(lead);
  const chats = String(chatId).split(',').map(s => s.trim()).filter(Boolean);

  let lastError = null;
  let anyOk = false;

  for (const chat of chats) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chat,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.ok) { anyOk = true; break; }
        lastError = body.description || `http_${res.status}`;
        // 429 — подождать столько, сколько просит Telegram
        const retryAfter = body.parameters && body.parameters.retry_after;
        await sleep(retryAfter ? retryAfter * 1000 : 400 * (attempt + 1));
      } catch (e) {
        lastError = String(e && e.message ? e.message : e);
        await sleep(400 * (attempt + 1));
      }
    }
  }

  return anyOk ? { ok: true } : { ok: false, error: lastError };
}

function renderMessage(lead) {
  const L = [];
  L.push('🔔 <b>Новая заявка — ГБО-АВТО сервис</b>');
  L.push('');
  if (lead.name) L.push(`👤 <b>Имя:</b> ${esc(lead.name)}`);
  L.push(`📞 <b>Телефон:</b> <a href="tel:${esc(lead.phone)}">${esc(formatPhone(lead.phone))}</a>`);
  L.push(`   <code>${esc(lead.phone)}</code>`);
  if (lead.car) L.push(`🚗 <b>Авто:</b> ${esc(lead.car)}`);
  if (lead.service) L.push(`🛠 <b>Услуга:</b> ${esc(lead.service)}`);
  if (lead.comment) L.push(`💬 <b>Комментарий:</b> ${esc(lead.comment)}`);
  L.push('');
  L.push(`📍 <b>Источник:</b> ${esc(lead.source)}`);
  if (lead.page) L.push(`🔗 ${esc(lead.page)}`);

  const utmParts = Object.entries(lead.utm).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`);
  if (utmParts.length) L.push(`🏷 ${esc(utmParts.join(' · '))}`);
  if (lead.city || lead.country) L.push(`🌐 ${esc([lead.city, lead.country].filter(Boolean).join(', '))}`);

  L.push(`🕒 ${esc(moscowTime())} (Екатеринбург)`);
  return L.join('\n');
}

/* ---------- утилиты ---------- */

async function readBody(request) {
  const ct = request.headers.get('Content-Type') || '';
  const raw = await request.text();
  if (raw.length > MAX_BODY) throw new Error('too_large');
  if (ct.includes('application/json')) return JSON.parse(raw || '{}');
  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

function allowedList(env) {
  return String(env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
}

function isAllowedOrigin(origin, env) {
  const list = allowedList(env);
  if (!list.length) return true;
  return list.includes(origin.replace(/\/+$/, ''));
}

function corsHeaders(origin, env) {
  const h = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (origin && isAllowedOrigin(origin, env)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });
}

function str(v) {
  return (v === undefined || v === null) ? '' : String(v).trim();
}

/** Приводит российский номер к виду +79XXXXXXXXX. Возвращает '' если номер невалиден. */
function normalizePhone(input) {
  let d = str(input).replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
  if (d.length === 10 && d[0] === '9') d = '7' + d;
  if (d.length === 11 && d[0] === '7') return '+' + d;
  // допускаем иностранные номера длиной 11–15 цифр
  if (d.length >= 11 && d.length <= 15) return '+' + d;
  return '';
}

function formatPhone(p) {
  const m = /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(p);
  return m ? `+7 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : p;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function moscowTime() {
  // Златоуст — Екатеринбургское время, UTC+5
  const d = new Date(Date.now() + 5 * 3600 * 1000);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
