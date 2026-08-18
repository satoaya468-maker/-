<?php
/**
 * Генератор изображений-заглушек для сайта «Красивое железо».
 * Создаёт тёмные «чертёжные» плейсхолдеры (jpg + webp) с именем файла
 * и подписью — что именно нужно снять. Заменяются реальными фото 1:1 по имени.
 *
 * Запуск:  php scripts/make-placeholders.php
 */

declare(strict_types=1);

$root = dirname(__DIR__);
$font = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
$fontBold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
if (!is_file($font)) {
    fwrite(STDERR, "Нет шрифта DejaVuSans.ttf\n");
    exit(1);
}

/** @return array{0:int,1:int,2:int} */
function hex2rgb(string $hex): array
{
    return [
        (int) hexdec(substr($hex, 1, 2)),
        (int) hexdec(substr($hex, 3, 2)),
        (int) hexdec(substr($hex, 5, 2)),
    ];
}

function makePlaceholder(
    string $path,
    int $w,
    int $h,
    string $caption,
    string $font,
    string $fontBold,
    bool $spark = false
): void {
    $im = imagecreatetruecolor($w, $h);
    imagealphablending($im, true);

    [$r, $g, $b] = hex2rgb('#F4F4F1');
    $bg = imagecolorallocate($im, $r, $g, $b);
    imagefilledrectangle($im, 0, 0, $w, $h, $bg);

    // Мягкий вертикальный градиент — бумага под чертёж.
    for ($y = 0; $y < $h; $y++) {
        $t = $y / max(1, $h - 1);
        $v = (int) round(244 + 6 * (1 - $t));
        $c = imagecolorallocate($im, min(255, $v + 2), min(255, $v + 1), min(255, $v - 2));
        imageline($im, 0, $y, $w, $y, $c);
    }

    // Накал по диагонали — только для hero-подобных кадров.
    if ($spark) {
        for ($i = 0; $i < 42; $i++) {
            $alpha = 112 + (int) ($i / 3);
            if ($alpha > 127) {
                $alpha = 127;
            }
            $c = imagecolorallocatealpha($im, 180, 74, 30, $alpha);
            $x0 = (int) ($w * 0.18) + $i * 3;
            imageline($im, $x0, $h, $x0 + (int) ($w * 0.35), 0, $c);
        }
    }

    // Чертёжная сетка.
    [$lr, $lg, $lb] = hex2rgb('#D8D8D4');
    $grid = imagecolorallocatealpha($im, $lr, $lg, $lb, 30);
    $step = 48;
    for ($x = $step; $x < $w; $x += $step) {
        imageline($im, $x, 0, $x, $h, $grid);
    }
    for ($y = $step; $y < $h; $y += $step) {
        imageline($im, 0, $y, $w, $y, $grid);
    }

    // Рамка и угловые метки.
    $line = imagecolorallocate($im, $lr - 14, $lg - 14, $lb - 14);
    imagerectangle($im, 0, 0, $w - 1, $h - 1, $line);
    $tick = 22;
    $accent = imagecolorallocate($im, 180, 74, 30);
    foreach ([[0, 0, 1, 1], [$w - 1, 0, -1, 1], [0, $h - 1, 1, -1], [$w - 1, $h - 1, -1, -1]] as $cor) {
        [$cx, $cy, $dx, $dy] = $cor;
        imageline($im, $cx, $cy, $cx + $dx * $tick, $cy, $accent);
        imageline($im, $cx, $cy, $cx, $cy + $dy * $tick, $accent);
    }

    // Перекрестие в центре.
    $cross = imagecolorallocatealpha($im, 107, 112, 118, 85);
    imageline($im, (int) ($w / 2) - 16, (int) ($h / 2), (int) ($w / 2) + 16, (int) ($h / 2), $cross);
    imageline($im, (int) ($w / 2), (int) ($h / 2) - 16, (int) ($w / 2), (int) ($h / 2) + 16, $cross);

    // Подписи.
    $muted = imagecolorallocate($im, 107, 112, 118);
    $paper = imagecolorallocate($im, 18, 19, 22);
    $size = max(11, min(20, (int) round($w / 46)));
    $name = basename($path);

    imagettftext($im, $size, 0, 26, 42, $paper, $fontBold, $name);
    // Подпись переносим по словам, чтобы влезала в кадр.
    $maxChars = max(18, (int) ($w / ($size * 0.62)));
    $lines = explode("\n", wordwrap($caption, $maxChars, "\n", true));
    $y = 42 + (int) ($size * 2.1);
    foreach ($lines as $ln) {
        imagettftext($im, (int) round($size * 0.8), 0, 26, $y, $muted, $font, $ln);
        $y += (int) ($size * 1.7);
    }
    imagettftext($im, (int) round($size * 0.75), 0, 26, $h - 24, $muted, $font, "{$w}×{$h} · ЗАМЕНИТЬ РЕАЛЬНЫМ ФОТО");

    @mkdir(dirname($path), 0775, true);
    imagejpeg($im, $path, 82);
    imagewebp($im, preg_replace('/\.jpg$/', '.webp', $path), 80);
    imagedestroy($im);
}

