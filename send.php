<?php
/**
 * КРАСИВОЕ ЖЕЛЕЗО — приём заявки с чертежом.
 *
 * Принимает multipart/form-data из формы на сайте, проверяет поля и файлы,
 * отправляет в Telegram: sendMessage (текст заявки) + sendDocument (каждый файл).
 * Отвечает JSON: {"ok":true} либо {"ok":false,"error":"..."}.
 *
 * Требуется PHP 7.4+ с расширениями curl и fileinfo.
 */

declare(strict_types=1);

// Крупный чертёж грузится в Telegram дольше стандартных 30 секунд PHP.
@set_time_limit(180);
@ignore_user_abort(true);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

/** Ответ и выход. */
function reply(bool $ok, string $error = '', int $code = 200): void
{
    http_response_code($code);
    echo json_encode(
        $ok ? ['ok' => true] : ['ok' => false, 'error' => $error],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(false, 'Метод не поддерживается.', 405);
}

$cfgPath = __DIR__ . '/config.php';
if (!is_file($cfgPath)) {
    reply(false, 'Сервер не настроен: нет config.php.', 500);
}
$cfg = require $cfgPath;

if (!function_exists('curl_init')) {
    reply(false, 'На хостинге не включён cURL.', 500);
}

/* -------------------------------------------------------------------------
   Логирование (тихое: ошибки логируем, клиенту не показываем внутренности)
   ------------------------------------------------------------------------- */
function kz_log(array $cfg, string $message): void
{
    $file = $cfg['log_file'] ?? '';
    if (!$file) {
        return;
    }
    $dir = dirname($file);
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    @file_put_contents(
        $file,
        '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

/* -------------------------------------------------------------------------
   Антиспам
   ------------------------------------------------------------------------- */
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');

// 1. Honeypot: поле скрыто от людей, боты его заполняют.
if (trim((string) ($_POST['company'] ?? '')) !== '') {
    reply(true); // тихо «успех», чтобы бот не подбирал
}

// 2. Слишком быстрое заполнение.
$ts = (int) ($_POST['ts'] ?? 0);
if ($ts > 0 && (time() - (int) ($ts / 1000)) < (int) $cfg['min_fill_seconds']) {
    reply(true);
}

// 3. Частота с одного IP.
$rateFile = sys_get_temp_dir() . '/kz_rate_' . md5($ip) . '.json';
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $raw = (array) json_decode((string) @file_get_contents($rateFile), true);
    foreach ($raw as $t) {
        if (is_int($t) && ($now - $t) < (int) $cfg['rate_window']) {
            $hits[] = $t;
        }
    }
}
if (count($hits) >= (int) $cfg['rate_limit']) {
    reply(false, 'Слишком много заявок подряд. Позвоните — ответим сразу.', 429);
}
$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

/* -------------------------------------------------------------------------
   Поля
   ------------------------------------------------------------------------- */
function field(string $key, int $limit = 500): string
{
    $value = (string) ($_POST[$key] ?? '');
    $value = str_replace(["\r\n", "\r"], "\n", trim($value));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $limit);
}

$name     = field('name', 120);
$phone    = field('phone', 40);
$material = field('material', 60);
$thickness = field('thickness', 20);
$qty      = field('qty', 40);
$comment  = field('comment', 2000);
$page     = field('page', 120);

if (mb_strlen($name) < 2) {
    reply(false, 'Укажите имя.');
}
$digits = preg_replace('/\D/', '', $phone) ?? '';
if (strlen($digits) < 10 || strlen($digits) > 15) {
    reply(false, 'Проверьте номер телефона.');
}
if (empty($_POST['consent'])) {
    reply(false, 'Нужно согласие на обработку данных.');
}

/* -------------------------------------------------------------------------
   Файлы
   ------------------------------------------------------------------------- */
$allowedExt = (array) $cfg['allowed_ext'];
$allowedMime = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    // DXF/DWG отдаются хостингами по-разному
    'application/octet-stream', 'text/plain', 'application/dxf', 'image/vnd.dxf',
    'application/dwg', 'image/vnd.dwg', 'application/acad', 'drawing/x-dwg', 'application/zip',
];

$accepted = [];
$rejected = [];

if (!empty($_FILES['files']) && is_array($_FILES['files']['name'])) {
    $count = count($_FILES['files']['name']);

    for ($i = 0; $i < $count && count($accepted) < (int) $cfg['max_files']; $i++) {
        $err = (int) $_FILES['files']['error'][$i];
        $orig = (string) $_FILES['files']['name'][$i];
        $tmp  = (string) $_FILES['files']['tmp_name'][$i];
        $size = (int) $_FILES['files']['size'][$i];

        if ($err === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
            $rejected[] = $orig . ' (больше лимита сервера)';
            continue;
        }
        if ($err !== UPLOAD_ERR_OK || !is_uploaded_file($tmp)) {
            $rejected[] = $orig . ' (ошибка загрузки)';
            continue;
        }
        if ($size <= 0 || $size > (int) $cfg['max_file_size']) {
            $rejected[] = $orig . ' (больше 20 МБ)';
            continue;
        }

        $ext = strtolower((string) pathinfo($orig, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true)) {
            $rejected[] = $orig . ' (формат не принимается)';
            continue;
        }

        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = (string) finfo_file($finfo, $tmp);
            finfo_close($finfo);
            if (!in_array($mime, $allowedMime, true)) {
                $rejected[] = $orig . ' (содержимое не совпадает с расширением)';
                continue;
            }
        }

        // Имя чистим: в Telegram уходит безопасное, без путей и управляющих символов.
        $safe = preg_replace('/[^\p{L}\p{N}._-]+/u', '_', pathinfo($orig, PATHINFO_FILENAME)) ?? 'file';
        $safe = mb_substr(trim($safe, '_'), 0, 60) ?: 'chertezh';

        $accepted[] = [
            'tmp'  => $tmp,
            'name' => $safe . '.' . $ext,
            'size' => $size,
        ];
    }
}

