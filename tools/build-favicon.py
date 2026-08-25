#!/usr/bin/env python3
"""
Собирает иконки сайта из assets/img/favicon.svg.

Робот Яндекса ищет иконку прежде всего по адресу /favicon.ico в корне
сайта, поэтому одного SVG в подпапке мало: без корневого .ico в выдаче
рядом с доменом остаётся серый глобус.

Кладёт в static/ (копируется в корень сборки):
    favicon.ico          16/32/48 в одном файле — для поисковых роботов
    favicon-96.png       запасной растровый вариант
    apple-touch-icon.png 180×180 для иконки на домашнем экране

    python3 tools/build-favicon.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
OUT = os.path.join(ROOT, "static")
GREEN = (0x00, 0x7D, 0x3C)
PAPER = (0xFF, 0xFF, 0xFF)


def draw(size, radius_ratio=7 / 32, pad_ratio=0.0):
    """Рисуем крупно и уменьшаем: у Pillow нет сглаживания у скруглений."""
    S = size * 8
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    p = round(S * pad_ratio)
    d.rounded_rectangle([p, p, S - 1 - p, S - 1 - p],
                        radius=round(S * radius_ratio), fill=GREEN)

    # «Г» — единственный знак, который читается в 16 пикселей.
    font = ImageFont.truetype(os.path.join(HERE, "assets", "golos-700.ttf"),
                              round(S * 0.72))
    box = d.textbbox((0, 0), "Г", font=font)
    d.text(((S - (box[2] - box[0])) / 2 - box[0],
            (S - (box[3] - box[1])) / 2 - box[1]), "Г", font=font, fill=PAPER)
    return im.resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)

    ico = os.path.join(OUT, "favicon.ico")
    draw(64).save(ico, format="ICO",
                  sizes=[(16, 16), (32, 32), (48, 48)])

    draw(96).save(os.path.join(OUT, "favicon-96.png"), "PNG", optimize=True)

    # На домашнем экране iOS скругляет сам, поэтому квадрат без радиуса.
    draw(180, radius_ratio=0).save(os.path.join(OUT, "apple-touch-icon.png"),
                                   "PNG", optimize=True)

    for f in sorted(os.listdir(OUT)):
        print(f"  static/{f} — {os.path.getsize(os.path.join(OUT, f))} байт")


if __name__ == "__main__":
    main()
