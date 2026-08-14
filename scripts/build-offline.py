#!/usr/bin/env python3
"""Сборка автономной версии сайта «Мастер Макс».

Каждая страница складывается в один самодостаточный HTML: стили, скрипты,
шрифты (woff2), фотографии и видео — всё в base64 внутри файла. Такой файл
открывается двойным кликом из любой папки, работает без интернета и не
требует соседних папок images/ и video/.

Запуск из корня репозитория:  python3 scripts/build-offline.py [папка-вывода]
Нужен интернет: шрифты забираются с Google Fonts и встраиваются в CSS.
"""

import base64
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "uslugi.html", "ceny.html", "otzyvy.html", "o-nas.html", "contakty.html"]
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

# Начертания, которые реально используются в styles.css
FAMILIES = {
    "Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400": [("normal", "400"), ("normal", "500"), ("italic", "400")],
    "Inter+Tight:wght@400;500;600": [("normal", "400"), ("normal", "500"), ("normal", "600")],
    "JetBrains+Mono:wght@500": [("normal", "500")],
}
SUBSETS = {"cyrillic", "latin"}


def fetch(url):
    return subprocess.run(["curl", "-sSL", url, "-H", f"User-Agent: {UA}"], capture_output=True, check=True).stdout


def build_font_css():
    faces = []
    for family, allowed in FAMILIES.items():
        css = fetch(f"https://fonts.googleapis.com/css2?family={family}&display=swap").decode()
        blocks = re.split(r"(/\* [a-z-]+ \*/)", css)
        for i in range(1, len(blocks), 2):
            subset = blocks[i].strip("/*").strip("* ").strip()
            if subset not in SUBSETS:
                continue
            for face in re.findall(r"@font-face\s*\{[^}]+\}", blocks[i + 1]):
                style = re.search(r"font-style:\s*([^;]+);", face).group(1).strip()
                weight = re.search(r"font-weight:\s*([^;]+);", face).group(1).strip()
                if (style, weight) not in allowed:
                    continue
                url = re.search(r"url\((https://[^)]+\.woff2)\)", face).group(1)
                b64 = base64.b64encode(fetch(url)).decode()
                faces.append(face.replace(f"url({url}) format('woff2')",
                                          f"url(data:font/woff2;base64,{b64}) format('woff2')"))
    return "\n".join(faces)


MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
        ".webp": "image/webp", ".mp4": "video/mp4", ".webm": "video/webm"}


def as_data_uri(rel_path):
    """./images/work-1.jpg → data:image/jpeg;base64,… (None, если файла нет)"""
    path = ROOT / rel_path.lstrip("./")
    if not path.exists():
        return None
    mime = MIME.get(path.suffix.lower())
    if not mime:
        return None
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def inline_media(html):
    """Фото, постер и оба формата видео вшиваются в страницу.

    Вшивать webm вместе с mp4 обязательно: когда mp4 приходит как data-URI,
    браузер без поддержки H.264 уже не откатывается на следующий <source>,
    поэтому запасной формат тоже должен лежать внутри файла.
    """
    def repl(match):
        attr, value = match.group(1), match.group(2)
        uri = as_data_uri(value)
        return f'{attr}="{uri}"' if uri else match.group(0)

    return re.sub(r'(src|poster)="(\./(?:images|video)/[^"]+)"', repl, html)


def inline(page_html, styles, scripts):
    html = page_html
    html = re.sub(r'\s*<link rel="preconnect"[^>]*>', "", html)
    html = re.sub(r'\s*<script src="https://cdn\.tailwindcss\.com"></script>', "", html)
    html = re.sub(r"\s*<script>\s*if \(window\.tailwind\).*?</script>", "", html, flags=re.S)
    html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{styles}\n</style>")
    for name, code in scripts.items():
        html = html.replace(f'<script src="{name}"></script>', f"<script>\n{code}\n</script>")
    return inline_media(html)


def main():
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "offline")
    out.mkdir(parents=True, exist_ok=True)

    print("Забираю шрифты с Google Fonts…")
    font_css = build_font_css()

    styles = (ROOT / "styles.css").read_text(encoding="utf-8")
    styles = re.sub(r"@import url\('https://fonts\.googleapis\.com[^']+'\);", "", styles)
    styles = font_css + "\n" + styles

    scripts = {name: (ROOT / name).read_text(encoding="utf-8") for name in ("app.js", "reviews.js")}

    for page in PAGES:
        html = inline((ROOT / page).read_text(encoding="utf-8"), styles, scripts)
        (out / page).write_text(html, encoding="utf-8")
        print(f"  {page:14} {round(len(html.encode()) / 1024):5} КБ")

    print(f"Готово: {out}")


if __name__ == "__main__":
    main()
