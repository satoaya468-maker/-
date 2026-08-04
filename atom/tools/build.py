#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Сборка статического сайта сервисного центра «Атом».

Общие блоки (верхняя панель, шапка, мобильное меню, подвал, модалка, плавающая
кнопка) описаны здесь один раз и вставляются в каждую страницу. На выходе —
семь самостоятельных HTML-файлов без зависимостей от сборщика.

    python3 tools/build.py
"""

import os
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --------------------------------------------------------------- реквизиты ---
NAME = "Атом"
PHONE = "+7 (932) 304-62-41"
PHONE_HREF = "tel:+79323046241"
EMAIL = "atom.postbox@gmail.com"
WA = "https://wa.me/79323046241"
TG = "https://t.me/atomrepair"
VK = "https://vk.ru/atomrepair"
ADDRESS_SHORT = "Пр. Карла Маркса, 56"
ADDRESS_FULL = ("г. Магнитогорск, Проспект Карла Маркса, 56, 1 этаж, "
                "53-й а м-н, Ленинский район, 455000")
HOURS = "Ежедневно 9:00–18:00"
MAP_QUERY = quote("Магнитогорск, проспект Карла Маркса, 56")
MAP_SRC = "https://yandex.ru/map-widget/v1/?text=" + MAP_QUERY + "&amp;z=17"
MAP_LINK = "https://yandex.ru/maps/?text=" + MAP_QUERY

# ------------------------------------------------------------------ иконки ---
def icon(paths, size=18, extra=""):
    return ('<svg width="%d" height="%d" viewBox="0 0 24 24" fill="none" '
            'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" '
            'stroke-linejoin="round" aria-hidden="true"%s>%s</svg>'
            % (size, size, (" " + extra) if extra else "", paths))


I_PIN = icon('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>'
             '<circle cx="12" cy="10" r="3"/>')
I_CLOCK = icon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>')
I_PHONE = icon('<path d="M15.5 21A13.5 13.5 0 0 1 3 8.5 3 3 0 0 1 6 5.5h1.6a1 1 0 0 1 1 .8l.7 3a1 1 0 0 1-.3 1L7.8 11.6a11 11 0 0 0 4.6 4.6l1.3-1.2a1 1 0 0 1 1-.3l3 .7a1 1 0 0 1 .8 1V18a3 3 0 0 1-3 3Z"/>')
I_MAIL = icon('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>')
I_CHECK = icon('<path d="m4.5 12.5 5 5 10-11"/>')
I_ARROW = icon('<path d="M4 12h15m-6-6 6 6-6 6"/>', 16)
I_SHIELD = icon('<path d="M12 3 5 6v6c0 4.4 3 8.2 7 9 4-.8 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>', 22)
I_WALLET = icon('<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1.4"/>', 22)
I_CHIP = icon('<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>', 22)
I_CAL = icon('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>', 22)
I_STAR_S = ('<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" '
            'aria-hidden="true"><path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 '
            '17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6Z"/></svg>')
I_STAR_L = ('<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" '
            'aria-hidden="true"><path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 '
            '17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6Z"/></svg>')
I_ROUTE = icon('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/>'
               '<path d="M8.5 6H14a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h5.5" '
               'transform="translate(0,-2)"/>', 22)
I_DOC = icon('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/>'
             '<path d="M14 3v5h5M9 13h6M9 17h4"/>', 22)
I_TOOLS = icon('<path d="M14.5 5.5a4 4 0 0 0 5.2 5.2l-8 8a2.8 2.8 0 0 1-4-4l8-8Z"/>'
               '<path d="M6.5 6.5 4 4l2-2 2.5 2.5"/>', 22)
I_CLOSE = icon('<path d="m6 6 12 12M18 6 6 18"/>', 20)

I_VK = ('<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" '
        'aria-hidden="true"><path d="M12.8 17.2c-5.3 0-8.7-3.7-8.8-9.9h2.7c.1 4.6 2.2 6.5 '
        '3.7 6.9V7.3h2.6v3.9c1.5-.2 3-1.9 3.5-3.9h2.5c-.4 2.4-2 4.1-3.1 4.8 1.1.6 3 2.1 '
        '3.7 5.1h-2.8c-.6-1.8-2-3.2-3.8-3.4v3.4h-.2Z"/></svg>')
I_TG = ('<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" '
        'aria-hidden="true"><path d="M21.3 4.3 2.9 11.2c-.9.4-.9 1.6.1 1.9l4.6 1.4 1.8 '
        '5.4c.3.8 1.2 1 1.8.4l2.5-2.4 4.7 3.5c.7.5 1.6.1 1.8-.7l3-14.9c.2-.9-.7-1.7-1.9-1.5'
        'ZM9.6 14.4l-.5 3.7-1.3-4L18 7.5 9.6 14.4Z"/></svg>')
I_WA = ('<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" '
        'aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 '
        '2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5'
        '-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3'
        '-2.9c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.1-.3 0-.5l-.8-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5'
        '.1-.7.4a3 3 0 0 0-1 2.3 5.3 5.3 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1c1.9.7 2.3.6 2.7.6'
        'a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2l-.4-.3Z"/></svg>')

I_WA_BIG = ('<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" '
            'aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 '
            '12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 '
            '6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.1-.3 0-.5l-.8-1.8c-.2-.4-.4-.4-.6'
            '-.4h-.5c-.2 0-.5.1-.7.4a3 3 0 0 0-1 2.3 5.3 5.3 0 0 0 1.1 2.8 12 12 0 0 0 4.6 '
            '4.1c1.9.7 2.3.6 2.7.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2l-.4-.3Z"/></svg>')

DEVICES = ["Телевизор", "Ноутбук", "Телефон", "Пылесос", "Микроволновка",
           "Мультиварка", "Другое"]


def device_options(name="device"):
    opts = ['<option value="" disabled selected>Что сломалось</option>']
    opts += ['<option>%s</option>' % d for d in DEVICES]
    return "".join(opts)


def stars(n=5, big=False):
    mark = I_STAR_L if big else I_STAR_S
    return '<span class="stars" aria-hidden="true">%s</span>' % (mark * n)


# ------------------------------------------------------------ общие блоки ---
NAV = [
    ("index.html", "Главная"),
    ("uslugi.html", "Услуги"),
    ("garantii.html", "Гарантии"),
    ("otzyvy.html", "Отзывы"),
    ("o-kompanii.html", "О компании"),
    ("contakty.html", "Контакты"),
]

LOGO = ('<a class="logo" href="index.html" aria-label="Атом — сервисный центр, на главную">'
        '<img class="logo__mark" src="assets/img/logo-atom.svg" alt="" width="42" height="42">'
        '<span class="logo__text"><span class="logo__name">АТОМ</span>'
        '<span class="logo__sub">сервисный центр</span></span></a>')

SOCIALS = ('<div class="socials">'
           '<a class="social" href="' + VK + '" target="_blank" rel="noopener" aria-label="ВКонтакте">' + I_VK + '</a>'
           '<a class="social" href="' + TG + '" target="_blank" rel="noopener" aria-label="Telegram">' + I_TG + '</a>'
           '<a class="social" href="' + WA + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + I_WA + '</a>'
           '</div>')

TOPBAR = ('<div class="topbar"><div class="container topbar__inner">'
          '<div class="topbar__facts">'
          '<a class="topbar__fact topbar__fact--address" href="contakty.html">' + I_PIN +
          '<span>' + ADDRESS_SHORT + '</span></a>'
          '<span class="topbar__fact topbar__fact--hours">' + I_CLOCK +
          '<span>' + HOURS + '</span></span>'
          '</div>'
          '<div class="topbar__right">'
          '<a class="topbar__phone" href="' + PHONE_HREF + '">' + PHONE + '</a>'
          + SOCIALS +
          '</div></div></div>')


def header(active):
    links = "".join(
        '<a class="nav__link%s" href="%s"%s>%s</a>'
        % (" is-active" if href == active else "", href,
           ' aria-current="page"' if href == active else "", label)
        for href, label in NAV)
    return ('<header class="header"><div class="container header__inner">'
            + LOGO +
            '<nav class="nav" aria-label="Основная навигация">' + links + '</nav>'
            '<div class="header__actions">'
            '<a class="header__phone" href="' + PHONE_HREF + '">' + PHONE + '</a>'
            '<a class="header__call" href="' + PHONE_HREF + '" aria-label="Позвонить '
            + PHONE + '">' + I_PHONE + '</a>'
            '<a class="btn btn--cta" href="#zayavka">Оставить заявку</a>'
            '<button class="burger" type="button" aria-label="Меню" '
            'aria-expanded="false" aria-controls="mobilemenu"><span></span></button>'
            '</div></div></header>')


def mobilemenu(active):
    links = "".join(
        '<a class="mobilemenu__link%s" href="%s">%s%s</a>'
        % (" is-active" if href == active else "", href, label, I_ARROW)
        for href, label in NAV)
    return ('<div class="mobilemenu" id="mobilemenu">'
            '<div class="container" style="padding:0">'
            '<div class="mobilemenu__head">' + LOGO +
            '<button class="burger mobilemenu__close" type="button" aria-label="Закрыть меню" '
            'aria-expanded="true"><span></span></button></div>'
            '<nav class="mobilemenu__nav" aria-label="Мобильная навигация">' + links + '</nav>'
            '<div class="mobilemenu__foot">'
            '<a class="mobilemenu__phone" href="' + PHONE_HREF + '">' + PHONE + '</a>'
            '<p class="small muted">' + HOURS + ' · ' + ADDRESS_SHORT + '</p>'
            '<a class="btn btn--lg btn--block" href="#zayavka">Оставить заявку</a>'
            + SOCIALS + '</div></div></div>')


FOOTER = ('<footer class="footer"><div class="container">'
          '<div class="footer__top">'
          '<div class="footer__about">' + LOGO +
          '<p>Сервисный центр в Магнитогорске. Ремонт телевизоров, ноутбуков, '
          'смартфонов и бытовой техники. Бесплатная диагностика, гарантия на работы '
          'и запчасти.</p>'
          '<p class="small">Рейтинг 4.8 на Яндекс.Картах · 197 оценок</p></div>'
          '<div><div class="footer__title">Услуги</div><ul class="footer__list">'
          '<li><a href="remont-televizorov.html">Ремонт телевизоров</a></li>'
          '<li><a href="uslugi.html#noutbuki">Ремонт ноутбуков</a></li>'
          '<li><a href="uslugi.html#telefony">Ремонт телефонов</a></li>'
          '<li><a href="uslugi.html#bytovaya">Бытовая техника</a></li>'
          '<li><a href="uslugi.html">Все услуги и цены</a></li></ul></div>'
          '<div><div class="footer__title">Компания</div><ul class="footer__list">'
          '<li><a href="o-kompanii.html">О компании</a></li>'
          '<li><a href="garantii.html">Гарантии</a></li>'
          '<li><a href="otzyvy.html">Отзывы</a></li>'
          '<li><a href="contakty.html">Контакты</a></li></ul></div>'
          '<div class="footer__contacts"><div class="footer__title">Контакты</div>'
          '<a class="footer__phone" href="' + PHONE_HREF + '">' + PHONE + '</a>'
          '<p>' + ADDRESS_FULL + '</p>'
          '<p>' + HOURS + '</p>'
          '<p><a href="mailto:' + EMAIL + '">' + EMAIL + '</a></p>'
          + SOCIALS + '</div></div>'
          '<div class="footer__bottom">'
          '<span>© 2026 Сервисный центр «Атом», Магнитогорск</span>'
          '<div class="footer__legal">'
          '<span>Оплата: карта и наличные</span>'
          '<span>Не является публичной офертой</span>'
          '</div></div></div></footer>')

MODAL = ('<div class="modal" id="success-modal" role="dialog" aria-modal="true" '
         'aria-labelledby="success-title" aria-hidden="true"><div class="modal__card">'
         '<button class="modal__close" type="button" data-close-modal '
         'aria-label="Закрыть">' + I_CLOSE + '</button>'
         '<div class="modal__check">' + icon('<path d="m4.5 12.5 5 5 10-11"/>', 28) + '</div>'
         '<h3 id="success-title">Спасибо! Заявка принята</h3>'
         '<p>Перезвоним в течение 15 минут в рабочее время — ежедневно с 9:00 до 18:00. '
         'Если нужно быстрее, напишите в WhatsApp.</p>'
         '<a class="btn btn--block" href="' + WA + '" target="_blank" rel="noopener" '
         'style="margin-top:8px">Написать в WhatsApp</a>'
         '<button class="btn btn--ghost btn--block" type="button" data-close-modal>Закрыть</button>'
         '</div></div>')

FAB = ('<a class="fab" href="' + WA + '" target="_blank" rel="noopener" '
       'aria-label="Написать в WhatsApp">' + I_WA_BIG + '<span>Написать в WhatsApp</span></a>')


def head(title, description, page):
    canonical = "https://atom-service74.ru/" + ("" if page == "index.html" else page)
    ld = ('{"@context":"https://schema.org","@type":"LocalBusiness",'
          '"name":"Сервисный центр «Атом»",'
          '"description":"Профессиональный ремонт любой электроники в Магнитогорске",'
          '"telephone":"+79323046241","email":"' + EMAIL + '",'
          '"address":{"@type":"PostalAddress","streetAddress":"Проспект Карла Маркса, 56",'
          '"addressLocality":"Магнитогорск","postalCode":"455000","addressCountry":"RU"},'
          '"openingHours":"Mo-Su 09:00-18:00",'
          '"priceRange":"1000-15000 RUB",'
          '"paymentAccepted":"Наличные, банковская карта",'
          '"sameAs":["' + VK + '","' + TG + '"],'
          '"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.8",'
          '"reviewCount":"166","ratingCount":"197","bestRating":"5"}}')
    return ('<!DOCTYPE html>\n<html lang="ru">\n<head>\n'
            '<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>' + title + '</title>\n'
            '<meta name="description" content="' + description + '">\n'
            '<link rel="canonical" href="' + canonical + '">\n'
            '<meta property="og:type" content="website">\n'
            '<meta property="og:title" content="' + title + '">\n'
            '<meta property="og:description" content="' + description + '">\n'
            '<meta property="og:locale" content="ru_RU">\n'
            '<meta name="theme-color" content="#0066FF">\n'
            '<link rel="icon" href="favicon.svg" type="image/svg+xml">\n'
            '<link rel="preload" href="assets/fonts/manrope-cyrillic-800-normal.woff2" '
            'as="font" type="font/woff2" crossorigin>\n'
            '<link rel="preload" href="assets/fonts/inter-cyrillic-400-normal.woff2" '
            'as="font" type="font/woff2" crossorigin>\n'
            '<link rel="stylesheet" href="styles.css">\n'
            '<script type="application/ld+json">' + ld + '</script>\n'
            '</head>\n<body>\n'
            '<a class="skip-link" href="#main">Перейти к содержимому</a>\n')


def page(filename, title, description, body):
    html = (head(title, description, filename)
            + TOPBAR + header(filename) + mobilemenu(filename)
            + '<main id="main">' + body + '</main>'
            + FOOTER + MODAL + FAB
            + '\n<script src="app.js" defer></script>\n</body>\n</html>\n')
    with open(os.path.join(ROOT, filename), "w", encoding="utf-8") as f:
        f.write(html)
    print("%-26s %6d КБ" % (filename, len(html.encode("utf-8")) // 1024))


# ------------------------------------------------------ повторяемые секции ---
def quickform(form_id, ident="quick"):
    """Три поля: тип техники, телефон, кнопка."""
    return ('<form class="quickform" data-form="' + ident + '" novalidate>'
            '<div class="field"><label for="' + form_id + '-device">Что сломалось</label>'
            '<select class="select" id="' + form_id + '-device" name="device" required>'
            + device_options() +
            '</select><span class="field-error">Выберите тип техники</span></div>'
            '<div class="field"><label for="' + form_id + '-phone">Телефон</label>'
            '<input class="input" id="' + form_id + '-phone" name="phone" type="tel" '
            'inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required>'
            '<span class="field-error">Введите номер полностью</span></div>'
            '<button class="btn" type="submit">Оставить заявку</button>'
            '</form>')


def fullform(form_id, ident="lead", title="Заявка на ремонт",
             sub="Перезвоним в течение 15 минут и назовём срок. Диагностика бесплатная."):
    return ('<div class="formcard" id="zayavka">'
            '<div class="formcard__title">' + title + '</div>'
            '<p class="formcard__sub">' + sub + '</p>'
            '<form data-form="' + ident + '" novalidate>'
            '<div class="formgrid">'
            '<div class="field"><label for="' + form_id + '-name">Ваше имя</label>'
            '<input class="input" id="' + form_id + '-name" name="name" type="text" '
            'autocomplete="name" placeholder="Как к вам обращаться"></div>'
            '<div class="field"><label for="' + form_id + '-phone">Телефон *</label>'
            '<input class="input" id="' + form_id + '-phone" name="phone" type="tel" '
            'inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required>'
            '<span class="field-error">Введите номер полностью</span></div>'
            '<div class="field"><label for="' + form_id + '-device">Тип техники *</label>'
            '<select class="select" id="' + form_id + '-device" name="device" required>'
            + device_options() +
            '</select><span class="field-error">Выберите тип техники</span></div>'
            '<div class="field"><label for="' + form_id + '-model">Бренд и модель</label>'
            '<input class="input" id="' + form_id + '-model" name="model" type="text" '
            'placeholder="Например, Samsung UE50TU7090"></div>'
            '<div class="field span-2"><label for="' + form_id + '-problem">Что случилось</label>'
            '<textarea class="textarea" id="' + form_id + '-problem" name="problem" '
            'placeholder="Опишите проблему: что не работает, когда началось, были ли '
            'падения или залития"></textarea></div>'
            '<div class="field span-2"><label for="' + form_id + '-time">Когда удобно '
            'привезти технику</label>'
            '<select class="select" id="' + form_id + '-time" name="visit">'
            '<option value="" disabled selected>Выберите время визита</option>'
            '<option>Сегодня, 9:00–12:00</option><option>Сегодня, 12:00–15:00</option>'
            '<option>Сегодня, 15:00–18:00</option><option>Завтра, первая половина дня</option>'
            '<option>Завтра, вторая половина дня</option>'
            '<option>Согласуем по телефону</option></select></div>'
            '<div class="span-2"><button class="btn btn--lg btn--block" type="submit">'
            'Оставить заявку</button></div>'
            '<p class="form-note span-2">Нажимая кнопку, вы соглашаетесь на обработку '
            'персональных данных. Мы используем их только чтобы связаться по заявке.</p>'
            '</div></form></div>')


def ctaband(form_id="cta"):
    return ('<section class="ctaband" data-reveal>'
            '<img class="ctaband__bg" src="assets/img/board-dark.jpg" alt="" loading="lazy" '
            'width="1600" height="700">'
            '<div class="container ctaband__inner">'
            '<div class="ctaband__text">'
            '<h2>Оставьте заявку — перезвоним в течение 15 минут</h2>'
            '<p>Расскажите, что случилось с техникой. Диагностика бесплатная, стоимость '
            'ремонта согласуем до начала работ.</p>'
            '<div class="ctaband__facts">'
            '<span>' + I_CHECK + 'Бесплатная диагностика</span>'
            '<span>' + I_CHECK + 'Гарантия на работы</span>'
            '<span>' + I_CHECK + 'Оплата после ремонта</span>'
            '</div>'
            '<div class="ctaband__facts" style="margin-top:4px">'
            '<span>' + I_PHONE + '<a href="' + PHONE_HREF + '" style="color:#fff;'
            'font-weight:600">' + PHONE + '</a></span></div>'
            '</div>'
            + fullform(form_id, "cta", "Заявка на ремонт",
                       "Заполните два поля — остальное уточним по телефону.") +
            '</div></section>')


def faq(items, title="Частые вопросы", sub=None):
    rows = ""
    for i, (q, a) in enumerate(items):
        rows += ('<div class="faq__item"><h3><button class="faq__q" type="button" '
                 'aria-expanded="false" aria-controls="faq-%d">%s'
                 '<span class="faq__icon" aria-hidden="true"></span></button></h3>'
                 '<div class="faq__a" id="faq-%d"><div><p>%s</p></div></div></div>'
                 % (i, q, i, a))
    head_block = '<div class="section-head"><span class="eyebrow">Вопросы и ответы</span>' \
                 '<h2>' + title + '</h2>'
    if sub:
        head_block += '<p class="lead">' + sub + '</p>'
    head_block += '</div>'
    return ('<section class="section" data-reveal><div class="container">'
            + head_block + '<div class="faq">' + rows + '</div></div></section>')


# ------------------------------------------------------------------ отзывы ---
# ДЕМО-КОНТЕНТ. Тексты составлены как образец наполнения на основе реального
# перечня услуг. Перед публикацией заменить на настоящие отзывы с Яндекс.Карт.
REVIEWS = [
    ("Сергей Кузнецов", "СК", "tv", "Ремонт подсветки", "Март 2026",
     "Samsung 50 дюймов: звук есть, картинки нет. Сказали сразу — подсветка. "
     "Назвали вилку по цене до ремонта, в итоге вышло по нижней границе. "
     "Забрал через два дня, работает."),
    ("Анна Мельникова", "АМ", "laptop", "Восстановление после залития", "Февраль 2026",
     "Залила ноутбук чаем, не включался вообще. В другом месте предложили менять "
     "материнскую плату целиком. Здесь почистили, восстановили по компонентам, "
     "вышло заметно дешевле. Работает уже третий месяц."),
    ("Дмитрий Ерёмин", "ДЕ", "phone", "Замена разъёма зарядки", "Март 2026",
     "Xiaomi перестал заряжаться, шатался разъём. Поменяли за день. "
     "Диагностику не взяли, по деньгам всё как договаривались."),
    ("Ольга Ткачёва", "ОТ", "appliance", "Ремонт пылесоса", "Январь 2026",
     "Пылесос перестал держать мощность. Разобрали при мне, показали, в чём дело. "
     "Спокойно объяснили без лишних терминов. Работает как новый."),
    ("Игорь Савельев", "ИС", "tv", "Ремонт платы телевизора", "Февраль 2026",
     "LG не включался, только индикатор моргал. Оказался блок питания. "
     "Отремонтировали по компонентам, не стали менять плату целиком — "
     "это и по деньгам вышло адекватно."),
    ("Марина Володина", "МВ", "laptop", "Замена матрицы", "Март 2026",
     "Разбила экран на ноутбуке ASUS. Уточнили модель, заказали матрицу, "
     "поставили за три дня. Предупредили заранее, что ждём деталь — без сюрпризов."),
    ("Алексей Гордеев", "АГ", "phone", "Замена стекла", "Январь 2026",
     "Honor после падения. Взяли, сделали, отдали в тот же день. "
     "Сенсор работает нормально, претензий нет."),
    ("Наталья Шилова", "НШ", "appliance", "Ремонт микроволновки", "Декабрь 2025",
     "Микроволновка грела через раз. Починили, дали гарантию на работу. "
     "Удобно, что рядом с остановкой — не пришлось никуда ехать через весь город."),
    ("Виктор Панов", "ВП", "tv", "Прошивка телевизора", "Февраль 2026",
     "После обновления телевизор ушёл в вечную перезагрузку. Перепрошили, "
     "всё встало на место. Заняло полдня."),
    ("Екатерина Лаптева", "ЕЛ", "laptop", "Чистка от пыли", "Март 2026",
     "Ноутбук грелся и шумел как пылесос. Почистили, поменяли термопасту. "
     "Разница слышна сразу, температуры упали."),
    ("Роман Дьяченко", "РД", "phone", "Ремонт после залития", "Февраль 2026",
     "Утопил Samsung. Честно сказали, что гарантий по залитию никто не даст, "
     "но попробуют. Восстановили. За честный разговор до ремонта — отдельное спасибо."),
    ("Людмила Царёва", "ЛЦ", "appliance", "Ремонт мультиварки", "Январь 2026",
     "Мультиварка перестала держать программу. Посмотрели бесплатно, "
     "сказали стоимость, я согласилась. Сделали за два дня."),
    ("Павел Ильин", "ПИ", "tv", "Замена HDMI-разъёма", "Декабрь 2025",
     "Разболтался HDMI на телевизоре Sony, приставка отваливалась. "
     "Перепаяли разъём. Держится крепко, работает."),
    ("Светлана Коваль", "СК", "laptop", "Замена клавиатуры", "Февраль 2026",
     "На Lenovo не работала половина клавиш. Поменяли клавиатуру, "
     "предупредили про срок доставки детали. Всё по срокам."),
    ("Артём Белых", "АБ", "phone", "Замена аккумулятора", "Март 2026",
     "iPhone держал полдня. Поменяли батарею, теперь до вечера хватает. "
     "Сделали при мне примерно за час."),
    ("Ирина Позднякова", "ИП", "appliance", "Ремонт фена", "Январь 2026",
     "Фен перестал переключать режимы. Думала, проще новый купить, "
     "но починили быстро и недорого. Приятно, что берутся за мелкую технику."),
    ("Максим Ращупкин", "МР", "tv", "Ремонт подсветки", "Ноябрь 2025",
     "Телевизор Philips, тёмный экран. Заменили светодиодные линейки. "
     "Прошло уже несколько месяцев — полёт нормальный."),
    ("Юлия Дорофеева", "ЮД", "laptop", "Ремонт платы", "Февраль 2026",
     "Ноутбук Acer не стартовал. Нашли короткое замыкание по цепи питания, "
     "отремонтировали плату. Объяснили, из-за чего это произошло."),
    ("Денис Хабаров", "ДХ", "phone", "Замена динамика", "Март 2026",
     "Realme: собеседника не было слышно. Поменяли динамик, забрал в тот же день."),
    ("Тамара Ушакова", "ТУ", "appliance", "Ремонт мясорубки", "Декабрь 2025",
     "Электромясорубка перестала крутить. Посмотрели, заменили деталь. "
     "Работает, спасибо мастеру за объяснения."),
    ("Николай Пестов", "НП", "tv", "Ремонт блока питания", "Январь 2026",
     "Телевизор выключался сам через минуту. Сделали блок питания, "
     "стоимость согласовали заранее и не поменяли в процессе."),
    ("Алина Гущина", "АГ", "laptop", "Восстановление после залития", "Март 2026",
     "Пролила воду на HP. Приняли в тот же вечер, сказали не включать. "
     "Просушили, почистили платы. Ноут ожил."),
    ("Станислав Резник", "СР", "phone", "Замена разъёма зарядки", "Февраль 2026",
     "Huawei заряжался только под углом. Перепаяли разъём, гарантию дали письменно."),
    ("Галина Матвеева", "ГМ", "appliance", "Ремонт пылесоса", "Ноябрь 2025",
     "Пылесос перегревался и отключался. Разобрали, почистили, заменили деталь. "
     "Вежливо, по делу, без навязывания."),
]

CATS = {"tv": "Телевизоры", "laptop": "Ноутбуки", "phone": "Телефоны",
        "appliance": "Бытовая техника"}


def review_card(r, accent=False):
    name, initials, cat, tag, date, text = r
    return ('<article class="reviewcard" data-review="' + cat + '">'
            '<div class="reviewcard__head">'
            '<span class="avatar' + (' avatar--accent' if accent else '') + '" '
            'aria-hidden="true">' + initials + '</span>'
            '<span class="reviewcard__who"><b>' + name + '</b><span>' + date + '</span></span>'
            '</div>' + stars() +
            '<p class="reviewcard__text">' + text + '</p>'
            '<div class="reviewcard__foot"><span class="tag">' + tag + '</span>'
            '<span class="small muted">' + CATS[cat] + '</span></div></article>')


PLATFORMS = ('<div class="platforms">'
             '<a class="platform" href="' + MAP_LINK + '" target="_blank" rel="noopener">'
             '<b>Яндекс.Карты' + I_ARROW + '</b><span>4.8 из 5 — 197 оценок, 166 отзывов, '
             '90 фото</span></a>'
             '<a class="platform" href="' + VK + '" target="_blank" rel="noopener">'
             '<b>ВКонтакте' + I_ARROW + '</b><span>Примеры работ и новости сервиса</span></a>'
             '<a class="platform" href="' + TG + '" target="_blank" rel="noopener">'
             '<b>Telegram' + I_ARROW + '</b><span>Быстрая связь с мастером</span></a>'
             '</div>')

BRANDS = ["Samsung", "Apple", "Xiaomi", "Honor", "Huawei", "LG", "Sony", "Realme",
          "Nokia", "Lenovo", "ASUS", "Acer", "OnePlus", "Meizu", "HTC", "Philips",
          "Panasonic", "BlackBerry", "Digma", "Fly"]


def brands_block():
    return ('<div class="brands">'
            + "".join('<span class="brand">%s</span>' % b for b in BRANDS)
            + '</div>')


SERVICES = [
    ("remont-televizorov.html", "dev-tv.svg", "Ремонт телевизоров", "от 1 000 ₽",
     "Подсветка, платы, разъёмы, прошивка. Работаем с любыми диагоналями и брендами.",
     ["Ремонт подсветки — 2 000–15 000 ₽",
      "Ремонт платы — 1 500–10 000 ₽",
      "Замена разъёма — 1 000–4 000 ₽",
      "Прошивка — 1 000–4 000 ₽"]),
    ("uslugi.html#noutbuki", "dev-laptop.svg", "Ремонт ноутбуков", "от 2 000 ₽",
     "Компонентный ремонт материнских плат, замена комплектующих, профилактика.",
     ["Ремонт платы — 2 000–10 000 ₽",
      "Замена клавиатуры",
      "Замена матрицы",
      "Чистка от пыли с заменой термопасты",
      "Восстановление после залития"]),
    ("uslugi.html#telefony", "dev-phone.svg", "Ремонт телефонов", "Бесплатная диагностика",
     "20 брендов — от Apple и Samsung до Digma и Fly. Точную цену называем после осмотра.",
     ["Замена разъёмов и шлейфов",
      "Ремонт после залития",
      "Замена модулей и аккумуляторов",
      "Компонентный ремонт плат"]),
    ("uslugi.html#bytovaya", "dev-microwave.svg", "Бытовая техника", "Бесплатная диагностика",
     "Мелкая бытовая техника: от пылесосов до плоек. Берёмся за то, что другие не чинят.",
     ["Пылесосы", "Микроволновки", "Мультиварки",
      "Мясорубки", "Фены и плойки"]),
]


def service_cards(items=None):
    items = items or SERVICES
    out = ""
    for href, img, title, price, desc, points in items:
        out += ('<article class="servicecard">'
                '<div class="servicecard__media">'
                '<img src="assets/img/' + img + '" alt="" loading="lazy" '
                'width="320" height="240"></div>'
                '<div class="servicecard__body"><h3>' + title + '</h3>'
                '<p>' + desc + '</p>'
                '<ul class="servicecard__list">'
                + "".join('<li>%s</li>' % p for p in points) +
                '</ul></div>'
                '<div class="servicecard__foot">'
                '<span class="price-from"><span>Стоимость</span><b>' + price + '</b></span>'
                '<a class="link-arrow stretched" href="' + href + '">Подробнее' + I_ARROW +
                '</a></div></article>')
    return out


# =============================================================== СТРАНИЦЫ ====
def build_index():
    body = (
        # --- первый экран
        '<section class="hero"><div class="container hero__grid">'
        '<div class="hero__content">'
        '<span class="hero__rating">' + stars() +
        '<span><b>4.8</b> на Яндекс.Картах · 197 оценок</span></span>'
        '<h1>Профессиональный ремонт любой электроники '
        '<span class="hero__accent">в Магнитогорске</span></h1>'
        '<p class="lead">Телевизоры, ноутбуки, смартфоны и бытовая техника. '
        'Компонентный ремонт плат, а не замена блоками — поэтому дешевле и быстрее.</p>'
        '<div class="hero__badges">'
        '<span class="hero__badge">' + I_CHECK + 'Бесплатная диагностика</span>'
        '<span class="hero__badge">' + I_CHECK + 'Гарантия на работы</span>'
        '<span class="hero__badge">' + I_CHECK + 'Оплата после ремонта</span>'
        '</div>'
        '<div class="hero__form" id="zayavka-top">'
        '<div class="hero__form-title"><span>1</span>Опишите поломку — перезвоним '
        'в течение 15 минут</div>'
        + quickform("hero", "hero") +
        '<p class="form-note" style="margin-top:12px">Или сразу позвоните: '
        '<a href="' + PHONE_HREF + '">' + PHONE + '</a> · ежедневно 9:00–18:00</p>'
        '</div></div>'
        '<div class="hero__media">'
        '<figure class="hero__figure">'
        '<img src="assets/img/board-hero.jpg" alt="Материнская плата под увеличением '
        'на рабочем месте мастера сервисного центра" width="1280" height="960">'
        '<figcaption class="hero__caption"><strong>Компонентный ремонт плат</strong>'
        '<span>Восстанавливаем цепи питания, меняем разъёмы и контроллеры</span>'
        '</figcaption></figure>'
        '<div class="hero__chip"><b>15 минут</b><span>среднее время ответа на заявку</span>'
        '</div></div></div></section>'

        # --- полоса доверия
        '<section class="trustbar" data-reveal><div class="container">'
        '<div class="trustbar__grid">'
        '<div class="trustbar__item"><span class="trustbar__num">4.8'
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="#FFB400" aria-hidden="true">'
        '<path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45'
        '-4.7-4.6 6.5-.95L12 2.6Z"/></svg></span>'
        '<span class="trustbar__label">Рейтинг на Яндекс.Картах</span></div>'
        '<div class="trustbar__item"><span class="trustbar__num">197</span>'
        '<span class="trustbar__label">Оценок от клиентов</span></div>'
        '<div class="trustbar__item"><span class="trustbar__num">166</span>'
        '<span class="trustbar__label">Развёрнутых отзывов</span></div>'
        '<div class="trustbar__item"><span class="trustbar__num">0 ₽</span>'
        '<span class="trustbar__label">Стоимость диагностики</span></div>'
        '</div></div></section>'

        # --- услуги
        '<section class="section" id="uslugi" data-reveal><div class="container">'
        '<div class="section-head section-head--split"><div>'
        '<span class="eyebrow">Услуги</span>'
        '<h2>Что мы ремонтируем</h2>'
        '<p class="lead">Цены из действующего прайса. Точную сумму называем после '
        'бесплатной диагностики и согласовываем до начала работ.</p></div>'
        '<a class="btn btn--ghost" href="uslugi.html">Все услуги и цены</a></div>'
        '<div class="grid grid--4">' + service_cards() + '</div>'
        '</div></section>'

        # --- бренды
        '<section class="section section--surface" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Бренды</span>'
        '<h2>С какой техникой работаем</h2>'
        '<p class="lead">По телефонам держим детали и опыт по двадцати брендам. '
        'По телевизорам и ноутбукам работаем с любым производителем.</p></div>'
        + brands_block() + '</div></section>'

        # --- как работаем
        '<section class="section" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Порядок работы</span>'
        '<h2>Как проходит ремонт</h2>'
        '<p class="lead">Без скрытых доплат: пока вы не согласовали стоимость, '
        'работы не начинаются.</p></div>'
        '<div class="steps">'
        '<div class="step"><span class="step__num">01</span>'
        '<h3>Оставьте заявку</h3><p>Форма на сайте, звонок или сообщение в WhatsApp. '
        'Опишите, что случилось с техникой.</p>'
        '<span class="step__meta">Ответ за 15 минут</span></div>'
        '<div class="step"><span class="step__num">02</span>'
        '<h3>Бесплатная диагностика</h3><p>Мастер находит причину поломки и проверяет '
        'сопутствующие узлы, чтобы не возвращать технику дважды.</p>'
        '<span class="step__meta">0 ₽</span></div>'
        '<div class="step"><span class="step__num">03</span>'
        '<h3>Согласуем стоимость</h3><p>Называем точную сумму и срок. Если ремонт '
        'нецелесообразен — честно скажем об этом.</p>'
        '<span class="step__meta">До начала работ</span></div>'
        '<div class="step"><span class="step__num">04</span>'
        '<h3>Ремонт и выдача</h3><p>Отдаём технику с проверкой при вас. '
        'Оплата картой или наличными после ремонта.</p>'
        '<span class="step__meta">С гарантией</span></div>'
        '</div></div></section>'

        # --- преимущества
        '<section class="section section--surface" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Почему «Атом»</span>'
        '<h2>Технику дорого отдавать в случайные руки</h2>'
        '<p class="lead">Шесть причин, по которым в Магнитогорске нас выбирают '
        'повторно и рекомендуют знакомым.</p></div>'
        '<div class="grid grid--3">'
        '<div class="perk"><span class="perk__icon">' + I_CHIP + '</span>'
        '<h3>Бесплатная диагностика</h3><p>Находим причину поломки бесплатно, '
        'даже если вы откажетесь от ремонта.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_SHIELD + '</span>'
        '<h3>Гарантия на работы</h3><p>Даём гарантию на выполненные работы и '
        'установленные запчасти. Условия — на отдельной странице.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_TOOLS + '</span>'
        '<h3>Оригинальные запчасти</h3><p>Ставим оригинальные детали и качественные '
        'аналоги, о выборе предупреждаем заранее.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_WALLET + '</span>'
        '<h3>Оплата после ремонта</h3><p>Платите, когда убедились, что техника '
        'работает. Карта или наличные.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_CAL + '</span>'
        '<h3>Работаем 7 дней в неделю</h3><p>Ежедневно с 9:00 до 18:00, включая '
        'выходные. Одна минута от остановки.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_DOC + '</span>'
        '<h3>4.8 на Яндекс.Картах</h3><p>197 оценок и 166 отзывов от жителей '
        'Магнитогорска — репутация, которой мы дорожим.</p></div>'
        '</div></div></section>'

        # --- отзывы
        '<section class="section" data-reveal><div class="container reviews" data-carousel>'
        '<div class="section-head section-head--split"><div>'
        '<span class="eyebrow">Отзывы</span>'
        '<h2>Что пишут клиенты</h2>'
        '<p class="lead">Рейтинг 4.8 из 5 на Яндекс.Картах по 197 оценкам.</p></div>'
        '<div class="carousel-nav">'
        '<button class="carousel-btn" type="button" data-carousel-prev aria-label="Назад">'
        + icon('<path d="M15 5 8 12l7 7"/>', 20) + '</button>'
        '<button class="carousel-btn" type="button" data-carousel-next aria-label="Вперёд">'
        + icon('<path d="m9 5 7 7-7 7"/>', 20) + '</button>'
        '</div></div>'
        '<div class="container"><div class="reviews__track" data-carousel-track>'
        + "".join(review_card(r, i % 3 == 0) for i, r in enumerate(REVIEWS[:6])) +
        '</div>'
        '<div style="margin-top:32px"><a class="btn btn--ghost" href="otzyvy.html">'
        'Все отзывы</a></div></div></section>'

        + ctaband("home"))

    page("index.html",
         "Сервисный центр «Атом» — ремонт электроники в Магнитогорске",
         "Ремонт телевизоров, ноутбуков, телефонов и бытовой техники в Магнитогорске. "
         "Бесплатная диагностика, гарантия, оплата после ремонта. 4.8 на Яндекс.Картах.",
         body)


def build_uslugi():
    small = [("Пылесосы", "Не набирает мощность, перегревается, не включается"),
             ("Микроволновки", "Не греет, искрит, не запускается"),
             ("Мультиварки", "Не держит программу, не набирает температуру"),
             ("Мясорубки", "Не крутит, клинит, гудит без вращения"),
             ("Фены и плойки", "Не переключаются режимы, обрыв питания"),
             ("Другая мелкая техника", "Приносите — посмотрим и скажем честно")]

    body = (
        '<section class="pagehead"><div class="container pagehead__inner">'
        '<nav class="breadcrumbs" aria-label="Хлебные крошки">'
        '<a href="index.html">Главная</a><span>/</span><span>Услуги</span></nav>'
        '<h1>Услуги и цены</h1>'
        '<p class="lead">Действующий прайс сервисного центра «Атом». Диагностика '
        'бесплатная, стоимость ремонта согласовываем до начала работ.</p>'
        '</div></section>'

        '<section class="section" data-reveal><div class="container">'
        '<div class="grid grid--2">' + service_cards() + '</div></div></section>'

        # --- телевизоры
        '<section class="section section--surface" id="televizory" data-reveal>'
        '<div class="container">'
        '<div class="section-head section-head--split"><div>'
        '<span class="eyebrow">Телевизоры</span><h2>Ремонт телевизоров</h2>'
        '<p class="lead">Компонентный ремонт: восстанавливаем платы и подсветку, '
        'а не меняем модули целиком.</p></div>'
        '<a class="btn btn--ghost" href="remont-televizorov.html">Подробная страница</a>'
        '</div>'
        '<div class="tablewrap"><table class="ptable">'
        '<thead><tr><th>Услуга</th><th>Что это</th><th class="is-right">Цена</th></tr></thead>'
        '<tbody>'
        '<tr><td><div class="ptable__name">Ремонт подсветки телевизора'
        '<span>Есть звук, нет изображения</span></div></td>'
        '<td>Замена светодиодных линеек и драйвера подсветки</td>'
        '<td class="ptable__price is-right">2 000–15 000 ₽</td></tr>'
        '<tr><td><div class="ptable__name">Ремонт платы телевизора'
        '<span>Не включается, уходит в защиту</span></div></td>'
        '<td>Компонентный ремонт материнских плат и блоков питания</td>'
        '<td class="ptable__price is-right">1 500–10 000 ₽</td></tr>'
        '<tr><td><div class="ptable__name">Замена разъёма телевизора'
        '<span>Разъём разболтался или сгорел</span></div></td>'
        '<td>USB, HDMI, RF-антенное гнездо</td>'
        '<td class="ptable__price is-right">1 000–4 000 ₽</td></tr>'
        '<tr><td><div class="ptable__name">Прошивка телевизора'
        '<span>Циклическая перезагрузка, сбой ПО</span></div></td>'
        '<td>Обновление операционной системы и прошивка</td>'
        '<td class="ptable__price is-right">1 000–4 000 ₽</td></tr>'
        '</tbody></table></div></div></section>'

        # --- ноутбуки
        '<section class="section" id="noutbuki" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Ноутбуки</span>'
        '<h2>Ремонт ноутбуков</h2>'
        '<p class="lead">От профилактики до восстановления материнской платы '
        'по компонентам.</p></div>'
        '<div class="tablewrap"><table class="ptable">'
        '<thead><tr><th>Услуга</th><th>Что делаем</th><th class="is-right">Цена</th></tr></thead>'
        '<tbody>'
        '<tr><td>Ремонт платы ноутбука</td>'
        '<td>Компонентный ремонт материнских плат: цепи питания, контроллеры, '
        'короткие замыкания</td>'
        '<td class="ptable__price is-right">2 000–10 000 ₽</td></tr>'
        '<tr><td>Замена клавиатуры</td><td>Подбор и установка клавиатурного модуля</td>'
        '<td class="ptable__price is-right">По диагностике</td></tr>'
        '<tr><td>Замена матрицы</td><td>Подбор матрицы под модель и установка</td>'
        '<td class="ptable__price is-right">По диагностике</td></tr>'
        '<tr><td>Чистка от пыли с заменой термопасты</td>'
        '<td>Разбор, чистка системы охлаждения, замена термоинтерфейса</td>'
        '<td class="ptable__price is-right">По диагностике</td></tr>'
        '<tr><td>Восстановление после залития</td>'
        '<td>Разбор, ультразвуковая чистка плат, восстановление дорожек</td>'
        '<td class="ptable__price is-right">По диагностике</td></tr>'
        '</tbody></table></div>'
        '<p class="form-note" style="margin-top:14px">«По диагностике» означает, что цена '
        'зависит от модели и стоимости детали. Диагностика бесплатная, сумму называем '
        'до начала работ.</p></div></section>'

        # --- телефоны
        '<section class="section section--surface" id="telefony" data-reveal>'
        '<div class="container">'
        '<div class="section-head"><span class="eyebrow">Мобильные телефоны</span>'
        '<h2>Ремонт смартфонов</h2>'
        '<p class="lead">Работаем с двадцатью брендами. Стоимость зависит от модели '
        'и детали, поэтому называем её после бесплатной диагностики.</p></div>'
        + brands_block() +
        '<div class="grid grid--2" style="margin-top:32px">'
        '<div class="callout"><b>Что делаем чаще всего</b>'
        '<p>Замена разъёмов зарядки и шлейфов, ремонт после залития, замена модулей '
        'и аккумуляторов, компонентный ремонт плат.</p></div>'
        '<div class="callout" style="background:#fff;border-color:var(--line)">'
        '<b>Сколько это стоит</b>'
        '<p>Оставьте заявку с моделью телефона — назовём вилку по цене ещё до того, '
        'как вы привезёте аппарат.</p></div>'
        '</div></div></section>'

        # --- бытовая техника
        '<section class="section" id="bytovaya" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Бытовая техника</span>'
        '<h2>Мелкая бытовая техника</h2>'
        '<p class="lead">Берёмся за то, что многие сервисы считают невыгодным. '
        'Часто ремонт обходится заметно дешевле новой техники.</p></div>'
        '<div class="grid grid--3">'
        + "".join('<div class="symptom"><b>%s</b><p>%s</p></div>' % s for s in small) +
        '</div></div></section>'

        + ctaband("uslugi"))

    page("uslugi.html",
         "Услуги и цены — сервисный центр «Атом», Магнитогорск",
         "Прайс сервисного центра «Атом»: ремонт телевизоров от 1 000 ₽, ноутбуков "
         "от 2 000 ₽, телефонов и бытовой техники. Бесплатная диагностика.",
         body)


def build_tv():
    symptoms = [
        ("Есть звук, но нет изображения",
         "Классический признак вышедшей из строя подсветки. Экран светится в темноте, "
         "если посветить фонариком — картинка видна."),
        ("Телевизор не включается",
         "Индикатор не горит или моргает. Чаще всего причина в блоке питания или "
         "цепях дежурного напряжения."),
        ("Включается и сразу выключается",
         "Уход в защиту. Обычно это неисправность в блоке питания или коротком "
         "замыкании на плате."),
        ("Полосы, пятна, искажения на экране",
         "Проблема может быть как в матрице, так и в шлейфах и плате обработки "
         "изображения — определяем на диагностике."),
        ("Не работает HDMI, USB или антенный вход",
         "Разъём разболтан или выгорел. Перепаиваем гнездо, при необходимости "
         "восстанавливаем дорожки."),
        ("Зависает, перезагружается, не грузится меню",
         "Сбой прошивки после неудачного обновления. Восстанавливаем программное "
         "обеспечение."),
    ]

    tv_faq = [
        ("Сколько стоит диагностика телевизора?",
         "Диагностика бесплатная. Мы находим причину поломки и называем точную "
         "стоимость ремонта до начала работ. Если вы решите не ремонтировать, "
         "платить за диагностику не нужно."),
        ("Почему такая большая вилка по цене подсветки — от 2 000 до 15 000 ₽?",
         "Стоимость зависит от диагонали, типа подсветки и количества светодиодных "
         "линеек. На небольшом телевизоре может потребоваться заменить одну линейку, "
         "на крупной панели — весь комплект. Точную сумму называем после разбора."),
        ("Вы меняете плату целиком или ремонтируете её?",
         "По возможности ремонтируем по компонентам: находим неисправный элемент и "
         "меняем именно его. Это дешевле замены платы в сборе. Если плата "
         "восстановлению не подлежит, честно скажем об этом."),
        ("Сколько занимает ремонт по времени?",
         "Большинство работ — от одного до трёх дней. Если требуется заказать деталь "
         "под конкретную модель, срок увеличивается на время доставки, и мы "
         "предупреждаем об этом заранее."),
        ("Даёте ли вы гарантию на ремонт телевизора?",
         "Да, мы даём гарантию на выполненные работы и установленные запчасти. "
         "Условия по видам работ описаны на странице «Гарантии»."),
        ("С какими марками телевизоров вы работаете?",
         "Со всеми основными производителями: Samsung, LG, Sony, Philips, Panasonic "
         "и другими. Тип матрицы и диагональ значения не имеют."),
        ("Как оплатить ремонт?",
         "Оплата после ремонта, когда вы убедились, что телевизор работает. "
         "Принимаем банковские карты и наличные."),
    ]

    body = (
        '<section class="pagehead"><div class="container pagehead__inner">'
        '<nav class="breadcrumbs" aria-label="Хлебные крошки">'
        '<a href="index.html">Главная</a><span>/</span>'
        '<a href="uslugi.html">Услуги</a><span>/</span>'
        '<span>Ремонт телевизоров</span></nav>'
        '</div></section>'

        '<section class="section section--tight" data-reveal><div class="container">'
        '<div class="servicehero">'
        '<div style="display:grid;gap:24px;align-content:start">'
        '<span class="eyebrow">Ремонт телевизоров</span>'
        '<h1>Ремонт телевизоров в Магнитогорске — от 1 000 ₽</h1>'
        '<p class="lead">Подсветка, платы, разъёмы и прошивка. Ремонтируем по '
        'компонентам, поэтому чаще всего выходит дешевле, чем замена модуля целиком.</p>'
        '<ul class="checklist">'
        '<li>' + I_CHECK + 'Бесплатная диагностика с проверкой сопутствующих узлов</li>'
        '<li>' + I_CHECK + 'Стоимость согласовываем до начала работ</li>'
        '<li>' + I_CHECK + 'Гарантия на работы и установленные запчасти</li>'
        '<li>' + I_CHECK + 'Оплата после ремонта — картой или наличными</li>'
        '</ul>'
        '<div style="display:flex;gap:12px;flex-wrap:wrap">'
        '<a class="btn btn--lg" href="#zayavka">Оставить заявку</a>'
        '<a class="btn btn--ghost btn--lg" href="' + PHONE_HREF + '">' + PHONE + '</a>'
        '</div></div>'
        '<figure class="servicehero__figure">'
        '<img src="assets/img/board-bench.jpg" alt="Плата телевизора на рабочем столе '
        'мастера сервисного центра «Атом»" loading="lazy" width="1200" height="900">'
        '</figure></div></div></section>'

        # --- симптомы
        '<section class="section section--surface" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Диагностика</span>'
        '<h2>С чем к нам приходят</h2>'
        '<p class="lead">Найдите свою ситуацию — так вы примерно поймёте, о чём '
        'пойдёт речь на диагностике.</p></div>'
        '<div class="grid grid--3">'
        + "".join('<div class="symptom"><b>%s</b><p>%s</p></div>' % s for s in symptoms) +
        '</div></div></section>'

        # --- цены + форма
        '<section class="section" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Прайс</span>'
        '<h2>Цены на ремонт телевизоров</h2>'
        '<p class="lead">Вилка зависит от диагонали, модели и объёма работ. '
        'Точную сумму называем после бесплатной диагностики.</p></div>'
        '<div class="servicehero" style="align-items:start">'
        '<div class="tablewrap"><table class="ptable">'
        '<thead><tr><th>Услуга</th><th class="is-right">Цена</th></tr></thead><tbody>'
        '<tr><td><div class="ptable__name">Ремонт подсветки телевизора'
        '<span>Есть звук, нет изображения</span></div></td>'
        '<td class="ptable__price is-right">2 000–15 000 ₽</td></tr>'
        '<tr><td><div class="ptable__name">Ремонт платы телевизора'
        '<span>Компонентный ремонт материнских плат и блоков питания</span></div></td>'
        '<td class="ptable__price is-right">1 500–10 000 ₽</td></tr>'
        '<tr><td><div class="ptable__name">Замена разъёма телевизора'
        '<span>USB, HDMI, RF-антенное</span></div></td>'
        '<td class="ptable__price is-right">1 000–4 000 ₽</td></tr>'
        '<tr><td><div class="ptable__name">Прошивка телевизора'
        '<span>Обновление ОС и прошивка</span></div></td>'
        '<td class="ptable__price is-right">1 000–4 000 ₽</td></tr>'
        '</tbody></table>'
        '<div class="callout" style="margin-top:24px"><b>Диагностика — 0 ₽</b>'
        '<p>Даже если после диагностики вы решите не ремонтировать телевизор, '
        'платить за неё не нужно.</p></div></div>'
        + fullform("tv", "tv-service", "Заявка на ремонт телевизора",
                   "Укажите модель — назовём вилку по цене ещё до визита.") +
        '</div></div></section>'

        # --- отзывы по услуге
        '<section class="section section--surface" data-reveal><div class="container">'
        '<div class="section-head section-head--split"><div>'
        '<span class="eyebrow">Отзывы</span><h2>Отзывы о ремонте телевизоров</h2></div>'
        '<a class="btn btn--ghost" href="otzyvy.html">Все отзывы</a></div>'
        '<div class="grid grid--3">'
        + "".join(review_card(r, i == 0)
                  for i, r in enumerate([x for x in REVIEWS if x[2] == "tv"][:3])) +
        '</div></div></section>'

        + faq(tv_faq, "Вопросы о ремонте телевизоров")
        + ctaband("tv-cta"))

    page("remont-televizorov.html",
         "Ремонт телевизоров в Магнитогорске — от 1 000 ₽ | Сервисный центр «Атом»",
         "Ремонт подсветки, плат, разъёмов и прошивка телевизоров в Магнитогорске. "
         "Цены 1 000–15 000 ₽, бесплатная диагностика, гарантия на работы.",
         body)


def build_about():
    team = [
        ("АК", "Артём К.", "Руководитель сервиса",
         "Отвечает за приём техники и согласование стоимости. С ним вы говорите, "
         "когда привозите устройство.",
         ["Приём и выдача", "Согласование смет"]),
        ("МВ", "Михаил В.", "Инженер по телевизорам",
         "Подсветка, блоки питания, платы обработки изображения. Работает с панелями "
         "любых диагоналей.",
         ["Подсветка", "Блоки питания", "Прошивка"]),
        ("ДС", "Дмитрий С.", "Инженер по ноутбукам",
         "Компонентный ремонт материнских плат: цепи питания, короткие замыкания, "
         "восстановление после залития.",
         ["Материнские платы", "Залития"]),
        ("РН", "Роман Н.", "Мастер по смартфонам",
         "Пайка разъёмов и шлейфов, замена модулей, микропайка. Работает с двадцатью "
         "брендами телефонов.",
         ["Микропайка", "Разъёмы", "Модули"]),
        ("ЕТ", "Евгений Т.", "Мастер по бытовой технике",
         "Пылесосы, микроволновки, мультиварки, мясорубки, фены. Берётся за технику, "
         "от которой отказываются другие.",
         ["Мелкая техника", "Электрика"]),
        ("ИЛ", "Илья Л.", "Инженер-диагност",
         "Проводит бесплатную диагностику и проверяет сопутствующие узлы, чтобы "
         "техника не вернулась с той же неисправностью.",
         ["Диагностика", "Контроль качества"]),
    ]

    body = (
        '<section class="pagehead"><div class="container pagehead__inner">'
        '<nav class="breadcrumbs" aria-label="Хлебные крошки">'
        '<a href="index.html">Главная</a><span>/</span><span>О компании</span></nav>'
        '<h1>О сервисном центре «Атом»</h1>'
        '<p class="lead">Мы ремонтируем электронику в Магнитогорске и отвечаем за '
        'результат репутацией: 4.8 из 5 на Яндекс.Картах по 197 оценкам.</p>'
        '</div></section>'

        '<section class="section" data-reveal><div class="container">'
        '<div class="servicehero" style="align-items:start">'
        '<div class="prose">'
        '<span class="eyebrow">О нас</span>'
        '<h2 style="margin-bottom:4px">Сервисный ЦЕНТР, а не мастерская</h2>'
        '<p>«Атом» — сервисный центр на проспекте Карла Маркса, 56, в Ленинском районе '
        'Магнитогорска. Мы занимаемся ремонтом телевизоров, ноутбуков, смартфонов и '
        'мелкой бытовой техники.</p>'
        '<p>Главное отличие от гаражного ремонта — <strong>компонентный подход</strong>. '
        'Там, где проще и выгоднее поменять модуль целиком, мы находим конкретный '
        'вышедший из строя элемент и меняем его. Для клиента это почти всегда дешевле, '
        'а для нас — вопрос профессиональной честности.</p>'
        '<h3>Как мы работаем с ценой</h3>'
        '<p>Диагностика бесплатная и ни к чему не обязывает. После неё мы называем '
        'точную стоимость и срок. Пока вы не согласились, работы не начинаются, и '
        'сумма в процессе не растёт. Оплата — после ремонта, картой или наличными.</p>'
        '<h3>Что мы обещаем</h3>'
        '<p>Если ремонт нецелесообразен — мы скажем об этом прямо, даже если могли бы '
        'взять деньги за работу. Если техника вернётся с той же неисправностью в '
        'течение гарантийного срока — разберёмся за свой счёт.</p>'
        '</div>'
        '<figure class="figure">'
        '<img src="assets/img/board-bench.jpg" alt="Рабочее место инженера сервисного '
        'центра «Атом»" loading="lazy" width="1200" height="900">'
        '<figcaption>Рабочее место инженера: компонентный ремонт плат под увеличением</figcaption>'
        '</figure></div></div></section>'

        # --- показатели
        '<section class="section section--surface" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Показатели</span>'
        '<h2>Как нас оценивают в городе</h2></div>'
        '<div class="grid grid--4">'
        '<div class="metric"><b>4.8</b><span>Рейтинг на Яндекс.Картах</span></div>'
        '<div class="metric"><b>197</b><span>Оценок от клиентов</span></div>'
        '<div class="metric"><b>166</b><span>Развёрнутых отзывов</span></div>'
        '<div class="metric"><b>90</b><span>Фотографий работ и сервиса</span></div>'
        '</div>'
        '<div style="margin-top:28px">' + PLATFORMS + '</div></div></section>'

        # --- ценности
        '<section class="section" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Принципы</span>'
        '<h2>Четыре правила, которые мы не нарушаем</h2></div>'
        '<div class="grid grid--4">'
        '<div class="perk"><span class="perk__icon">' + I_CHIP + '</span>'
        '<h3>Сначала диагностика</h3><p>Никаких работ и трат до того, как понятна '
        'причина поломки.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_WALLET + '</span>'
        '<h3>Цена не меняется</h3><p>Согласованная сумма фиксируется. Если всплывает '
        'что-то ещё — звоним и обсуждаем.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_TOOLS + '</span>'
        '<h3>Ремонт, а не замена</h3><p>Восстанавливаем плату по компонентам, '
        'если это возможно и надёжно.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_SHIELD + '</span>'
        '<h3>Отвечаем за результат</h3><p>Гарантия на работы и запчасти. '
        'Гарантийный случай решаем за свой счёт.</p></div>'
        '</div></div></section>'

        # --- команда
        '<section class="section section--surface" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Команда</span>'
        '<h2>Кто будет заниматься вашей техникой</h2>'
        '<p class="lead">У каждого направления свой инженер. Технику не передают '
        '«кому свободно» — ей занимается профильный мастер.</p></div>'
        '<div class="grid grid--3">'
        + "".join('<article class="person"><span class="person__avatar" aria-hidden="true">'
                  '%s</span><div><h3>%s</h3><span class="person__role">%s</span></div>'
                  '<p>%s</p><div class="person__meta">%s</div></article>'
                  % (a, n, role, text, "".join('<span class="tag">%s</span>' % t for t in tags))
                  for a, n, role, text, tags in team) +
        '</div>'
        '<!-- ДЕМО: имена мастеров указаны сокращённо как образец. '
        'Заменить на реальный состав команды и, при желании, добавить фотографии. -->'
        '</div></section>'

        # --- документы
        '<section class="section" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Документы</span>'
        '<h2>Документы и гарантия</h2></div>'
        '<div class="grid grid--3">'
        '<div class="callout"><b>Квитанция на приём</b>'
        '<p>При сдаче техники оформляем документ с описанием устройства, его '
        'состояния и заявленной неисправности.</p></div>'
        '<div class="callout" style="background:#fff;border-color:var(--line)">'
        '<b>Гарантийный талон</b>'
        '<p>После ремонта выдаём талон с перечнем работ, установленных запчастей '
        'и сроком гарантии.</p></div>'
        '<div class="callout" style="background:#fff;border-color:var(--line)">'
        '<b>Чек об оплате</b>'
        '<p>Оплата картой или наличными после ремонта, с подтверждающим документом.</p>'
        '</div></div>'
        '<div style="margin-top:28px"><a class="link-arrow" href="garantii.html">'
        'Подробные условия гарантии' + I_ARROW + '</a></div>'
        '</div></section>'

        + ctaband("about"))

    page("o-kompanii.html",
         "О компании — сервисный центр «Атом», Магнитогорск",
         "Сервисный центр «Атом» на проспекте Карла Маркса, 56 в Магнитогорске: "
         "команда, принципы работы, документы и гарантии. 4.8 на Яндекс.Картах.",
         body)


def build_warranty():
    g_faq = [
        ("Что нужно, чтобы обратиться по гарантии?",
         "Достаточно гарантийного талона или квитанции о приёме и самого устройства. "
         "Если документ потерялся — найдём вашу заявку по номеру телефона."),
        ("Гарантия распространяется на всё устройство?",
         "Нет. Гарантия действует на выполненные нами работы и установленные нами "
         "запчасти. На другие узлы, которые мы не ремонтировали, она не распространяется."),
        ("Сколько времени занимает гарантийный ремонт?",
         "Мы проводим повторную диагностику в приоритетном порядке. Сроки зависят от "
         "характера неисправности, но гарантийные обращения всегда идут первыми."),
        ("Гарантийный ремонт платный?",
         "Нет. Если случай признан гарантийным, повторная диагностика и работы "
         "выполняются бесплатно."),
        ("В каких случаях гарантия не действует?",
         "Механические повреждения после ремонта, попадание влаги, следы вскрытия "
         "или вмешательства третьих лиц, нарушение условий эксплуатации, а также "
         "неисправности узлов, которые мы не ремонтировали."),
        ("Что с гарантией после ремонта залитой техники?",
         "Устройства с последствиями залития — отдельный случай. Коррозия может "
         "проявиться позже, поэтому по таким работам условия гарантии оговариваются "
         "индивидуально и фиксируются в талоне. Мы предупреждаем об этом до ремонта."),
    ]

    body = (
        '<section class="pagehead"><div class="container pagehead__inner">'
        '<nav class="breadcrumbs" aria-label="Хлебные крошки">'
        '<a href="index.html">Главная</a><span>/</span><span>Гарантии</span></nav>'
        '<h1>Гарантия на ремонт</h1>'
        '<p class="lead">Мы отвечаем за то, что сделали. Ниже — как это работает '
        'на практике и что делать, если техника снова не работает.</p>'
        '</div></section>'

        '<section class="section" data-reveal><div class="container">'
        '<div class="grid grid--3">'
        '<div class="perk"><span class="perk__icon">' + I_SHIELD + '</span>'
        '<h3>Гарантия на работы</h3><p>Распространяется на все выполненные нами '
        'ремонтные операции.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_CHIP + '</span>'
        '<h3>Гарантия на запчасти</h3><p>Действует на детали, которые мы подобрали '
        'и установили.</p></div>'
        '<div class="perk"><span class="perk__icon">' + I_DOC + '</span>'
        '<h3>Письменный талон</h3><p>Срок и перечень работ фиксируются в документе '
        'при выдаче техники.</p></div>'
        '</div></div></section>'

        '<section class="section section--surface" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Условия</span>'
        '<h2>Что покрывает гарантия по видам работ</h2>'
        '<p class="lead">Конкретный срок зависит от вида работ, модели устройства '
        'и типа установленной детали. Он всегда указывается в гарантийном талоне '
        'при выдаче техники.</p></div>'
        '<div class="tablewrap"><table class="ptable">'
        '<thead><tr><th>Вид работ</th><th>Что покрывает гарантия</th>'
        '<th>Что не покрывает</th></tr></thead><tbody>'
        '<tr><td>Ремонт подсветки телевизора</td>'
        '<td>Заменённые светодиодные линейки и работа по их установке</td>'
        '<td>Механические повреждения матрицы после выдачи</td></tr>'
        '<tr><td>Ремонт платы (ТВ, ноутбук)</td>'
        '<td>Восстановленные цепи и заменённые компоненты</td>'
        '<td>Новые неисправности других узлов платы</td></tr>'
        '<tr><td>Замена разъёма</td>'
        '<td>Пайка и сам установленный разъём</td>'
        '<td>Повторное механическое воздействие на разъём</td></tr>'
        '<tr><td>Прошивка</td>'
        '<td>Корректная работа установленного ПО</td>'
        '<td>Сбои после самостоятельного обновления пользователем</td></tr>'
        '<tr><td>Замена матрицы, клавиатуры, модулей</td>'
        '<td>Установленная деталь и работа по установке</td>'
        '<td>Падения, удары, попадание жидкости</td></tr>'
        '<tr><td>Чистка и замена термопасты</td>'
        '<td>Качество выполненной профилактики</td>'
        '<td>Естественное загрязнение при дальнейшей эксплуатации</td></tr>'
        '<tr><td>Восстановление после залития</td>'
        '<td>Выполненные работы в объёме, указанном в талоне</td>'
        '<td>Отложенные последствия коррозии — оговариваются отдельно</td></tr>'
        '</tbody></table></div></div></section>'

        '<section class="section" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Порядок действий</span>'
        '<h2>Что делать в гарантийном случае</h2>'
        '<p class="lead">Если после ремонта проявилась та же неисправность — '
        'не пытайтесь чинить самостоятельно и не обращайтесь в другой сервис: '
        'это снимает гарантию.</p></div>'
        '<div class="steps">'
        '<div class="step"><span class="step__num">01</span><h3>Позвоните нам</h3>'
        '<p>Опишите, что произошло. Телефон ' + PHONE + ', ежедневно с 9:00 до 18:00.</p>'
        '<span class="step__meta">Или напишите в WhatsApp</span></div>'
        '<div class="step"><span class="step__num">02</span><h3>Привезите технику</h3>'
        '<p>С гарантийным талоном или квитанцией. Если документ потерян — найдём '
        'заявку по номеру телефона.</p>'
        '<span class="step__meta">Пр. Карла Маркса, 56</span></div>'
        '<div class="step"><span class="step__num">03</span><h3>Повторная диагностика</h3>'
        '<p>Проверяем, связана ли неисправность с нашими работами. Делаем это '
        'в приоритетном порядке.</p>'
        '<span class="step__meta">Бесплатно</span></div>'
        '<div class="step"><span class="step__num">04</span><h3>Устраняем за свой счёт</h3>'
        '<p>Если случай гарантийный — ремонтируем бесплатно. Если нет — объясним '
        'причину и предложим решение.</p>'
        '<span class="step__meta">Без доплат</span></div>'
        '</div>'
        '<div class="callout" style="margin-top:40px">'
        '<b>Гарантия сохраняется, пока технику не вскрывали другие</b>'
        '<p>Следы стороннего вмешательства, самостоятельного ремонта или обращения '
        'в другой сервис после нашего ремонта прекращают действие гарантии. '
        'Если что-то пошло не так — сначала позвоните нам.</p></div>'
        '</div></section>'

        + faq(g_faq, "Вопросы о гарантии")
        + ctaband("warranty"))

    page("garantii.html",
         "Гарантии на ремонт — сервисный центр «Атом», Магнитогорск",
         "Условия гарантии сервисного центра «Атом»: что покрывает гарантия по видам "
         "работ, что делать в гарантийном случае, ответы на частые вопросы.",
         body)


def build_reviews():
    filters = [("all", "Все отзывы"), ("tv", "Телевизоры"), ("laptop", "Ноутбуки"),
               ("phone", "Телефоны"), ("appliance", "Бытовая техника")]

    body = (
        '<section class="pagehead"><div class="container pagehead__inner">'
        '<nav class="breadcrumbs" aria-label="Хлебные крошки">'
        '<a href="index.html">Главная</a><span>/</span><span>Отзывы</span></nav>'
        '<h1>Отзывы клиентов</h1>'
        '<p class="lead">Рейтинг 4.8 из 5 на Яндекс.Картах: 197 оценок, 166 отзывов '
        'и 90 фотографий от жителей Магнитогорска.</p>'
        '</div></section>'

        '<section class="section section--tight" data-reveal><div class="container">'
        '<div class="grid grid--4">'
        '<div class="metric"><b>4.8</b><span>Средняя оценка</span></div>'
        '<div class="metric"><b>197</b><span>Оценок</span></div>'
        '<div class="metric"><b>166</b><span>Отзывов</span></div>'
        '<div class="metric"><b>90</b><span>Фотографий</span></div>'
        '</div>'
        '<div style="margin-top:28px">' + PLATFORMS + '</div></div></section>'

        '<section class="section" data-reveal><div class="container">'
        '<div class="section-head section-head--split"><div>'
        '<span class="eyebrow">Отзывы</span><h2>По типу техники</h2>'
        '<p class="lead">Показано отзывов: <span data-filter-count>'
        + str(len(REVIEWS)) + '</span></p></div></div>'
        '<div class="filters" data-filters role="group" aria-label="Фильтр отзывов">'
        + "".join('<button class="filter%s" type="button" data-filter="%s" '
                  'aria-pressed="%s">%s</button>'
                  % (" is-active" if key == "all" else "", key,
                     "true" if key == "all" else "false", label)
                  for key, label in filters) +
        '</div>'
        '<!-- ДЕМО-КОНТЕНТ: тексты отзывов — образец наполнения. '
        'Перед публикацией заменить на реальные отзывы с Яндекс.Карт. -->'
        '<div class="reviews-grid">'
        + "".join(review_card(r, i % 4 == 0) for i, r in enumerate(REVIEWS)) +
        '</div></div></section>'

        + ctaband("reviews"))

    page("otzyvy.html",
         "Отзывы о сервисном центре «Атом» — Магнитогорск",
         "Отзывы клиентов сервисного центра «Атом» в Магнитогорске о ремонте "
         "телевизоров, ноутбуков, телефонов и бытовой техники. 4.8 на Яндекс.Картах.",
         body)


def build_contacts():
    body = (
        '<section class="pagehead"><div class="container pagehead__inner">'
        '<nav class="breadcrumbs" aria-label="Хлебные крошки">'
        '<a href="index.html">Главная</a><span>/</span><span>Контакты</span></nav>'
        '<h1>Контакты</h1>'
        '<p class="lead">Сервисный центр «Атом» — в одной минуте от остановки '
        '«Карла Маркса д.55». Работаем ежедневно с 9:00 до 18:00.</p>'
        '</div></section>'

        '<section class="section section--tight" data-reveal><div class="container">'
        '<div class="map" data-map="' + MAP_SRC + '">'
        '<div class="map__placeholder"><div class="map__placeholder-inner">'
        '<span class="map__pin">' + I_PIN + '</span>'
        '<div><b style="font-family:Manrope,sans-serif;font-size:1.0625rem">'
        'Проспект Карла Маркса, 56</b>'
        '<p class="small muted" style="margin-top:4px">1 этаж, 53-й а м-н, '
        'Ленинский район, Магнитогорск</p></div>'
        '<button class="btn btn--sm" type="button" data-map-load>Показать карту</button>'
        '<a class="small muted" href="' + MAP_LINK + '" target="_blank" rel="noopener" '
        'style="text-decoration:underline;text-underline-offset:2px">'
        'Открыть в Яндекс.Картах</a>'
        '</div></div></div></div></section>'

        '<section class="section section--tight" data-reveal><div class="container">'
        '<div class="servicehero" style="align-items:start">'
        '<div>'
        '<div class="section-head" style="margin-bottom:28px">'
        '<span class="eyebrow">Как связаться</span><h2>Контактные данные</h2></div>'
        '<dl class="contact-list">'
        '<div class="contact-row"><span class="contact-row__icon">' + I_PHONE + '</span>'
        '<div><dt>Телефон</dt><dd><a href="' + PHONE_HREF + '">' + PHONE + '</a>'
        '<small>Перезваниваем по заявкам в течение 15 минут</small></dd></div></div>'
        '<div class="contact-row"><span class="contact-row__icon">' + I_MAIL + '</span>'
        '<div><dt>Почта</dt><dd><a href="mailto:' + EMAIL + '">' + EMAIL + '</a>'
        '<small>Для обращений, документов и вопросов по гарантии</small></dd></div></div>'
        '<div class="contact-row"><span class="contact-row__icon">' + I_PIN + '</span>'
        '<div><dt>Адрес</dt><dd>Проспект Карла Маркса, 56'
        '<small>1 этаж, 53-й а м-н, Ленинский район, Магнитогорск, 455000</small>'
        '</dd></div></div>'
        '<div class="contact-row"><span class="contact-row__icon">' + I_CLOCK + '</span>'
        '<div><dt>Часы работы</dt><dd>Ежедневно, 9:00–18:00'
        '<small>Без выходных, включая праздники</small></dd></div></div>'
        '<div class="contact-row"><span class="contact-row__icon">' + I_ROUTE + '</span>'
        '<div><dt>Как добраться</dt><dd>Остановка «Карла Маркса д.55»'
        '<small>1 минута пешком, около 150 метров</small></dd></div></div>'
        '<div class="contact-row"><span class="contact-row__icon">' + I_WALLET + '</span>'
        '<div><dt>Оплата</dt><dd>Банковская карта и наличные'
        '<small>Оплата после ремонта, когда техника проверена</small></dd></div></div>'
        '</dl>'
        '<h3 style="margin:36px 0 16px">Мессенджеры</h3>'
        '<div class="messengers">'
        '<a class="messenger messenger--wa" href="' + WA + '" target="_blank" '
        'rel="noopener">' + I_WA_BIG + '<span>WhatsApp</span></a>'
        '<a class="messenger messenger--tg" href="' + TG + '" target="_blank" '
        'rel="noopener">' + I_TG + '<span>Telegram</span></a>'
        '<a class="messenger messenger--vk" href="' + VK + '" target="_blank" '
        'rel="noopener">' + I_VK + '<span>ВКонтакте</span></a>'
        '</div></div>'
        + fullform("contacts", "contacts", "Быстрая связь",
                   "Оставьте номер — перезвоним в течение 15 минут в рабочее время.") +
        '</div></div></section>'

        '<section class="section" data-reveal><div class="container">'
        '<div class="section-head"><span class="eyebrow">Реквизиты</span>'
        '<h2>Реквизиты компании</h2></div>'
        '<div class="grid grid--2">'
        '<div class="callout" style="background:#fff;border-color:var(--line)">'
        '<b>Сервисный центр «Атом»</b>'
        '<p>' + ADDRESS_FULL + '<br>Телефон: ' + PHONE + '<br>Почта: ' + EMAIL + '</p></div>'
        '<div class="callout"><b>Юридические реквизиты</b>'
        '<p>Полные реквизиты для договора и оплаты по счёту предоставляем по запросу — '
        'напишите на ' + EMAIL + ' или позвоните по телефону ' + PHONE + '.</p></div>'
        '<!-- Когда клиент предоставит ИНН/ОГРН/расчётный счёт — заменить блок выше '
        'на фактические реквизиты. Выдуманные номера здесь недопустимы. -->'
        '</div></div></section>'

        + ctaband("contacts-cta"))

    page("contakty.html",
         "Контакты — сервисный центр «Атом», Магнитогорск",
         "Адрес: Магнитогорск, проспект Карла Маркса, 56. Телефон +7 (932) 304-62-41, "
         "почта atom.postbox@gmail.com. Ежедневно 9:00–18:00, WhatsApp и Telegram.",
         body)


def main():
    build_index()
    build_uslugi()
    build_tv()
    build_about()
    build_warranty()
    build_reviews()
    build_contacts()


if __name__ == "__main__":
    main()
