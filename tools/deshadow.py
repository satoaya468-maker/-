#!/usr/bin/env python3
"""
Убирает мягкую контактную тень с предметного кадра, снятого на белом.

На белом фоне такая тень читается естественно, но на тёмной карточке она
превращается в светлое пятно вокруг деталей. Тень отличается от металла тем,
что она светлая, нейтральная по цвету и гладкая (почти нет локального
контраста), и при этом примыкает к уже прозрачному фону. Заливкой от фона
по этим трём признакам она снимается, а детали остаются.

    python3 tools/deshadow.py assets/img/gbo-kit-diagonal.webp
"""
import sys
from collections import deque
from PIL import Image, ImageChops, ImageFilter

LUMA_MIN = 88      # тень светлее этого (баллон заметно темнее)
SAT_MAX = 22       # и почти нейтральна по цвету
MAD_MAX = 2        # и гладкая: у деталей на границе есть контур
FEATHER = 1.0
MIN_ISLAND = 5000  # обрывки меньше этого — мусор от границы тени


def local_mad(gray, radius=2):
    """Среднее абсолютное отклонение в окне — мера локального контраста."""
    mean = gray.filter(ImageFilter.BoxBlur(radius))
    dev = ImageChops.difference(gray, mean)
    return dev.filter(ImageFilter.BoxBlur(radius))


def deshadow(im):
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    mad = local_mad(im.convert("L")).load()

    def is_shadow(x, y):
        r, g, b, a = px[x, y]
        return (min(r, g, b) >= LUMA_MIN
                and max(r, g, b) - min(r, g, b) <= SAT_MAX
                and mad[x, y] <= MAD_MAX)

    seen = bytearray(w * h)
    q = deque()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] < 40 and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))

    hit = []
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if 0 <= a < w and 0 <= b < h and not seen[b * w + a]:
                # Полупрозрачная кромка растушёвки — тоже часть фона,
                # иначе заливка не дотянется до самой тени.
                if px[a, b][3] < 250 or is_shadow(a, b):
                    seen[b * w + a] = 1
                    if px[a, b][3] >= 40:
                        hit.append((a, b))
                    q.append((a, b))

    alpha = im.split()[3]
    ap = alpha.load()
    for x, y in hit:
        ap[x, y] = 0

    # Размыкание: тонкие волоски по краю снятой тени уже, чем любая реальная
    # деталь кадра, поэтому эрозия с последующей дилатацией убирает их одни.
    opened = alpha.point(lambda v: 255 if v >= 40 else 0)
    opened = opened.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    op = opened.load()
    for y in range(h):
        for x in range(w):
            if not op[x, y]:
                ap[x, y] = 0

    # По краю тени остаются мелкие обрывки контура: они не примыкают к предмету
    # и на тёмном фоне читаются как царапины. Оставляем только крупные области.
    seen = bytearray(w * h)
    islands = 0
    for y0 in range(h):
        for x0 in range(w):
            if ap[x0, y0] < 40 or seen[y0 * w + x0]:
                continue
            seen[y0 * w + x0] = 1
            stack = [(x0, y0)]
            comp = []
            while stack:
                cx, cy = stack.pop()
                comp.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    a, b = cx + dx, cy + dy
                    if 0 <= a < w and 0 <= b < h and not seen[b * w + a] and ap[a, b] >= 40:
                        seen[b * w + a] = 1
                        stack.append((a, b))
            if len(comp) < MIN_ISLAND:
                islands += len(comp)
                for cx, cy in comp:
                    ap[cx, cy] = 0

    alpha = alpha.filter(ImageFilter.GaussianBlur(FEATHER))
    im.putalpha(alpha)
    return im, len(hit), islands


if __name__ == "__main__":
    path = sys.argv[1]
    src = Image.open(path)
    out, n, islands = deshadow(src)
    out.save(path, "WEBP", quality=80, method=6)
    print(f"{path}: снято {n} пикселей тени и {islands} пикселей обрывков")
