/**
 * Релей заявок ГБО-АВТО → Telegram.
 *
 * Принимает POST с JSON от трёх источников: формы заявки, чат-виджета
 * и блока «Оцените нас». Складывает сообщение и отдаёт его Telegram Bot API.
 *
 * Токен бота и chat_id живут в переменных окружения Worker и в клиентский
 * код не попадают ни при каких условиях:
 *   TELEGRAM_TOKEN   — токен бота от @BotFather
 *   TELEGRAM_CHAT_ID — чат владельца (номер +7 951 469-33-35)
 *   ALLOWED_ORIGIN   — боевой домен, например https://gbozlat.host-ai.site
 */

const FIELDS = [
  ['source', 'Источник'],
  ['name', 'Имя'],
  ['car', 'Автомобиль'],
  ['service', 'Услуга'],
  ['score', 'Оценка'],
  ['comment', 'Комментарий'],
  ['page', 'Страница'],
  ['time', 'Время']
];

const esc = (v) =>
  String(v).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function reply(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) }
  });
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || '';
    const origin = request.headers.get('Origin') || '';

    /* CORS только на боевой домен */
    if (allowed && origin !== allowed) {
      return new Response('Forbidden', { status: 403 });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(allowed) });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return reply(400, { ok: false, error: 'bad-json' }, allowed);
    }

    /* Honeypot: заполненное поле — это бот, отвечаем как обычно и молчим */
    if (data.website) return reply(200, { ok: true }, allowed);

    const digits = String(data.phone || '').replace(/\D/g, '');
    const needsPhone = data.source !== 'Оценка сайта';
    if (needsPhone && digits.length !== 11) {
      return reply(422, { ok: false, error: 'bad-phone' }, allowed);
    }

    const lines = ['<b>Заявка с сайта ГБО-АВТО</b>'];
    if (digits.length === 11) {
      lines.push(`Телефон: <a href="tel:+${digits}">+${digits}</a>`);
    }
    for (const [key, label] of FIELDS) {
      const v = data[key];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        lines.push(`${label}: ${esc(v)}`);
      }
    }

    const res = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: lines.join('\n'),
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }
    );

    if (!res.ok) {
      /* Наружу не отдаём ответ Telegram: в нём может быть кусок токена */
      console.error('telegram', res.status, await res.text());
      return reply(502, { ok: false, error: 'telegram-failed' }, allowed);
    }
    return reply(200, { ok: true }, allowed);
  }
};
