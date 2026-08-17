#!/usr/bin/env python3
"""
Сборщик страниц сайта «Красивое железо».

Зачем: шапка, подвал, мобильный док и лайтбокс одинаковы на всех страницах.
Держать их в семи файлах руками — гарантированно разъедется. Скрипт собирает
готовые статические .html из общего каркаса и содержимого в scripts/parts/.

Итог — обычные HTML-файлы без зависимостей: их и заливаем по FTP.
Скрипт нужен только при правке шапки/подвала.

    python3 scripts/build-pages.py
"""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTS = ROOT / "scripts" / "parts"

SITE = "https://krasivoe-zhelezo.ru"  # TODO: заменить на реальный домен
PHONE_HREF = "tel:+79097490000"       # TODO: реальный номер
PHONE_TEXT = "+7 909 749-XX-XX"
WA = "https://wa.me/79097490000"      # TODO: реальный номер
VK = "https://vk.com/"                # TODO: ссылка на группу ВКонтакте
MAIL = "stromilovm@mail.ru"

NAV = [
    ("lazernaya-rezka.html", "Лазерная резка"),
    ("poroshkovaya-okraska.html", "Порошковая окраска"),
    ("svarka.html", "Сварка"),
    ("raboty.html", "Работы"),
    ("kontakty.html", "Контакты"),
]

# --- Иконки (инлайн, чтобы не тащить лишние запросы) ------------------------
ICON_WA = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z'
           'm5.8 14.2c-.2.7-1.2 1.3-1.9 1.4-.5.1-1.2.2-3.5-.7-2.9-1.2-4.8-4.2-5-4.4-.1-.2-1.1-1.5-1.1-2.9 0-1.3.7-2 1-2.3'
           '.2-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.1c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 '
           '2.4 1.5.2.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l2 1c.3.1.4.2.5.3.1.2.1.7-.1 1.3Z"/></svg>')
ICON_PHONE = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 '
              '1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 '
              '3.6.1.4 0 .7-.2 1l-2.3 2.2Z"/></svg>')
ICON_UPLOAD = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 16V7.8l-3.6 3.6L6 10l6-6 6 6-1.4 1.4L13 7.8V16h-2Z'
               'm-6 4v-4h2v2h10v-2h2v4H5Z"/></svg>')


def head(page: dict) -> str:
    """Шапка документа: SEO, Open Graph, шрифты, JSON-LD."""
    canonical = f"{SITE}/{page['file']}" if page["file"] != "index.html" else f"{SITE}/"
    preload = ""
    if page.get("hero_image"):
        preload = (f'\n<link rel="preload" as="image" href="{page["hero_image"]}" '
                   f'type="image/webp" media="(min-width: 700px)">')

    jsonld = ""
    if page.get("jsonld"):
        jsonld = '\n<script type="application/ld+json">\n' + page["jsonld"].strip() + "\n</script>"

    return f"""<!DOCTYPE html>
<html lang="ru" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{page['title']}</title>
<meta name="description" content="{page['description']}">
<meta name="theme-color" content="#0A0A0B">
<!-- TODO: заменить домен на реальный (canonical, og:url, sitemap.xml, robots.txt, JSON-LD) -->
<link rel="canonical" href="{canonical}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Красивое железо">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="{page.get('og_title', page['title'])}">
<meta property="og:description" content="{page.get('og_description', page['description'])}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/images/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="images/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>{preload}
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">{jsonld}
</head>
"""


