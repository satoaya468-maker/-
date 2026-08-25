#!/usr/bin/env python3
"""
Собирает обложку для соцсетей: 1200×630, /assets/img/og-cover.jpg.

Ссылку на сервис пересылают в WhatsApp и Telegram — без og:image она
разворачивается голым текстом и теряет клик. Обложка повторяет первый
экран: тёмно-зелёное поле, заголовок, город, телефон и кадр комплекта.

Шрифт берётся из TTF рядом со скриптом: woff2 из assets/fonts Pillow
не читает, а тянуть converter ради одной картинки незачем.

    python3 tools/build-og.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, "..", "assets", "img"))
W, H = 1200, 630
GREEN_DARK = (0x0A, 0x2F, 0x1C)
PAPER = (0xFF, 0xFF, 0xFF)
MIST = (0xBF, 0xD8, 0xC9)


def font(weight, size):
    path = os.path.join(HERE, "assets", f"golos-{weight}.ttf")
    return ImageFont.truetype(path, size)


def main():
    im = Image.new("RGB", (W, H), GREEN_DARK)
    d = ImageDraw.Draw(im)

    kit = os.path.join(IMG, "gbo-kit-diagonal.webp")
    if os.path.exists(kit):
        k = Image.open(kit).convert("RGBA")
        # У этого кадра снят фон и убрана контактная тень — он и рассчитан
        # на тёмно-зелёное поле, поэтому кладётся напрямую, без подложки.
        scale = 560 / k.height
        k = k.resize((round(k.width * scale), 560), Image.LANCZOS)
        im.paste(k, (W - k.width - 24, 46), k)

    d.text((72, 92), "ГБО-АВТО", font=font(700, 34), fill=MIST)
    d.text((72, 168), "Установка ГБО", font=font(700, 76), fill=PAPER)
    d.text((72, 254), "в Златоусте", font=font(700, 76), fill=PAPER)
    d.text((72, 372), "Автосервис ГБО · за один рабочий день", font=font(500, 30), fill=MIST)
    d.text((72, 414), "Гарантия год · документы в ГИБДД под ключ", font=font(500, 30), fill=MIST)
    d.text((72, 496), "+7 (908) 819-63-69", font=font(700, 44), fill=PAPER)
    d.text((72, 556), "ул. Средняя-Ветлужская, 38", font=font(500, 26), fill=MIST)

    # JPEG, а не PNG: краулеры соцсетей тянут обложку на каждый расшар,
    # а фотография в PNG весит втрое больше без разницы на глаз.
    out = os.path.join(IMG, "og-cover.jpg")
    im.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"{out} — {W}×{H}, {os.path.getsize(out) // 1024} КБ")


if __name__ == "__main__":
    main()
