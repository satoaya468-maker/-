#!/usr/bin/env python3
"""
Готовит изображения проекта: из каждого PNG в assets/img/ делает .webp
и растровый фолбэк (.jpg, а для картинок с прозрачностью — исходный .png),
и записывает manifest.json с размерами, чтобы шаблон мог проставить
явные width/height и не вызывать сдвиг вёрстки.

    python3 tools/build-images.py

Скрипт идемпотентный: если исходника нет, он просто ничего не делает,
и сборка проходит с плашкой-заглушкой на месте изображения.
"""
import json, os, sys

SRC = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
SRC = os.path.normpath(SRC)

try:
    from PIL import Image
except ImportError:
    print("Pillow не установлен: pip install pillow. Изображения не пересобраны.", file=sys.stderr)
    sys.exit(0)

MANIFEST = os.path.join(SRC, "manifest.json")
try:
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
except (OSError, ValueError):
    manifest = {}

for fn in sorted(os.listdir(SRC)):
    if not fn.lower().endswith(".png"):
        continue
    name = os.path.splitext(fn)[0]
    path = os.path.join(SRC, fn)
    im = Image.open(path)
    w, h = im.size
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)

    im.convert("RGBA" if has_alpha else "RGB").save(
        os.path.join(SRC, name + ".webp"), "WEBP", quality=82, method=6)

    if has_alpha:
        fallback = name + ".png"          # прозрачность важнее веса
    else:
        im.convert("RGB").save(os.path.join(SRC, name + ".jpg"), "JPEG",
                               quality=84, optimize=True, progressive=True)
        fallback = name + ".jpg"

    manifest[name] = {"w": w, "h": h, "fallback": fallback, "alpha": has_alpha}
    print(f"{fn}: {w}×{h} -> {name}.webp + {fallback}")

with open(os.path.join(SRC, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print(f"manifest.json: {len(manifest)} изображений")