def header(current: str) -> str:
    def mark(href: str) -> str:
        return ' aria-current="page"' if href == current else ""

    links = "\n".join(
        '      <a href="{0}"{1}>{2}</a>'.format(href, mark(href), label)
        for href, label in NAV
    )
    menu_links = "\n".join(
        '  <a href="{0}"{1}><i>0{2}</i> {3}</a>'.format(href, mark(href), i + 1, label)
        for i, (href, label) in enumerate(NAV)
    )

    return f"""<body>
<a class="skip-link" href="#main">К содержимому</a>
<div class="page">

<header class="header">
  <div class="wrap header__inner">
    <a class="logo" href="index.html" aria-label="Красивое железо — на главную">
      <span class="logo__mark" aria-hidden="true">КЖ</span>
      <span class="logo__text">
        <span class="logo__name">Красивое железо</span>
        <span class="logo__sub">Магнитогорск</span>
      </span>
    </a>

    <nav class="nav" aria-label="Основная навигация">
{links}
    </nav>

    <!-- TODO ТЕЛЕФОН: заменить номер здесь, в меню, в подвале, в доке, в JSON-LD и в assets/js/main.js -->
    <a class="header__phone" href="{PHONE_HREF}">{PHONE_TEXT}</a>
    <a class="btn btn--spark header__cta" href="{'#raschet' if current == 'index.html' else 'index.html#raschet'}">Загрузить чертёж</a>

    <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Меню">
      <span></span>
    </button>
  </div>
</header>

<div class="menu" id="menu" data-open="false">
{menu_links}
  <div class="menu__foot">
    <a href="{PHONE_HREF}">{PHONE_TEXT}</a>
    <a href="mailto:{MAIL}">{MAIL}</a>
    <span>ул. Советской Армии, 2 · Магнитогорск</span>
  </div>
</div>

<main id="main">
"""


FOOTER = f"""</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <a class="logo" href="index.html" aria-label="Красивое железо — на главную">
          <span class="logo__mark" aria-hidden="true">КЖ</span>
          <span class="logo__text">
            <span class="logo__name">Красивое железо</span>
            <span class="logo__sub">Лазер · порошок · сварка</span>
          </span>
        </a>
        <p class="mt-sm text-muted text-small">
          Лазерная резка металла 0,5–20 мм, порошковая окраска и сварка в Магнитогорске.
          Расчёт по чертежу — от одного часа.
        </p>
      </div>

      <div>
        <h4>Услуги</h4>
        <ul>
          <li><a href="lazernaya-rezka.html">Лазерная резка</a></li>
          <li><a href="poroshkovaya-okraska.html">Порошковая окраска</a></li>
          <li><a href="svarka.html">Сварка</a></li>
          <li><a href="raboty.html">Работы</a></li>
        </ul>
      </div>

      <div>
        <h4>Связь</h4>
        <ul>
          <li><a href="{PHONE_HREF}">{PHONE_TEXT}</a></li>
          <li><a href="mailto:{MAIL}">{MAIL}</a></li>
          <li><a href="{WA}" target="_blank" rel="noopener">WhatsApp</a></li>
          <!-- TODO ССЫЛКА: вставить адрес группы ВКонтакте -->
          <li><a href="{VK}" target="_blank" rel="noopener">ВКонтакте</a></li>
        </ul>
      </div>

      <div>
        <h4>Цех</h4>
        <address>
          455038, Магнитогорск<br>
          ул. Советской Армии, 2, 1 этаж<br>
          Правобережный район<br>
          Работаем с 9:00
        </address>
        <p class="mt-sm"><a class="btn" href="kontakty.html">Как проехать</a></p>
      </div>
    </div>

    <div class="footer__bottom">
      <span>© <span data-year>2026</span> Красивое железо</span>
      <span>Магнитогорск · 4,9 в 2ГИС</span>
      <a href="politika.html">Политика конфиденциальности</a>
    </div>
  </div>
</footer>

<nav class="dock" aria-label="Быстрая связь">
  <a href="{PHONE_HREF}">{ICON_PHONE}Позвонить</a>
  <a href="{WA}" target="_blank" rel="noopener">{ICON_WA}WhatsApp</a>
  <a class="is-primary" href="index.html#raschet">{ICON_UPLOAD}Чертёж</a>
</nav>
"""

