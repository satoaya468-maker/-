#!/usr/bin/env python3
"""Сборка сайта «Мастер Макс» в ОДИН html-файл.

Все шесть страниц складываются в один документ и переключаются по хэшу
(#uslugi, #ceny, …). Стили, шрифты, скрипты, фотографии и видео вшиты внутрь.
Такой файл открывается двойным кликом откуда угодно — переходы по меню
работают, даже если рядом нет ни одного другого файла.

Запуск из корня репозитория:  python3 scripts/build-single.py [файл-вывода]
Нужен интернет: шрифты забираются с Google Fonts.
"""

import importlib.util
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# переиспользуем инлайнер из соседнего скрипта (имя с дефисом — только так)
spec = importlib.util.spec_from_file_location("build_offline", ROOT / "scripts" / "build-offline.py")
offline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(offline)

PAGES = [
    ("index.html", "glavnaya", "Мастер Макс — шиномонтаж в Магнитогорске · круглосуточный выезд"),
    ("uslugi.html", "uslugi", "Услуги — Мастер Макс"),
    ("ceny.html", "ceny", "Цены — Мастер Макс"),
    ("otzyvy.html", "otzyvy", "Отзывы — Мастер Макс"),
    ("o-nas.html", "o-nas", "О мастерской — Мастер Макс"),
    ("contakty.html", "contakty", "Контакты — Мастер Макс"),
]
ROUTES = {name: route for name, route, _ in PAGES}

ROUTER_JS = """
(function () {
  'use strict';

  var pages = [].slice.call(document.querySelectorAll('[data-page]'));
  var header = document.querySelector('.site-header');
  var links = [].slice.call(document.querySelectorAll('.nav-link'));

  function show(route, anchor) {
    var known = pages.some(function (p) { return p.getAttribute('data-page') === route; });
    if (!known) route = 'glavnaya';

    pages.forEach(function (p) {
      var on = p.getAttribute('data-page') === route;
      p.hidden = !on;
      if (on && p.getAttribute('data-title')) document.title = p.getAttribute('data-title');
    });

    header.classList.toggle('site-header--overlay', route === 'glavnaya');
    header.classList.remove('is-open');

    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + route;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    });

    if (anchor) {
      var target = document.getElementById(anchor);
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    window.scrollTo(0, 0);
  }

  function fromHash() {
    var raw = (location.hash || '#glavnaya').slice(1).split('~');
    show(raw[0] || 'glavnaya', raw[1]);
  }

  // «Заказать» у услуги подставляет её в форму заявки
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('[data-usluga]') : null;
    if (!link) return;
    var select = document.getElementById('z-service');
    if (!select) return;
    var wanted = link.getAttribute('data-usluga').toLowerCase().split(' ')[0];
    [].slice.call(select.options).forEach(function (option) {
      if (option.textContent.toLowerCase().indexOf(wanted) === 0) select.value = option.value || option.textContent;
    });
  });

  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
"""


def route_links(html):
    """uslugi.html?usluga=X#zayavka → #uslugi~zayavka (+ data-usluga)"""
    def repl(match):
        page, query, anchor = match.group(1), match.group(2) or "", match.group(3) or ""
        route = ROUTES.get(page + ".html")
        if not route:
            return match.group(0)
        href = "#" + route + ("~" + anchor.lstrip("#") if anchor else "")
        usluga = re.search(r"usluga=([^&\"]+)", query)
        extra = ""
        if usluga:
            from urllib.parse import unquote
            extra = ' data-usluga="' + unquote(usluga.group(1)) + '"'
        return 'href="' + href + '"' + extra

    return re.sub(r'href="(index|uslugi|ceny|otzyvy|o-nas|contakty)\.html(\?[^"#]*)?(#[^"]*)?"', repl, html)


def main():
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "master-max-sait.html")

    print("Забираю шрифты с Google Fonts…")
    styles = (ROOT / "styles.css").read_text(encoding="utf-8")
    styles = re.sub(r"@import url\('https://fonts\.googleapis\.com[^']+'\);", "", styles)
    styles = offline.build_font_css() + "\n" + styles

    app_js = (ROOT / "app.js").read_text(encoding="utf-8")
    reviews_js = (ROOT / "reviews.js").read_text(encoding="utf-8")

    source = (ROOT / "index.html").read_text(encoding="utf-8")
    header = re.search(r"<header class=\"site-header.*?</header>", source, re.S).group(0)
    footer = re.search(r"<footer class=\"site-footer\".*?</footer>", source, re.S).group(0)

    blocks = []
    for filename, route, title in PAGES:
        page = (ROOT / filename).read_text(encoding="utf-8")
        main_html = re.search(r"<main>(.*?)</main>", page, re.S).group(1)
        blocks.append(
            f'<div class="page" data-page="{route}" data-title="{title}"'
            f'{"" if route == "glavnaya" else " hidden"}>\n<main>{main_html}</main>\n</div>'
        )

    document = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{PAGES[0][2]}</title>
<meta name="description" content="Шиномонтажная мастерская «Мастер Макс», ул. Сталеваров, 13а, Магнитогорск. Шиномонтаж R13–R22, балансировка, ремонт проколов, правка дисков. Круглосуточный выездной шиномонтаж.">
<style>
{styles}
</style>
</head>
<body>

{header}

{chr(10).join(blocks)}

{footer}

<script>
{app_js}
</script>
<script>
{reviews_js}
</script>
<script>
{ROUTER_JS}
</script>
</body>
</html>
"""

    document = route_links(document)
    document = offline.inline_media(document)
    out.write_text(document, encoding="utf-8")
    print(f"Готово: {out} — {round(len(document.encode()) / 1024 / 1024, 1)} МБ")


if __name__ == "__main__":
    main()
