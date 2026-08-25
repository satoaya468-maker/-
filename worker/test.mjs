/**
 * Прогон релея без развёртывания: fetch к Telegram подменён заглушкой,
 * поэтому видно ровно то сообщение, которое ушло бы владельцу.
 *
 *     node worker/test.mjs
 */
import worker from './index.js';

const ORIGIN = 'https://gbozlat.host-ai.site';
const env = { TELEGRAM_TOKEN: 'T', TELEGRAM_CHAT_ID: '1', ALLOWED_ORIGIN: ORIGIN };

let sent = null;
globalThis.fetch = async (url, init) => {
  sent = JSON.parse(init.body);
  return { ok: true, status: 200, text: async () => 'ok' };
};

const post = (body, origin = ORIGIN) => worker.fetch(new Request('https://r/', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
  body: JSON.stringify(body)
}), env);

const cases = [
  ['форма заявки', { source: 'Форма: установка ГБО', name: 'Иван', phone: '+7 (908) 819-63-69', car: 'Lada Granta 2019' }],
  ['чат-виджет',   { source: 'Чат-виджет', phone: '+7 908 819-63-69', car: 'Kia Rio 2018', service: 'Установка ГБО', comment: 'Пробег: 1500–4000 км' }],
  ['оценка сайта', { source: 'Оценка сайта: 5 звёзд', score: 5, comment: 'всё понравилось' }],
  ['honeypot',     { source: 'Форма', phone: '+79088196369', website: 'spam' }],
  ['кривой номер', { source: 'Форма', phone: '12345' }]
];

for (const [label, body] of cases) {
  sent = null;
  const res = await post(body);
  const out = await res.json().catch(() => ({}));
  console.log(`${label.padEnd(15)} HTTP ${res.status} ${JSON.stringify(out)}`);
  if (sent) console.log('   → в Telegram:\n' + sent.text.split('\n').map(l => '      ' + l).join('\n'));
  else console.log('   → в Telegram НИЧЕГО не ушло');
}

// чужой origin
const bad = await post({ source: 'Форма', phone: '+79088196369' }, 'https://evil.example');
console.log(`чужой origin    HTTP ${bad.status}`);
// preflight
const pre = await worker.fetch(new Request('https://r/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env);
console.log(`preflight       HTTP ${pre.status} ACAO=${pre.headers.get('Access-Control-Allow-Origin')}`);