LIGHTBOX = """
<div class="lightbox" id="lightbox" data-open="false" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Просмотр работы">
  <div class="lightbox__bar">
    <span class="lightbox__count" id="lightbox-count">1 / 1</span>
    <button class="lightbox__btn" type="button" id="lightbox-prev" aria-label="Предыдущая работа">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 1.4 4 8l6.5 6.6 1.2-1.2L6.4 8l5.3-5.4z"/></svg>
    </button>
    <button class="lightbox__btn" type="button" id="lightbox-next" aria-label="Следующая работа">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 1.4 12 8l-6.5 6.6-1.2-1.2L9.6 8 4.3 2.6z"/></svg>
    </button>
    <button class="lightbox__btn" type="button" id="lightbox-close" aria-label="Закрыть просмотр">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.6 1.4 1.4 2.6 6.8 8l-5.4 5.4 1.2 1.2L8 9.2l5.4 5.4 1.2-1.2L9.2 8l5.4-5.4-1.2-1.2L8 6.8z"/></svg>
    </button>
  </div>
  <div class="lightbox__stage"><img id="lightbox-img" src="" alt=""></div>
  <div class="lightbox__foot">
    <span class="lightbox__tag" id="lightbox-tag"></span>
    <span class="lightbox__title" id="lightbox-title"></span>
  </div>
</div>
"""

TAIL = """
</div><!-- /.page -->

<script src="assets/js/main.js" defer></script>
</body>
</html>
"""

BUSINESS_LD = """
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "additionalType": "https://www.wikidata.org/wiki/Q1979607",
  "@id": "%(site)s/#business",
  "name": "Красивое железо",
  "description": "Лазерная резка металла 0,5–20 мм, порошковая окраска и сварка в Магнитогорске. Расчёт заказа от 1 часа.",
  "url": "%(site)s/",
  "image": "%(site)s/images/og-cover.jpg",
  "telephone": "+79097490000",
  "email": "stromilovm@mail.ru",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Советской Армии, 2, 1 этаж",
    "addressLocality": "Магнитогорск",
    "addressRegion": "Челябинская область",
    "postalCode": "455038",
    "addressCountry": "RU"
  },
  "areaServed": [
    { "@type": "City", "name": "Магнитогорск" },
    { "@type": "AdministrativeArea", "name": "Челябинская область" }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "ratingCount": "24",
    "reviewCount": "17"
  }
}
""" % {"site": SITE}


def service_ld(name: str, description: str, url: str) -> str:
    return """
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "%(name)s",
  "description": "%(description)s",
  "url": "%(site)s/%(url)s",
  "serviceType": "%(name)s",
  "areaServed": { "@type": "City", "name": "Магнитогорск" },
  "provider": {
    "@type": "LocalBusiness",
    "@id": "%(site)s/#business",
    "name": "Красивое железо",
    "telephone": "+79097490000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Советской Армии, 2, 1 этаж",
      "addressLocality": "Магнитогорск",
      "postalCode": "455038",
      "addressCountry": "RU"
    }
  }
}
""" % {"name": name, "description": description, "url": url, "site": SITE}


