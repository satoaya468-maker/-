<?php
/* ==========================================================================
 * МАСТЕР на ЧАС — приём заявок с сайта → уведомление в Telegram
 * --------------------------------------------------------------------------
 * Как настроить (5 минут):
 *   1. В Telegram напишите @BotFather → /newbot → получите ТОКЕН бота.
 *   2. Напишите своему боту любое сообщение (иначе он не сможет вам писать).
 *   3. Узнайте свой CHAT_ID: откройте
 *      https://api.telegram.org/bot<ТОКЕН>/getUpdates — в ответе найдите
 *      "chat":{"id": ... } — это и есть CHAT_ID.
 *   4. Впишите TG_BOT_TOKEN и TG_CHAT_ID ниже (или задайте их переменными
 *      окружения на хостинге — так безопаснее).
 *   5. Загрузите файл в корень сайта на reg.ru (PHP там поддерживается).
 *
 * Пока токен не заполнен — обработчик отвечает в демо-режиме (ok:true, demo),
 * чтобы форму можно было показать заказчику до подключения бота.
 * ========================================================================== */

header('Content-Type: application/json; charset=utf-8');

/* --- Настройки (замените плейсхолдеры или задайте через окружение) --- */
$BOT_TOKEN = getenv('TG_BOT_TOKEN') ?: 'PASTE_YOUR_BOT_TOKEN';
$CHAT_ID   = getenv('TG_CHAT_ID')   ?: 'PASTE_YOUR_CHAT_ID';

/* --- Только POST --- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

/* --- Читаем тело (JSON или обычная форма) --- */
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$clean = function ($v) {
    return trim(mb_substr(preg_replace('/[\x00-\x1F\x7F]/u', ' ', (string)$v), 0, 1500));
};

$name    = $clean($data['name']    ?? '');
$phone   = $clean($data['phone']   ?? '');
$address = $clean($data['address'] ?? '');
$task    = $clean($data['task']    ?? '');
$time    = $clean($data['time']    ?? '');
$page    = $clean($data['page']    ?? '');
$company = $clean($data['company'] ?? ''); // ханипот

/* --- Ханипот: заполнено — значит бот --- */
if ($company !== '') {
    echo json_encode(['ok' => true]); // делаем вид, что всё хорошо
    exit;
}

/* --- Минимальная валидация --- */
$digits = preg_replace('/\D/', '', $phone);
if (mb_strlen($name) < 2 || strlen($digits) < 10) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation']);
    exit;
}

/* --- Демо-режим: бот ещё не подключён --- */
if ($BOT_TOKEN === 'PASTE_YOUR_BOT_TOKEN' || $CHAT_ID === 'PASTE_YOUR_CHAT_ID') {
    echo json_encode(['ok' => true, 'demo' => true]);
    exit;
}

/* --- Собираем сообщение --- */
$lines = [];
$lines[] = '🔔 <b>Новая заявка с сайта</b>';
$lines[] = '';
$lines[] = '👤 <b>Имя:</b> ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$lines[] = '📞 <b>Телефон:</b> ' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
if ($address !== '') { $lines[] = '📍 <b>Адрес:</b> ' . htmlspecialchars($address, ENT_QUOTES, 'UTF-8'); }
if ($task    !== '') { $lines[] = '🛠 <b>Что нужно:</b> ' . htmlspecialchars($task, ENT_QUOTES, 'UTF-8'); }
if ($time    !== '') { $lines[] = '⏰ <b>Удобное время звонка:</b> ' . htmlspecialchars($time, ENT_QUOTES, 'UTF-8'); }
$lines[] = '';
$lines[] = '🕘 ' . date('d.m.Y H:i');
if ($page !== '') { $lines[] = '🌐 ' . htmlspecialchars($page, ENT_QUOTES, 'UTF-8'); }

$text = implode("\n", $lines);

/* --- Отправляем в Telegram --- */
$url = "https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage";
$post = [
    'chat_id'    => $CHAT_ID,
    'text'       => $text,
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true,
];

$ok = false;
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($post),
        CURLOPT_TIMEOUT        => 12,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $ok = ($code >= 200 && $code < 300);
} else {
    // Фолбэк без cURL
    $ctx = stream_context_create(['http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query($post),
        'timeout' => 12,
    ]]);
    $resp = @file_get_contents($url, false, $ctx);
    $ok = ($resp !== false);
}

if ($ok) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'telegram_unreachable']);
}
