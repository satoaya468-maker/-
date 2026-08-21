#!/usr/bin/env python3
"""
Собирает однофайловое превью всего сайта: десять страниц, шрифты, стили
и скрипты в одном HTML без единого внешнего запроса. Нужно, чтобы отдать
заказчику одну ссылку, по которой сайт открывается и работает целиком —
включая калькулятор, квиз и карусель.

    npm run build && python3 tools/build-preview.py

Результат: preview/site-preview.html
"""
import base64, json, os, re

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
DIST = os.path.join(ROOT, "dist")
OUT = os.path.join(ROOT, "preview")
os.makedirs(OUT, exist_ok=True)

PAGES = [
    ("/", "index.html"), ("/ustanovka-gbo/", "ustanovka-gbo/index.html"),
    ("/dokumenty-gibdd/", "dokumenty-gibdd/index.html"), ("/ceny/", "ceny/index.html"),
    ("/kontakty/", "kontakty/index.html"), ("/kalkulyator/", "kalkulyator/index.html"),
    ("/otzyvy/", "otzyvy/index.html"), ("/diagnostika/", "diagnostika/index.html"),
    ("/to-i-remont/", "to-i-remont/index.html"), ("/pereoborudovanie/", "pereoborudovanie/index.html"),
]

# --- стили: шрифты становятся data-URI, чтобы не было ни одного запроса ---
css = open(os.path.join(ROOT, "assets/css/styles.css"), encoding="utf-8").read()
def inline_font(m):
    path = os.path.join(ROOT, m.group(1).lstrip("/"))
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    return "url(data:font/woff2;base64,%s)" % b64
css = re.sub(r"url\('(/assets/fonts/[^']+)'\)", inline_font, css)

js = open(os.path.join(ROOT, "assets/js/app.js"), encoding="utf-8").read()

MIME = {".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png",
        ".svg": "image/svg+xml"}


def inline_img(m):
    """Изображения тоже уходят в data-URI: у превью не должно быть
    ни одного внешнего запроса, иначе оно не откроется вне сервера."""
    ref = m.group(1)
    path = os.path.join(ROOT, ref.lstrip("/"))
    ext = os.path.splitext(ref)[1].lower()
    if not os.path.exists(path) or ext not in MIME:
        return m.group(0)
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    return m.group(0).replace(ref, "data:%s;base64,%s" % (MIME[ext], b64))

sprite, bodies, titles = None, {}, {}
for url, rel in PAGES:
    html = open(os.path.join(DIST, rel), encoding="utf-8").read()
    titles[url] = re.search(r"<title>(.*?)</title>", html, re.S).group(1)
    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S).group(1)
    body = re.sub(r'<script src="[^"]+"[^>]*></script>', "", body)
    # JSON-LD в превью не нужен, а его закрывающий </script> порвал бы
    # скрипт роутера, внутри которого разметка лежит строкой
    body = re.sub(r'<script type="application/ld\+json">.*?</script>', "", body, flags=re.S)
    # спрайт иконок общий — выносим один раз
    m = re.search(r'<svg xmlns[^>]*style="display:none".*?</svg>', body, re.S)
    if m:
        sprite = sprite or m.group(0)
        body = body.replace(m.group(0), "")
    # внутренние ссылки переводим на hash-маршруты
    body = re.sub(r'href="(/[a-z0-9\-/]*/?)(#[^"]*)?"',
                  lambda x: 'href="#%s%s"' % (x.group(1), x.group(2) or ""), body)
    body = re.sub(r'(?:src|srcset)="(/assets/img/[^"]+)"', inline_img, body)
    bodies[url] = body.strip()

def js_str(o):
    """JSON для вставки внутрь <script>: последовательность </ экранируется,
    иначе закрывающий тег внутри строки завершит скрипт раньше времени."""
    return json.dumps(o, ensure_ascii=False).replace("</", "<\\/")


shell = """<title>Сайт ГБО-АВТО, Златоуст</title>
<style>%s
/* превью: страница подменяется целиком, переход мгновенный */
#app{min-height:100vh}
</style>
%s
<div id="app"></div>
<script>
window.__GBO_PAGES__ = %s;
window.__GBO_TITLES__ = %s;
(function(){
  var app = document.getElementById('app');
  var appjs = %s;
  function route(){
    var u = location.hash.replace(/^#/, '') || '/';
    var anchor = '';
    var i = u.indexOf('#');
    if (i > -1) { anchor = u.slice(i + 1); u = u.slice(0, i); }
    if (!window.__GBO_PAGES__[u]) { anchor = u.replace(/^\\//, ''); u = '/'; }
    app.innerHTML = window.__GBO_PAGES__[u];
    document.title = window.__GBO_TITLES__[u];
    document.body.classList.remove('is-locked');
    try { new Function(appjs)(); } catch (e) { console.error(e); }
    var t = anchor && document.getElementById(anchor);
    if (t) t.scrollIntoView(); else window.scrollTo(0, 0);
  }
  addEventListener('hashchange', route);
  route();
})();
</script>""" % (css, sprite or "",
                js_str(bodies), js_str(titles), js_str(js))

path = os.path.join(OUT, "site-preview.html")
open(path, "w", encoding="utf-8").write(shell)
print("%s — %d КБ, страниц: %d" % (path, len(shell.encode()) / 1024, len(bodies)))
