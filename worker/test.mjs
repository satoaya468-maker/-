/**
 * Прогон приёмника заявок без развёртывания: fetch к Telegram подменён
 * заглушкой, поэтому видно ровно те сообщения, которые ушли бы владельцу.
 *
 *     npm run test:relay
 */
import worker from './src/worker.js';

const ORIGIN = 'https://gbozlat.host-ai.site';
/* Два chat_id через запятую — так проверяется отправка и в личку, и в группу. */
const env = { TG_BOT_TOKEN: 'stub', TG_CHAT_ID: '111,222', ALLOWED_ORIGINS: ORIGIN };
const ctx = { waitUntil() {} };

let sent = [];
globalThis.fetch = async (url, init) => {
  if (!String(url).includes('api.telegram.org')) throw new Error('чужой адрес: ' + url);
  sent.push(JSON.parse(init.body));
  return { ok: true, status: 200, json: async () => ({ ok: true }) };
};

const call = (body, { origin = ORIGIN, path = '/lead', method = 'POST' } = {}) =>
  worker.fetch(new Request('https://relay.local' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: method === 'POST' ? JSON.stringify(body) : undefined
  }), env, ctx);

const cases = [
  ['форма на главной', { source: 'Форма на главной', name: 'Иван', phone: '+7 (908) 819-63-69',
    car: 'Lada Granta 2019', service: 'Установка ГБО 4 поколения', comment: 'удобно утром', t_elapsed: 9000 }],
  ['мини-форма', { source: 'Мини-форма «Мастер подберёт комплект» — главная', name: 'Пётр',
    phone: '89385178227', t_elapsed: 9000 }],
  ['чат-виджет', { source: 'Чат-виджет', phone: '9385178227',
    car: 'Kia Rio 2018', service: 'Установка ГБО',
    comment: 'Авто: Kia Rio 2018 · Задача: Установка ГБО · Пробег: До 1500 км', t_elapsed: 30000 }],
  /* Оценка идёт с телефоном: приёмник не принимает обращения без номера,
     а панель низкой оценки обещает ответить — без контакта это невозможно. */
  ['оценка сайта', { source: 'Оценка сайта: 2 из 5', phone: '+79088196369',
    comment: 'долго ждал', t_elapsed: 9000 }],
  ['honeypot', { source: 'Форма', phone: '+79088196369', website: 'spam', t_elapsed: 9000 }],
  ['сабмит быстрее 2 сек', { source: 'Форма', phone: '+79088196369', t_elapsed: 800 }],
  ['кривой номер', { source: 'Форма', phone: '123', t_elapsed: 9000 }],
  ['без телефона', { source: 'Форма', comment: 'только текст', t_elapsed: 9000 }]
];

for (const [label, body] of cases) {
  sent = [];
  const res = await call(body);
  const out = await res.json().catch(() => ({}));
  console.log(`${label.padEnd(22)} HTTP ${res.status} ${JSON.stringify(out)}  → чатов: ${sent.length}`);
  if (sent.length) console.log(sent[0].text.split('\n').map((l) => '      ' + l).join('\n'));
}

const bad = await call({ source: 'Форма', phone: '+79088196369', t_elapsed: 9000 }, { origin: 'https://evil.example' });
console.log(`чужой origin           HTTP ${bad.status}`);
const pre = await call(null, { method: 'OPTIONS' });
console.log(`preflight              HTTP ${pre.status} ACAO=${pre.headers.get('Access-Control-Allow-Origin')}`);
const health = await call(null, { method: 'GET', path: '/health' });
console.log(`/health                HTTP ${health.status} ${await health.text()}`);
