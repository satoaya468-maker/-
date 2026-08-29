#!/usr/bin/env python3
"""
Сборка многостраничника EasyLead.

Страницы собираются из общей оболочки и тела страницы, поэтому шапка,
подвал и подключение стилей лежат в одном месте, а не копируются пять раз.

    python3 scripts/build.py

Результат кладётся рядом с исходниками и коммитится: на хостинг уходят
готовые html, ничего запускать там не нужно.
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'src')
SITE = 'https://example.com'          # ПРОВЕРЬ: подставьте свой домен

def read(*p):  return io.open(os.path.join(*p), encoding='utf-8').read()
def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, 'w', encoding='utf-8').write(s)

HEAD   = read(SRC, '_head.html')
HEADER = read(SRC, '_header.html')
TAIL   = read(SRC, '_tail.html')
HOME   = read(SRC, 'pages', 'index.body.html')

def block(html, start_marker, end_marker):
    a = html.index(start_marker)
    b = html.index(end_marker, a) + len(end_marker)
    return html[a:b]

# Форма и лента интеграций живут в теле главной. Вынимаем их оттуда, чтобы
# на остальных страницах они были теми же самыми, а не копией, которая
# разойдётся при первой же правке.
FORM  = block(HOME, '<form class="lead-form reveal" data-delay="2" data-lead-form novalidate>', '</form>')
STRIP = block(HOME, '  <!-- ================= ИНТЕГРАЦИИ', '  </section>')

# У формы на подстраницах свои id полей: два одинаковых id на странице
# ломают связь label с полем.
def form_for(slug):
    f = FORM
    for name in ('name', 'phone'):
        f = f.replace(f'for="closer-{name}"', f'for="{slug}-{name}"')
        f = f.replace(f'id="closer-{name}"',  f'id="{slug}-{name}"')
    return f

PAGES = [
  dict(slug='index', path='/', out='index.html',
       title='EasyLead. Сайты и автоматизация бизнеса в Магнитогорске',
       desc='Сайты и автоматизация в Магнитогорске. Запуск за три дня, цена 14 700 до 24 700 рублей. Бесплатный макет до оплаты. Не понравится результат, вернём деньги.',
       og='Клиенты из интернета, пока вы занимаетесь делом. Запуск за три дня, бесплатный макет до оплаты.',
       nav=None),
  dict(slug='sayty', path='/sayty/', out='sayty/index.html',
       title='Разработка сайтов в Магнитогорске от 14 700 ₽ | EasyLead',
       desc='Разработка сайтов под заявки в Магнитогорске. Структура, дизайн под телефон, форма заявки, домен и публикация. Цена от 14 700 рублей, фиксируется в смете.',
       og='Разработка сайтов в Магнитогорске. Собираем страницу вокруг одной задачи: чтобы посетитель оставил заявку.',
       nav='NAV_SAYTY'),
  dict(slug='avtomatizatsiya', path='/avtomatizatsiya/', out='avtomatizatsiya/index.html',
       title='Автоматизация бизнеса в Магнитогорске | EasyLead',
       desc='Автоматизация бизнеса в Магнитогорске: связываем сайт, заявки и мессенджеры так, чтобы ни одно обращение не терялось. Объём и цену считаем после бесплатного разбора.',
       og='Связываем сайт, заявки и мессенджеры так, чтобы ни одно обращение не терялось.',
       nav='NAV_AUTO'),
  dict(slug='tseny', path='/tseny/', out='tseny/index.html',
       title='Цены на сайты и автоматизацию | EasyLead, Магнитогорск',
       desc='Сколько стоит сайт и автоматизация в Магнитогорске. Сайт под заявки от 14 700 рублей. Цена фиксируется в смете до начала работ, предоплат до разбора нет.',
       og='Цену называем до начала работ и фиксируем в смете.',
       nav='NAV_TSENY'),
  dict(slug='kontakty', path='/kontakty/', out='kontakty/index.html',
       title='Контакты | EasyLead, Магнитогорск',
       desc='Контакты EasyLead: телефон и Telegram. Работаем в Магнитогорске, Челябинской области и по России.',
       og='Позвоните или напишите. Отвечаем сами, без отдела продаж и скриптов.',
       nav='NAV_KONTAKTY'),
]

ORG_SCHEMA = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "EasyLead",
  "description": "Сайты и автоматизации для бизнеса любого профиля.",
  "url": "%(site)s/",
  "telephone": "+7-933-982-88-07",
  "priceRange": "от 14700 RUB",
  "areaServed": [
    {"@type": "City", "name": "Магнитогорск"},
    {"@type": "AdministrativeArea", "name": "Челябинская область"}
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Магнитогорск",
    "addressRegion": "Челябинская область",
    "addressCountry": "RU"
  },
  "serviceType": ["Разработка сайтов", "Автоматизация бизнес-процессов"]
}
</script>''' % {'site': SITE}

def crumbs_schema(name, path):
    return ('<script type="application/ld+json">\n{\n'
            '  "@context": "https://schema.org",\n  "@type": "BreadcrumbList",\n'
            '  "itemListElement": [\n'
            '    {"@type": "ListItem", "position": 1, "name": "Главная", "item": "%s/"},\n'
            '    {"@type": "ListItem", "position": 2, "name": "%s", "item": "%s%s"}\n'
            '  ]\n}\n</script>' % (SITE, name, SITE, path))

CRUMB_NAMES = {'sayty': 'Сайты', 'avtomatizatsiya': 'Автоматизация',
               'tseny': 'Цены', 'kontakty': 'Контакты'}

def faq_schema(body):
    """Собирает FAQPage из самого блока вопросов, чтобы разметка не разъехалась
    с текстом на странице. Ставится только на главную: одинаковый FAQPage
    на нескольких адресах поисковик считает дублем."""
    items = re.findall(
        r'<summary class="faq__q">(.*?)<span class="faq__sign".*?</summary>\s*'
        r'<div class="faq__a"><p class="body">(.*?)</p>', body, re.S)
    if not items:
        return ''
    def clean(t):
        t = re.sub(r'<[^>]+>', '', t)
        return re.sub(r'\s+', ' ', t).replace('\u00a0', ' ').replace('"', '\\"').strip()
    qa = ',\n'.join(
        '    {"@type": "Question", "name": "%s",\n'
        '     "acceptedAnswer": {"@type": "Answer", "text": "%s"}}' % (clean(q), clean(a))
        for q, a in items)
    return ('<script type="application/ld+json">\n{\n'
            '  "@context": "https://schema.org",\n  "@type": "FAQPage",\n'
            '  "mainEntity": [\n%s\n  ]\n}\n</script>' % qa)

built = []
for p in PAGES:
    body = HOME if p['slug'] == 'index' else read(SRC, 'pages', p['slug'] + '.body.html')
    body = body.replace('{{FORM}}', form_for(p['slug'])).replace('{{STRIP}}', STRIP)

    header = HEADER
    for key in ('NAV_SAYTY', 'NAV_AUTO', 'NAV_TSENY', 'NAV_KONTAKTY'):
        header = header.replace('{{%s}}' % key,
                                ' aria-current="page"' if key == p['nav'] else '')

    schema = ORG_SCHEMA
    if p['slug'] in CRUMB_NAMES:
        schema += '\n' + crumbs_schema(CRUMB_NAMES[p['slug']], p['path'])
    if p['slug'] == 'index':
        faq = faq_schema(body)
        if faq:
            schema += '\n' + faq

    head = (HEAD.replace('{{TITLE}}', p['title'])
                .replace('{{DESC}}', p['desc'])
                .replace('{{OG_DESC}}', p['og'])
                .replace('{{SCHEMA}}', schema)
                .replace('{{SITE}}', SITE)
                .replace('{{PATH}}', p['path']))

    html = '<!DOCTYPE html>\n<html lang="ru">\n' + head + '\n<body>\n\n' \
           + read(SRC, '_grain.html') + '\n' + header + '\n\n' + body + '\n\n' + TAIL
    out = os.path.join(ROOT, p['out'])
    write(out, html)
    built.append((p['out'], len(html)))

# sitemap собирается из того же списка, поэтому не разъедется со страницами
urls = '\n'.join(
    '  <url>\n    <loc>%s%s</loc>\n    <changefreq>monthly</changefreq>\n'
    '    <priority>%s</priority>\n  </url>' % (SITE, p['path'], '1.0' if p['slug'] == 'index' else '0.8')
    for p in PAGES)
write(os.path.join(ROOT, 'sitemap.xml'),
      '<?xml version="1.0" encoding="UTF-8"?>\n'
      '<!-- Собирается scripts/build.py, руками не править. -->\n'
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % urls)

for name, size in built:
    print('  %-32s %5.1f КБ' % (name, size / 1024))
print('  %-32s %5d ссылок' % ('sitemap.xml', len(PAGES)))