/**
 * Полный реестр изображений сайта.
 * [путь, ширина, высота, что снять, накал]
 */
$images = [
    // --- Ключевые кадры ---
    ['images/hero-sparks.jpg', 1920, 1080, 'HERO. Сноп искр из-под лазерной головы, крупно, тёмный цех, выдержка 1/125, без людей в кадре.', true],
    ['images/hero-sparks-mobile.jpg', 900, 1200, 'HERO вертикальный для мобильной версии. Тот же кадр в портретной компоновке.', true],
    ['images/og-cover.jpg', 1200, 630, 'Обложка для соцсетей: искры + логотип + «Лазерная резка 0,5-20 мм. Магнитогорск».', true],

    // --- Два потока ---
    ['images/flow-private.jpg', 1000, 1100, 'ЧАСТНИКУ: готовые кованые ворота с лазерным узором на объекте, дневной свет.', false],
    ['images/flow-business.jpg', 1000, 1100, 'ЦЕХУ: стопка нарезанных по чертежу деталей на паллете, рядом распечатка DXF.', false],

    // --- Услуги ---
    ['images/proc-cutting.jpg', 1400, 1000, 'Станок лазерной резки в работе: голова над листом, видна траектория реза.', true],
    ['images/proc-powder.jpg', 1400, 1000, 'Порошковая окраска: оператор с пистолетом, деталь на подвеске, облако порошка.', false],
    ['images/proc-welding.jpg', 1400, 1000, 'Сварка: дуга полуавтомата крупным планом, маска сварщика в отражении.', true],

    // --- Порошковая окраска: шаги ---
    ['images/powder-01-prep.jpg', 900, 700, 'Шаг 1: обезжиривание и подготовка металла в ванне.', false],
    ['images/powder-02-spray.jpg', 900, 700, 'Шаг 2: напыление порошка в камере.', false],
    ['images/powder-03-oven.jpg', 900, 700, 'Шаг 3: печь полимеризации, детали на конвейере.', false],
    ['images/powder-04-done.jpg', 900, 700, 'Шаг 4: готовая окрашенная деталь, фактура покрытия крупно.', false],

    // --- Лазерная резка: материалы ---
    ['images/mat-steel.jpg', 800, 600, 'Лист чёрной стали с резаными кромками, крупно.', false],
    ['images/mat-inox.jpg', 800, 600, 'Нержавейка: зеркальная кромка после реза.', false],
    ['images/mat-zinc.jpg', 800, 600, 'Оцинковка: характерный кристаллический рисунок листа.', false],
    ['images/mat-alu.jpg', 800, 600, 'Алюминий: матовый лист с нарезанными отверстиями.', false],

    // --- Сварка ---
    ['images/weld-mig.jpg', 900, 700, 'Полуавтомат MIG/MAG: шов на толстом металле.', true],
    ['images/weld-tig.jpg', 900, 700, 'TIG по нержавейке: аккуратный «чешуйчатый» шов.', false],
    ['images/weld-frame.jpg', 900, 700, 'Сварная рама/каркас в сборе на верстаке.', false],

    // --- Контакты ---
    ['images/map-static.jpg', 1200, 800, 'Скриншот карты 2ГИС с меткой: ул. Советской Армии, 2, Магнитогорск.', false],
    ['images/shop-front.jpg', 1200, 800, 'Вход в цех / вывеска на здании — чтобы клиент узнал место.', false],
];

// Галерея работ размечена прямо в HTML (блоки .slot), файлы-заглушки не нужны:
// как появятся снимки, они лягут в images/works/ по инструкции в raboty.html.

foreach ($images as [$rel, $w, $h, $cap, $spark]) {
    makePlaceholder("{$root}/{$rel}", $w, $h, $cap, $font, $fontBold, $spark);
    echo "ok  {$rel}\n";
}

echo "\nГотово: " . count($images) . " изображений (jpg + webp).\n";
