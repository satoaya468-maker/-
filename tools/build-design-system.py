#!/usr/bin/env python3
"""
Собирает docs/design-system.tpl.html в самодостаточный HTML: вшивает
шрифты из assets/fonts как data-URI, чтобы страницу можно было открыть
или опубликовать без единого внешнего запроса.

    python3 tools/build-design-system.py            # -> docs/design-system.html
"""
import base64, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "assets", "fonts")
FACES = [("Golos Text", 400, "golos-text-400.woff2"), ("Golos Text", 500, "golos-text-500.woff2"),
         ("Golos Text", 600, "golos-text-600.woff2"), ("Golos Text", 700, "golos-text-700.woff2")]

css = []
for family, weight, filename in FACES:
    with open(os.path.join(FONTS, filename), "rb") as fh:
        b64 = base64.b64encode(fh.read()).decode()
    css.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;"
               "font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}"
               % (family, weight, b64))

tpl = open(os.path.join(ROOT, "docs", "design-system.tpl.html")).read()
out = os.path.join(ROOT, "docs", "design-system.html")
open(out, "w").write(tpl.replace("__FONTS__", "\n".join(css)))
print("%s — %.0f КБ" % (out, os.path.getsize(out) / 1024))
