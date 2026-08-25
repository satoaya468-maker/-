# Релей заявок → Telegram

Cloudflare Worker. Принимает POST с сайта и пересылает заявку в Telegram
владельцу сервиса.

**Токена бота в клиентском коде нет и быть не должно.** Сайт знает только
адрес этого Worker (`relayUrl` в `src/_data/site.json`), всё остальное —
переменные окружения Worker.

## Переменные окружения

| Переменная | Что это |
|---|---|
| `TELEGRAM_TOKEN` | Токен бота от @BotFather |
| `TELEGRAM_CHAT_ID` | Чат владельца. Заявки идут на номер **+7 951 469-33-35** — chat_id этого аккаунта подставляется сюда |
| `ALLOWED_ORIGIN` | Боевой домен, например `https://gbozlat.host-ai.site`. Запросы с других источников отклоняются |

## Как получить chat_id для +7 951 469-33-35

1. С этого номера написать боту любое сообщение (иначе бот не сможет
   ответить первым — так устроен Telegram).
2. Открыть `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и взять
   `result[].message.chat.id`.
3. Положить значение в `TELEGRAM_CHAT_ID`.

## Развёртывание

Всё выполняется из папки `worker/` — там лежит `wrangler.toml`.

```bash
cd worker
npx wrangler login                      # разовая авторизация в Cloudflare
npx wrangler secret put TELEGRAM_TOKEN    # вставить токен от @BotFather
npx wrangler secret put TELEGRAM_CHAT_ID  # вставить chat_id из шага выше
npx wrangler deploy
```

`ALLOWED_ORIGIN` секретом не делается — он лежит в `wrangler.toml`
открытым текстом, потому что это просто адрес сайта. Токен и chat_id
идут только через `secret put` и в репозиторий не попадают.

Wrangler напечатает адрес вида
`https://gbo-avto-relay.<ваш-субдомен>.workers.dev`. Его надо прописать
в `src/_data/site.json` → `relayUrl` и пересобрать сайт (`npm run build`).

## Проверка после развёртывания

```bash
curl -i -X POST https://gbo-avto-relay.<субдомен>.workers.dev \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://gbozlat.host-ai.site' \
  -d '{"source":"Проверка релея","phone":"+7 908 819-63-69"}'
```

Ожидается `HTTP 200 {"ok":true}` и сообщение в Telegram. Если пришёл 403 —
не совпал `ALLOWED_ORIGIN`; 422 — телефон не из 11 цифр; 502 — Telegram
отказал, смотреть `npx wrangler tail`.

## Что приходит в сообщении

Источник (форма заявки, чат-виджет, оценка), имя, телефон кликабельной
ссылкой, автомобиль, услуга, комментарий, страница отправки и время
в часовом поясе Asia/Yekaterinburg.

## Защита

- Honeypot-поле `website`: заполнено — запрос тихо отбрасывается.
- Минимальная задержка 3 секунды от загрузки страницы до отправки
  проверяется на стороне сайта (`formMinSeconds` в `site.json`).
- CORS только на боевой домен.
- Ответ Telegram наружу не отдаётся: в нём может оказаться часть токена.