PAGES = [
    {
        "file": "index.html",
        "title": "Лазерная резка металла в Магнитогорске — расчёт за 1 час | Красивое железо",
        "description": "Лазерная резка металла 0,5–20 мм, порошковая окраска и сварка в Магнитогорске. "
                       "Пришлите чертёж DXF или фото — посчитаем за час. Рейтинг 4,9 в 2ГИС, ул. Советской Армии, 2.",
        "og_title": "Лазерная резка металла 0,5–20 мм в Магнитогорске. Расчёт за час",
        "og_description": "Чертёж DXF или фото из интернета — считаем за час. Резка, порошковая окраска, сварка. 4,9 в 2ГИС.",
        "hero_image": "images/hero-sparks.webp",
        "jsonld": BUSINESS_LD,
        "lightbox": True,
        "hours_todo": True,
    },
    {
        "file": "lazernaya-rezka.html",
        "title": "Лазерная резка металла Магнитогорск — 0,5–20 мм, расчёт за час | Красивое железо",
        "description": "Лазерная резка стали, нержавейки, оцинковки и алюминия толщиной 0,5–20 мм в Магнитогорске. "
                       "Принимаем DXF, DWG, PDF. Расчёт по чертежу от 1 часа.",
        "jsonld": service_ld(
            "Лазерная резка металла",
            "Резка стали, нержавейки, оцинковки и алюминия 0,5–20 мм по файлам DXF, DWG, PDF.",
            "lazernaya-rezka.html",
        ),
        "lightbox": False,
    },
    {
        "file": "poroshkovaya-okraska.html",
        "title": "Порошковая окраска металла в Магнитогорске — цвета RAL | Красивое железо",
        "description": "Порошковая окраска металлоконструкций в Магнитогорске: обезжиривание, напыление, "
                       "полимеризация в печи. Любой цвет по каталогу RAL, матовый и глянец.",
        "jsonld": service_ld(
            "Порошковая окраска металла",
            "Подготовка поверхности, напыление порошковой краски и полимеризация в печи. Цвета по каталогу RAL.",
            "poroshkovaya-okraska.html",
        ),
        "lightbox": False,
    },
    {
        "file": "svarka.html",
        "title": "Сварочные работы в Магнитогорске — полуавтомат и аргон | Красивое железо",
        "description": "Сварка металлоконструкций в Магнитогорске: полуавтомат MIG/MAG и аргон TIG. "
                       "Каркасы, рамы, ворота, лестницы — от резки до готового изделия в одном цехе.",
        "jsonld": service_ld(
            "Сварочные работы",
            "Сварка полуавтоматом и аргоном: каркасы, рамы, ворота, лестницы, ремонт металлоконструкций.",
            "svarka.html",
        ),
        "lightbox": False,
    },
    {
        "file": "raboty.html",
        "title": "Работы: ворота, лестницы, мангалы, вывески, резка по чертежу | Красивое железо",
        "description": "Фотографии выполненных работ: ворота и калитки, лестницы и перила, мангалы, вывески "
                       "и детали по чертежу. Лазерная резка и сварка металла в Магнитогорске.",
        "jsonld": None,
        "lightbox": True,
    },
    {
        "file": "kontakty.html",
        "title": "Контакты — Магнитогорск, ул. Советской Армии, 2 | Красивое железо",
        "description": "Адрес цеха: Магнитогорск, ул. Советской Армии, 2, 1 этаж, Правобережный район, 455038. "
                       "Телефон, WhatsApp, ВКонтакте, почта. Работаем с 9:00.",
        "jsonld": BUSINESS_LD,
        "lightbox": False,
        "hours_todo": True,
    },
    {
        "file": "politika.html",
        "title": "Политика конфиденциальности | Красивое железо",
        "description": "Как «Красивое железо» обрабатывает персональные данные, оставленные через форму на сайте.",
        "jsonld": None,
        "lightbox": False,
        "noindex": True,
    },
]

HOURS_COMMENT = """<!--
  TODO ЧАСЫ РАБОТЫ: известно только «с 9:00». Как узнаете время закрытия и
  выходные — вставьте блок внутрь JSON-LD ниже, сразу после "email":
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    "opens": "09:00",
    "closes": "18:00"
  }],
-->
"""


def build() -> None:
    # Форма расчёта одна на весь сайт: правится в scripts/parts/_form.html
    # и подставляется в каждую страницу по метке {{FORM}}.
    form = (PARTS / "_form.html").read_text(encoding="utf-8").rstrip()

    for page in PAGES:
        part = PARTS / (page["file"].replace(".html", "") + ".part.html")
        if not part.is_file():
            raise SystemExit(f"Нет файла содержимого: {part}")

        doc = head(page)
        if page.get("hours_todo"):
            doc = doc.replace('<script type="application/ld+json">', HOURS_COMMENT + '<script type="application/ld+json">')
        if page.get("noindex"):
            doc = doc.replace('<meta name="theme-color"', '<meta name="robots" content="noindex, follow">\n<meta name="theme-color"')

        doc += header(page["file"])
        doc += part.read_text(encoding="utf-8").replace("{{FORM}}", form).rstrip() + "\n\n"
        doc += FOOTER
        if page.get("lightbox"):
            doc += LIGHTBOX
        doc += TAIL

        # Единый перевод строки, без хвостовых пробелов.
        doc = re.sub(r"[ \t]+\n", "\n", doc)
        (ROOT / page["file"]).write_text(doc, encoding="utf-8")
        print(f"ok  {page['file']:<28} {len(doc):>7} символов")


if __name__ == "__main__":
    build()