/* -------------------------------------------------------------------------
   Текст заявки
   ------------------------------------------------------------------------- */
function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function humanSize(int $bytes): string
{
    return $bytes >= 1048576
        ? number_format($bytes / 1048576, 1, ',', ' ') . ' МБ'
        : (string) (int) round($bytes / 1024) . ' КБ';
}

$phonePretty = '+' . $digits;

$lines = [];
$lines[] = '<b>НОВАЯ ЗАЯВКА — расчёт</b>';
$lines[] = '';
$lines[] = '👤 <b>' . h($name) . '</b>';
$lines[] = '📞 <a href="tel:' . h($phonePretty) . '">' . h($phonePretty) . '</a>';
if ($material !== '') {
    $lines[] = '🧱 Материал: <b>' . h($material) . '</b>';
}
if ($thickness !== '') {
    $lines[] = '📏 Толщина: <b>' . h($thickness) . ' мм</b>';
}
if ($qty !== '') {
    $lines[] = '🔢 Количество: <b>' . h($qty) . '</b>';
}
if ($comment !== '') {
    $lines[] = '';
    $lines[] = '💬 ' . h($comment);
}
$lines[] = '';
if ($accepted) {
    $names = array_map(static function (array $f): string {
        return h($f['name']) . ' — ' . humanSize($f['size']);
    }, $accepted);
    $lines[] = '📎 Файлы (' . count($accepted) . '): ' . implode(', ', $names);
} else {
    $lines[] = '📎 Без файлов';
}
if ($rejected) {
    $lines[] = '⚠️ Не приняты: ' . h(implode(', ', $rejected));
}
$lines[] = '';
$lines[] = '<i>' . h((string) $cfg['site_name']) . ' · ' . h($page !== '' ? $page : '/') . ' · ' . date('d.m.Y H:i') . '</i>';

$text = implode("\n", $lines);

/* -------------------------------------------------------------------------
   Telegram
   ------------------------------------------------------------------------- */
function tg(array $cfg, string $method, array $payload, bool $multipart = false)
{
    $url = 'https://api.telegram.org/bot' . $cfg['tg_token'] . '/' . $method;

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $multipart ? $payload : http_build_query($payload),
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($errno !== 0) {
        return ['ok' => false, 'description' => 'cURL ' . $errno . ': ' . $error];
    }

    $decoded = json_decode((string) $body, true);
    return is_array($decoded) ? $decoded : ['ok' => false, 'description' => 'Ответ Telegram не разобран'];
}

$token = (string) $cfg['tg_token'];
$chat  = (string) $cfg['tg_chat_id'];

if ($token === '' || strpos($token, 'ВСТАВЬТЕ') === 0 || $chat === '' || strpos($chat, 'ВСТАВЬТЕ') === 0) {
    kz_log($cfg, 'config.php не заполнен: заявка от ' . $phonePretty . ' не ушла в Telegram');
    reply(false, 'Форма ещё не подключена к мессенджеру. Позвоните или напишите в WhatsApp — ответим сразу.', 500);
}

$sent = tg($cfg, 'sendMessage', [
    'chat_id'    => $chat,
    'text'       => $text,
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true,
]);

if (empty($sent['ok'])) {
    kz_log($cfg, 'sendMessage failed: ' . (string) ($sent['description'] ?? '?'));
    reply(false, 'Не удалось передать заявку. Продублируйте в WhatsApp — так дойдёт точно.', 502);
}

// Файлы отправляем отдельными документами: Telegram сохранит оригинал DXF/DWG.
foreach ($accepted as $index => $file) {
    $result = tg($cfg, 'sendDocument', [
        'chat_id'  => $chat,
        'caption'  => 'Файл ' . ($index + 1) . '/' . count($accepted) . ' · ' . $name . ' · ' . $phonePretty,
        'document' => new CURLFile($file['tmp'], 'application/octet-stream', $file['name']),
    ], true);

    if (empty($result['ok'])) {
        kz_log($cfg, 'sendDocument failed (' . $file['name'] . '): ' . (string) ($result['description'] ?? '?'));
        tg($cfg, 'sendMessage', [
            'chat_id' => $chat,
            'text'    => '⚠️ Файл «' . $file['name'] . '» не долетел. Перезвоните клиенту: ' . $phonePretty,
        ]);
    }
}

/* -------------------------------------------------------------------------
   Дубль на почту (не влияет на ответ клиенту)
   ------------------------------------------------------------------------- */
$emailTo = (string) ($cfg['email_to'] ?? '');
if ($emailTo !== '' && function_exists('mail')) {
    $plain = strip_tags(str_replace(['<br>', '</b>'], ["\n", ''], $text));
    $headers = 'From: ' . ($cfg['site_name'] ?? 'Сайт') . ' <' . ($cfg['email_from'] ?? '') . ">\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "MIME-Version: 1.0\r\n";
    @mail($emailTo, 'Заявка с сайта: ' . $name . ' ' . $phonePretty, $plain, $headers);
}

reply(true);
