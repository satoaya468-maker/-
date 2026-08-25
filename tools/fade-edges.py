#!/usr/bin/env python3
"""
Гасит тень предметного кадра к правому и нижнему краю кадра.

Кадр снят на белом, тень уходит вправо-вниз и обрезается рамкой. На белой
странице такой обрыв читается не как тень, а как серая подложка под
картинкой. Растворяя тень к тем краям, где её обрезали, мы оставляем и саму
тень, и её направление, но убираем прямоугольник.

Осветляем только фон: он светлый, нейтральный по цвету, гладкий и связан с
рамкой заливкой. Предмет эти признаки не проходит и остаётся нетронутым.

    python3 tools/fade-edges.py assets/img/gbo-kit-hero.webp
"""
import sys
from collections import deque
from PIL import Image, ImageChops, ImageFilter

LUMA_MIN = 150   # фон и тень светлее этого, баллон и металл заметно темнее
SAT_MAX = 18     # и почти нейтральны по цвету
MAD_MAX = 3      # и гладкие: у деталей на границе есть контур
BAND = 210       # ширина полосы растворения от края, px


def local_mad(gray, radius=2):
    mean = gray.filter(ImageFilter.BoxBlur(radius))
    dev = ImageChops.difference(gray, mean)
    return dev.filter(ImageFilter.BoxBlur(radius))


def smoothstep(t):
    t = 0.0 if t < 0 else 1.0 if t > 1 else t
    return t * t * (3 - 2 * t)


def fade(im, band=BAND):
    im = im.convert("RGB")
    w, h = im.size
    px = im.load()
    mad = local_mad(im.convert("L")).load()

    def is_bg(x, y):
        r, g, b = px[x, y]
        return (min(r, g, b) >= LUMA_MIN
                and max(r, g, b) - min(r, g, b) <= SAT_MAX
                and mad[x, y] <= MAD_MAX)

    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))

    region = list(q)
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if 0 <= a < w and 0 <= b < h and not seen[b * w + a] and is_bg(a, b):
                seen[b * w + a] = 1
                region.append((a, b))
                q.append((a, b))

    changed = 0
    for x, y in region:
        t = max(smoothstep((x - (w - band)) / band),
                smoothstep((y - (h - band)) / band))
        if t <= 0:
            continue
        r, g, b = px[x, y]
        nr = round(r + (255 - r) * t)
        ng = round(g + (255 - g) * t)
        nb = round(b + (255 - b) * t)
        if (nr, ng, nb) != (r, g, b):
            px[x, y] = (nr, ng, nb)
            changed += 1
    return im, len(region), changed


if __name__ == "__main__":
    path = sys.argv[1]
    out, region, changed = fade(Image.open(path))
    out.save(path, "WEBP", quality=82, method=6)
    print(f"{path}: фон {region} px, растворено {changed} px")
