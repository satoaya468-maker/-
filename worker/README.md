# Приём заявок → Telegram

Cloudflare Worker «gbo-avto-leads». Принимает POST с сайта и пересылает
заявку в Telegram владельцу сервиса.

**Токена бота в клиентском коде нет и быть не должно.** Сайт знает только
адрес этого Worker'а (`relayUrl` в `src/_data/site.json`, оттуда он
попадает в `data-relay` на `<body>` и читается `assets/js/leads.js`).
Всё остальное — секреты Worker'а.

| Файл | Что это |
|---|---|
| `src/worker.js` | сам приёмник |
| `wrangler.toml` | конфиг развёртывания, только несекретное |
| `test.mjs` | прогон без развёртывания, `npm run test:relay` |

## Эндпоинты

| Метод | Путь | Ответ |
|---|---|---|
| `POST` | `/lead` | `200 {"ok":true}` — заявка ушла |
| `GET` | `/health` | `200 {"ok":true,"ts":…}` — Worker жив |

## Переменные

| Имя | Где задаётся | Что это |
|---|---|---|
| `TG_BOT_TOKEN` | `wrangler secret put` | Токен бота от @BotFather |
| `TG_CHAT_ID` | `wrangler secret put` | Получатель. Можно несколько через запятую — уйдёт в каждый |
| `ALLOWED_ORIGINS` | `wrangler.toml` → `[vars]` | Домены сайта через запятую, без слэша на конце |

## Развёртывание

```bash
cd worker
npx wrangler login                        # разовая авторизация в Cloudflare
npx wrangler secret put TG_BOT_TOKEN
npx wrangler secret put TG_CHAT_ID
npx wrangler deploy
```

`wrangler secret put` спрашивает значение отдельным приглашением и не пишет
его ни в файлы, ни в историю команд. Это единственное место, куда токен
должен попасть.

Адрес после развёртывания (`https://gbo-avto-leads.<субдомен>.workers.dev/lead`)
прописать в `src/_data/site.json` → `relayUrl` и пересобрать сайт.

### Ограничение частоты (необязательно)

Пока закомментировано в `wrangler.toml`. Чтобы включить — создать хранилище
и вписать его id:

```bash
npx wrangler kv namespace create LEADS_RL
```

Без него заявки принимаются без ограничения по частоте; honeypot и проверка
времени заполнения работают в любом случае.

## Проверка

```bash
curl -X POST https://gbo-avto-leads.<субдомен>.workers.dev/lead \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://gbozlat.host-ai.site' \
  -d '{"name":"Тест","phone":"+79514693335","car":"Lada Vesta","service":"Установка ГБО","comment":"проверка","t_elapsed":9000}'
```

| Ответ | Причина |
|---|---|
| `200 {"ok":true}` | заявка ушла |
| `403` | Origin не в `ALLOWED_ORIGINS` |
| `422` | телефон не распознан |
| `429` | сработало ограничение частоты по IP |
| `502` | Telegram не ответил. Заявка целиком пишется в лог: `npx wrangler tail` |
| `404` | путь не `/lead` — проверьте, что в `relayUrl` есть `/lead` на конце |

## Что шлёт сайт

| Источник | Как отправляется |
|---|---|
| Формы заявки и мини-форма мастера | атрибут `data-lead-form`, перехватывает `leads.js` |
| Чат-виджет | `window.GBOLeads.send({ … source: 'Чат-виджет' })`, ответы диалога — в `comment` |
| Оценка сайта (1–3 звезды) | `window.GBOLeads.send` с телефоном из формы |

Оценка 4–5 звёзд в Telegram не уходит: этот сценарий ведёт человека в 2ГИС.

## Защита

- Honeypot-поля `website` и `fax` — заполнены, значит бот: отвечаем как
  обычно и молча выбрасываем.
- Сабмит быстрее 2 секунд от открытия формы отбрасывается так же.
- CORS только на домены из `ALLOWED_ORIGINS`.
- Ответ Telegram наружу не отдаётся: в нём может оказаться часть токена.
