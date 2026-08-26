/* =========================================================================
   Обработчик формы EasyLead для Cloudflare Workers.
   Принимает заявку с сайта и кладёт её в Telegram.

   Токен бота живёт в секретах воркера и в браузер не попадает.
   Установка описана в README.md, раздел «Подключение формы».
   ========================================================================= */

const ALLOWED_ORIGINS = [
  // ПРОВЕРЬ: сюда впишите домен сайта, иначе форму сможет дёргать кто угодно.
  'https://example.com'
];

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function clean(value, max) {
  return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = cors(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Bad request', { status: 400, headers });
    }

    const name = clean(body.name, 80);
    const phone = clean(body.phone, 32);
    const digits = phone.replace(/\D/g, '');

    if (!name || digits.length !== 11) {
      return new Response('Validation failed', { status: 422, headers });
    }

    const text = [
      'Новая заявка с сайта',
      '',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      body.page ? `Страница: ${clean(body.page, 200)}` : null,
      body.ref ? `Источник: ${clean(body.ref, 200)}` : null
    ].filter(Boolean).join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true
      })
    });

    if (!tg.ok) {
      console.error('Telegram API вернул', tg.status, await tg.text());
      return new Response('Upstream failed', { status: 502, headers });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
};
