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

FORCE = "--force" in sys.argv[1:]   # перезаписать уже готовые файлы

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

# Растровый фолбэк .png, который скрипт сам сгенерировал для .webp-исходника,
# нельзя принимать за исходник на следующем прогоне: иначе .webp будет
# пересобран из него и потеряет качество. Такие имена помечены src == "webp".
generated = {n for n, m in manifest.items() if m.get("src") == "webp"}

names = {}
for fn in sorted(os.listdir(SRC)):
    ext = os.path.splitext(fn)[1].lower()
    if ext not in (".png", ".webp"):
        continue
    name = os.path.splitext(fn)[0]
    if ext == ".png" and name in generated:
        continue
    # PNG-исходник имеет приоритет: .webp тогда пересобирается из него.
    if ext == ".png" or name not in names:
        names[name] = fn

for name, fn in sorted(names.items()):
    path = os.path.join(SRC, fn)
    im = Image.open(path)
    w, h = im.size
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)

    def stale(target):
        """Готовые файлы не трогаем: пережатие уже сжатого — потеря качества."""
        return FORCE or not os.path.exists(os.path.join(SRC, target))

    if fn.lower().endswith(".png") and stale(name + ".webp"):
        im.convert("RGBA" if has_alpha else "RGB").save(
            os.path.join(SRC, name + ".webp"), "WEBP", quality=82, method=6)
    # Если исходник уже .webp, он собран заранее под нужный размер и
    # пережимать его незачем — нужен только растровый фолбэк.

    if has_alpha:
        fallback = name + ".png"          # прозрачность важнее веса
        if not fn.lower().endswith(".png") and stale(fallback):
            # Исходник .webp — растровый фолбэк надо записать самим. Полноцветный
            # PNG весит в разы больше самого .webp, а достаётся только браузерам
            # без поддержки webp, поэтому фолбэк квантуем.
            im.convert("RGBA").quantize(
                colors=256, method=Image.Quantize.FASTOCTREE
            ).save(os.path.join(SRC, fallback), "PNG", optimize=True)
    else:
        fallback = name + ".jpg"
        if stale(fallback):
            im.convert("RGB").save(os.path.join(SRC, fallback), "JPEG",
                                   quality=84, optimize=True, progressive=True)

    manifest[name] = {"w": w, "h": h, "fallback": fallback, "alpha": has_alpha,
                      "src": "webp" if fn.lower().endswith(".webp") else "png"}
    print(f"{fn}: {w}\u00d7{h} -> {name}.webp + {fallback}")

with open(os.path.join(SRC, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print(f"manifest.json: {len(manifest)} изображений")
