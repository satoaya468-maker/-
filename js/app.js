/* Ракета — логика демо-магазина.
   Классический скрипт без сборки: работает с file:// и любого хостинга.
   Формы и оплата — заглушки (console.log), интеграции подключаются на следующем этапе. */
(function () {
  'use strict';

  var D = window.RAKETA;
  var ART = window.RaketaArt;
  var PAGE_SIZE = 12;

  /* ---------- Утилиты ---------- */
  function fmt(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }
  function monthly(n) { return fmt(Math.ceil(n / 12 / 10) * 10); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function qp(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }
  function byId(id) { return D.products.find(function (p) { return p.id === id; }); }
  function catById(id) { return D.categories.find(function (c) { return c.id === id; }); }
  function discount(p) { return p.old ? Math.round((1 - p.price / p.old) * 100) : 0; }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  /* ---------- Иконки (единый набор, stroke 1.8) ---------- */
  function I(paths, vb) {
    return '<svg viewBox="0 0 ' + (vb || '24 24') + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var IC = {
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>'),
    cart: I('<path d="M4 6h2l2.4 10.4a1.5 1.5 0 0 0 1.5 1.1h7.3a1.5 1.5 0 0 0 1.4-1.1L20.5 9H7"/><circle cx="10.5" cy="20.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="17.5" cy="20.5" r="1.4" fill="currentColor" stroke="none"/>'),
    menu: I('<path d="M4 7h16M4 12h16M4 17h10"/>'),
    x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    phone: I('<path d="M5.5 4h3l1.7 4.2-2 1.6a12.5 12.5 0 0 0 5.9 5.9l1.6-2 4.3 1.7v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 6.2 2 2 0 0 1 5.5 4z"/>'),
    heart: I('<path d="M12 20.3 5.4 13.6a4.5 4.5 0 1 1 6.4-6.3l.2.2.2-.2a4.5 4.5 0 1 1 6.4 6.3z"/>'),
    heartF: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.3 5.4 13.6a4.5 4.5 0 1 1 6.4-6.3l.2.2.2-.2a4.5 4.5 0 1 1 6.4 6.3z"/></svg>',
    chevR: I('<path d="m9 5 7 7-7 7"/>'),
    chevL: I('<path d="m15 5-7 7 7 7"/>'),
    arrowR: I('<path d="M4 12h15m-6-7 7 7-7 7"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    minus: I('<path d="M5 12h14"/>'),
    trash: I('<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 12.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8L6 7"/>'),
    check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    geo: I('<path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>'),
    clock: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2.5"/>'),
    truck: I('<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    shield: I('<path d="M12 3.5 5 6v5.2c0 4.4 3 7.7 7 9.3 4-1.6 7-4.9 7-9.3V6z"/><path d="m9.2 11.8 2 2 3.8-4"/>'),
    wrench: I('<path d="M14.5 6.5a4 4 0 0 0-5.4 4.6L4 16.2A2 2 0 1 0 6.8 19l5.1-5.1a4 4 0 0 0 4.6-5.4l-2.6 2.6-2.3-.6-.6-2.3z"/>'),
    card: I('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/>'),
    percent: I('<path d="m6 18 12-12"/><circle cx="7.8" cy="7.8" r="2.3"/><circle cx="16.2" cy="16.2" r="2.3"/>'),
    box: I('<path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2z"/><path d="m4.6 7.5 7.4 4 7.4-4M12 11.5V21"/>'),
    zap: I('<path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5z"/>'),
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.6 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6L3.8 9.5l5.7-.7z"/></svg>'
  };
  var ROCKET =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 2.6c2.8 2.1 4.3 5.2 4.3 8.6 0 1.5-.25 3-.8 4.4H8.5a12.6 12.6 0 0 1-.8-4.4c0-3.4 1.5-6.5 4.3-8.6z" fill="#fff"/>' +
    '<circle cx="12" cy="9.4" r="1.6" fill="#0e0e12"/>' +
    '<path d="M8.6 13.2 6.2 17l2.8-.5zM15.4 13.2l2.4 3.8-2.8-.5z" fill="#fff"/>' +
    '<path d="M12 17.2c.8 1 1.2 2.1 1.2 3.3-.8-.5-1.6-.5-2.4 0 0-1.2.4-2.3 1.2-3.3z" fill="#5b8bff"/></svg>';

  function stars(rating) {
    var out = '<span class="stars" aria-hidden="true">';
    for (var i = 1; i <= 5; i++) {
      out += '<svg viewBox="0 0 24 24" class="' + (i <= Math.round(rating) ? '' : 'off') + '"><path d="m12 3.6 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6L3.8 9.5l5.7-.7z"/></svg>';
    }
    return out + '</span>';
  }

  /* Арт товара: реальное фото (p.img), а до его загрузки — SVG-иллюстрация */
  function artOf(p) {
    return p.img
      ? '<img src="' + p.img + '" alt="" loading="lazy">'
      : ART(p.art, p.tone);
  }

  /* Мини-копия товара летит в иконку корзины */
  function flyToCart(fromEl, p) {
    if (!fromEl || !p || !Element.prototype.animate) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cartBtn = document.querySelector('.hdr .cartbtn');
    if (!cartBtn) return;
    var a = fromEl.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    var el = document.createElement('div');
    el.className = 'fly';
    el.innerHTML = artOf(p);
    el.style.left = (a.left + a.width / 2 - 23) + 'px';
    el.style.top = (a.top + a.height / 2 - 21) + 'px';
    document.body.appendChild(el);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2);
    var dy = b.top + b.height / 2 - (a.top + a.height / 2);
    el.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 70) + 'px) scale(.72)', opacity: .95, offset: .55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.18)', opacity: .25 }
    ], { duration: 620, easing: 'cubic-bezier(.3,.7,.35,1)' }).onfinish = function () { el.remove(); };
  }

  /* ---------- Корзина (localStorage) ---------- */
  var Cart = {
    KEY: 'raketa_cart_v1',
    read: function () {
      try {
        var c = JSON.parse(localStorage.getItem(this.KEY)) || {};
        return { items: c.items || [], bundles: c.bundles || [] };
      } catch (e) { return { items: [], bundles: [] }; }
    },
    write: function (c) {
      try { localStorage.setItem(this.KEY, JSON.stringify(c)); } catch (e) {}
      updateBadge(true);
    },
    add: function (id, qty) {
      var c = this.read();
      var line = c.items.find(function (i) { return i.id === id; });
      if (line) line.qty += (qty || 1); else c.items.push({ id: id, qty: qty || 1 });
      this.write(c);
    },
    setQty: function (id, qty) {
      var c = this.read();
      var line = c.items.find(function (i) { return i.id === id; });
      if (!line) return;
      line.qty = qty;
      if (line.qty <= 0) c.items = c.items.filter(function (i) { return i.id !== id; });
      this.write(c);
    },
    remove: function (id) {
      var c = this.read();
      c.items = c.items.filter(function (i) { return i.id !== id; });
      c.bundles = c.bundles.filter(function (b) { return b !== id; });
      this.write(c);
    },
    addBundle: function (ownerId) {
      var p = byId(ownerId);
      if (!p || !p.bundle) return;
      var c = this.read();
      [ownerId].concat(p.bundle.items).forEach(function (id) {
        var line = c.items.find(function (i) { return i.id === id; });
        if (line) line.qty += 1; else c.items.push({ id: id, qty: 1 });
      });
      if (c.bundles.indexOf(ownerId) === -1) c.bundles.push(ownerId);
      this.write(c);
    },
    clear: function () { this.write({ items: [], bundles: [] }); },
    count: function () {
      return this.read().items.reduce(function (s, i) { return s + i.qty; }, 0);
    },
    compute: function (promoRate) {
      var c = this.read();
      var lines = c.items.map(function (i) {
        var p = byId(i.id);
        return p ? { p: p, qty: i.qty, sum: p.price * i.qty, oldSum: (p.old || p.price) * i.qty } : null;
      }).filter(Boolean);
      var subtotal = lines.reduce(function (s, l) { return s + l.sum; }, 0);
      var oldSubtotal = lines.reduce(function (s, l) { return s + l.oldSum; }, 0);
      var activeBundles = c.bundles.map(byId).filter(function (p) {
        if (!p || !p.bundle) return false;
        var ids = c.items.map(function (i) { return i.id; });
        return ids.indexOf(p.id) !== -1 && p.bundle.items.every(function (id) { return ids.indexOf(id) !== -1; });
      });
      var bundleSave = activeBundles.reduce(function (s, p) { return s + p.bundle.save; }, 0);
      var promoSave = promoRate ? Math.round((subtotal - bundleSave) * promoRate) : 0;
      return {
        lines: lines, count: this.count(),
        subtotal: subtotal, oldSubtotal: oldSubtotal,
        productSave: oldSubtotal - subtotal,
        bundles: activeBundles, bundleSave: bundleSave, promoSave: promoSave,
        total: subtotal - bundleSave - promoSave
      };
    }
  };

  /* ---------- Избранное ---------- */
  var Fav = {
    KEY: 'raketa_fav_v1',
    read: function () { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; } },
    toggle: function (id) {
      var f = this.read(); var i = f.indexOf(id);
      if (i === -1) f.push(id); else f.splice(i, 1);
      try { localStorage.setItem(this.KEY, JSON.stringify(f)); } catch (e) {}
      return i === -1;
    },
    has: function (id) { return this.read().indexOf(id) !== -1; }
  };

  /* ---------- Тост ---------- */
  var toastTimer;
  function toast(msg, linkText, linkHref) {
    var el = document.querySelector('.toast');
    el.innerHTML = esc(msg) + (linkText ? ' <a href="' + linkHref + '">' + esc(linkText) + '</a>' : '');
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3400);
  }

  function updateBadge(pop) {
    var n = Cart.count();
    document.querySelectorAll('.cartbtn .count').forEach(function (b) {
      b.textContent = n > 99 ? '99+' : n;
      b.classList.toggle('show', n > 0);
      if (pop && n > 0) {
        b.style.transform = 'scale(1.25)';
        setTimeout(function () { b.style.transform = ''; }, 180);
      }
    });
  }

  /* ---------- Шапка и подвал ---------- */
  function chrome() {
    var page = document.body.dataset.page || '';
    var s = D.store;
    var navItems = [
      ['catalog.html', 'Каталог', 'catalog'],
      ['sales.html', 'Акции', 'sales'],
      ['delivery.html', 'Доставка и оплата', 'delivery'],
      ['warranty.html', 'Гарантия и сервис', 'warranty'],
      ['contacts.html', 'Контакты', 'contacts']
    ];
    var nav = navItems.map(function (n) {
      return '<a href="' + n[0] + '" class="' + (page === n[2] ? 'on' : '') + '">' + n[1] + '</a>';
    }).join('');

    var header =
      '<div class="topbar">Рассрочка 0-0-12 без переплат · Самовывоз сегодня: <b>' + esc(s.address) + '</b></div>' +
      '<header class="hdr"><div class="wrap hdr-in">' +
      '<a class="logo" href="index.html" aria-label="Ракета, на главную">' +
      '<span class="logo-mark">' + ROCKET + '</span><span class="logo-word">ракета</span></a>' +
      '<nav class="nav" aria-label="Основная навигация">' + nav + '</nav>' +
      '<div class="hdr-spacer"></div>' +
      '<form class="search" role="search" action="catalog.html"><label class="sr-only" for="q">Поиск</label>' +
      IC.search + '<input id="q" name="q" type="search" placeholder="Поиск по каталогу" autocomplete="off" value="' + esc(qp('q')) + '"></form>' +
      '<a class="hdr-phone" href="' + s.phoneHref + '">' + esc(s.phone) + '<small>' + esc(s.hours.toLowerCase()) + '</small></a>' +
      '<a class="iconbtn cartbtn" href="cart.html" aria-label="Корзина"><span class="count"></span>' + IC.cart + '</a>' +
      '<button class="iconbtn burger" aria-label="Меню">' + IC.menu + '</button>' +
      '</div></header>';

    var mcats = D.categories.map(function (c) {
      return '<a href="catalog.html?cat=' + c.id + '"><span class="mi">' + ART(c.art, c.tone) + '</span>' + esc(c.name) + '</a>';
    }).join('');
    var mmenu =
      '<div class="mmenu" aria-hidden="true"><div class="mmenu-bg"></div><div class="mmenu-panel">' +
      '<div class="mmenu-top"><a class="logo" href="index.html"><span class="logo-mark">' + ROCKET + '</span><span class="logo-word">ракета</span></a>' +
      '<button class="iconbtn mmenu-close" aria-label="Закрыть меню">' + IC.x + '</button></div>' +
      '<form class="search" style="display:block;width:100%" role="search" action="catalog.html">' + IC.search +
      '<input name="q" type="search" placeholder="Поиск по каталогу" autocomplete="off"></form>' +
      '<h4>Каталог</h4><div class="mmenu-list">' + mcats + '</div>' +
      '<h4>Покупателям</h4><div class="mmenu-list">' +
      navItems.slice(1).map(function (n) { return '<a href="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '</div>' +
      '<a class="btn btn-ghost btn-block mmenu-call" href="' + s.phoneHref + '">' + IC.phone + esc(s.phone) + '</a>' +
      '</div></div>';

    var fcats = D.categories.map(function (c) {
      return '<a href="catalog.html?cat=' + c.id + '">' + esc(c.name) + '</a>';
    }).join('');
    var footer =
      '<footer class="ftr"><div class="wrap">' +
      '<div class="ftr-grid">' +
      '<div class="ftr-brand"><a class="logo" href="index.html"><span class="logo-mark">' + ROCKET + '</span><span class="logo-word">ракета</span></a>' +
      '<p>Магазин электроники в Магнитогорске: оригинальная техника, честные цены, собственный сервисный центр.</p>' +
      '<div class="ftr-rating">' + stars(5) + '<span><b>' + D.store.rating + '</b> · ' + D.store.ratingCount + ' оценок на 2ГИС</span></div></div>' +
      '<div class="ftr-col"><h4>Каталог</h4>' + fcats + '</div>' +
      '<div class="ftr-col"><h4>Покупателям</h4>' +
      '<a href="delivery.html">Доставка и оплата</a><a href="warranty.html">Гарантия и сервис</a>' +
      '<a href="sales.html">Акции</a><a href="contacts.html">О магазине и контакты</a><a href="cart.html">Корзина</a></div>' +
      '<div class="ftr-col"><h4>Контакты</h4>' +
      '<p>' + esc(s.address) + ', ' + esc(s.city) + '</p><p>' + esc(s.hours) + '</p>' +
      '<a href="' + s.phoneHref + '"><b>' + esc(s.phone) + '</b></a><a href="mailto:' + s.email + '">' + s.email + '</a></div>' +
      '</div>' +
      '<div class="ftr-bottom"><span>© 2026 Магазин электроники «Ракета», Магнитогорск</span>' +
      '<span>Демо-версия сайта. Цены и наличие носят ознакомительный характер.</span></div>' +
      '</div></footer>';

    var hmount = document.getElementById('app-header');
    var fmount = document.getElementById('app-footer');
    if (hmount) hmount.outerHTML = header;
    if (fmount) fmount.outerHTML = footer;
    document.body.insertAdjacentHTML('beforeend', mmenu + '<div class="toast" role="status"></div>');

    var mm = document.querySelector('.mmenu');
    document.querySelector('.burger').addEventListener('click', function () {
      mm.classList.add('open'); mm.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
    function closeMenu() {
      mm.classList.remove('open'); mm.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    mm.querySelector('.mmenu-close').addEventListener('click', closeMenu);
    mm.querySelector('.mmenu-bg').addEventListener('click', closeMenu);

    updateBadge(false);

    /* Тень шапки после начала прокрутки */
    if ('IntersectionObserver' in window) {
      var sentry = document.createElement('div');
      sentry.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
      document.body.prepend(sentry);
      var hdrEl = document.querySelector('.hdr');
      new IntersectionObserver(function (en) {
        hdrEl.classList.toggle('scrolled', !en[0].isIntersecting);
      }).observe(sentry);
    }
  }

  /* ---------- Карточка товара ---------- */
  function badges(p, big) {
    var b = '';
    if (discount(p)) b += '<span class="badge badge-sale">−' + discount(p) + '%</span>';
    if (p.hit) b += '<span class="badge badge-hit">Хит</span>';
    if (p.isnew) b += '<span class="badge badge-new">Новинка</span>';
    return b ? '<div class="' + (big ? 'gmain-badges' : 'pcard-badges') + '">' + b + '</div>' : '';
  }

  function cardHTML(p) {
    return '<article class="pcard" data-href="product.html?id=' + p.id + '">' +
      '<div class="pcard-art">' + badges(p) + artOf(p) + '</div>' +
      '<button class="iconbtn pcard-fav ' + (Fav.has(p.id) ? 'act' : '') + '" data-fav="' + p.id + '" aria-label="В избранное">' +
      (Fav.has(p.id) ? IC.heartF : IC.heart) + '</button>' +
      '<div class="pcard-body">' +
      '<span class="pcard-brand">' + esc(p.brand) + '</span>' +
      '<a class="pcard-name" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a>' +
      '<span class="pcard-rate">' + stars(p.rating) + p.rating.toFixed(1) + ' · ' + p.votes + '</span>' +
      '<div class="pcard-priceline"><span class="pcard-price">' + fmt(p.price) + '</span>' +
      (p.old ? '<span class="price-old pcard-old">' + fmt(p.old) + '</span>' : '') + '</div>' +
      '<div class="pcard-cta"><button class="btn btn-ghost" data-add="' + p.id + '">' + IC.cart + 'В корзину</button></div>' +
      '</div></article>';
  }

  /* Глобальная делегация кликов по карточкам */
  function bindCardEvents(root) {
    (root || document).addEventListener('click', function (e) {
      var addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        e.preventDefault(); e.stopPropagation();
        var p = byId(addBtn.dataset.add);
        Cart.add(p.id, 1);
        flyToCart(addBtn, p);
        toast(p.name.length > 34 ? p.name.slice(0, 34) + '…' : p.name + ' в корзине', 'Оформить', 'cart.html');
        if (document.body.dataset.page === 'cart') renderCartPage();
        return;
      }
      var favBtn = e.target.closest('[data-fav]');
      if (favBtn) {
        e.preventDefault(); e.stopPropagation();
        var added = Fav.toggle(favBtn.dataset.fav);
        favBtn.classList.toggle('act', added);
        favBtn.innerHTML = added ? IC.heartF : IC.heart;
        toast(added ? 'Добавлено в избранное' : 'Убрано из избранного');
        return;
      }
      var card = e.target.closest('[data-href]');
      if (card && !e.target.closest('a,button,input,select,label')) {
        location.href = card.dataset.href;
      }
    });
  }

  /* Лента с прокруткой и стрелками */
  function rail(products, opts) {
    opts = opts || {};
    var id = 'rail' + Math.random().toString(36).slice(2, 8);
    var html =
      '<div class="sec-head"><div><h2>' + esc(opts.title) + '</h2>' +
      (opts.sub ? '<div class="sub">' + esc(opts.sub) + '</div>' : '') + '</div>' +
      '<div style="display:flex;align-items:center;gap:16px">' +
      (opts.link ? '<a class="seelink" href="' + opts.link + '">' + esc(opts.linkText || 'Все товары') + IC.chevR + '</a>' : '') +
      '<div class="rarrs"><button class="rarr" data-dir="-1" aria-label="Назад">' + IC.chevL + '</button>' +
      '<button class="rarr" data-dir="1" aria-label="Вперёд">' + IC.chevR + '</button></div></div></div>' +
      '<div class="rail"><div class="track" id="' + id + '">' +
      products.map(cardHTML).join('') + '</div></div>';
    setTimeout(function () {
      var track = document.getElementById(id);
      if (!track) return;
      var wrap = track.closest('.rail').parentElement;
      wrap.querySelectorAll('.rarr').forEach(function (b) {
        b.addEventListener('click', function () {
          track.scrollBy({ left: track.clientWidth * 0.8 * (+b.dataset.dir), behavior: 'smooth' });
        });
      });
    }, 0);
    return html;
  }

  /* ---------- Reveal-on-scroll ---------- */
  function reveal() {
    var els = document.querySelectorAll('.r');
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el, i) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) return; // не прячем то, что уже на экране
      el.classList.add('armed');
      el.style.transitionDelay = Math.min((i % 4) * 60, 180) + 'ms';
      obs.observe(el);
      /* Страховка: контент не должен зависеть от скролл-анимации */
      setTimeout(function () { el.classList.add('in'); }, 1800);
    });
  }

  /* ---------- Модалка «Купить в 1 клик» ---------- */
  function oneClick(p) {
    var old = document.querySelector('.modal');
    if (old) old.remove();
    var html =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Купить в один клик"><div class="modal-bg"></div>' +
      '<div class="modal-panel"><button class="iconbtn modal-x" aria-label="Закрыть">' + IC.x + '</button>' +
      '<h3>Купить в 1 клик</h3><p class="m-sub">Оставьте номер, менеджер перезвонит за 10 минут, подтвердит наличие и оформит заказ.</p>' +
      '<div class="modal-prod"><span class="mp-art">' + artOf(p) + '</span><b>' + esc(p.name) + '</b><span>' + fmt(p.price) + '</span></div>' +
      '<form class="oc-form"><div class="field"><label for="oc-phone">Телефон</label>' +
      '<input id="oc-phone" type="tel" inputmode="tel" placeholder="+7 ___ ___-__-__" required autocomplete="tel"></div>' +
      '<button class="btn btn-primary btn-lg btn-block" type="submit">Жду звонка</button>' +
      '<p class="fine">Демо-режим: заявка не отправляется, интеграция с CRM подключается на следующем этапе.</p></form>' +
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    var m = document.querySelector('.modal');
    requestAnimationFrame(function () { requestAnimationFrame(function () { m.classList.add('open'); }); });
    function close() { m.classList.remove('open'); setTimeout(function () { m.remove(); }, 300); }
    m.querySelector('.modal-bg').addEventListener('click', close);
    m.querySelector('.modal-x').addEventListener('click', close);
    m.querySelector('.oc-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = m.querySelector('#oc-phone').value.trim();
      if (phone.replace(/\D/g, '').length < 10) { m.querySelector('#oc-phone').focus(); return; }
      console.log('[РАКЕТА демо] Заказ в 1 клик:', { product: p.id, name: p.name, price: p.price, phone: phone });
      m.querySelector('.modal-panel').innerHTML =
        '<div class="success" style="padding:20px 0"><div class="s-ic">' + IC.check + '</div>' +
        '<h1 style="font-size:22px">Заявка принята</h1><p>Перезвоним на ' + esc(phone) + ' в течение 10 минут.</p>' +
        '<button class="btn btn-dark oc-done">Отлично</button></div>';
      m.querySelector('.oc-done').addEventListener('click', close);
    });
    setTimeout(function () { var f = m.querySelector('#oc-phone'); if (f) f.focus(); }, 350);
  }

  /* ============================================================
     Страницы
     ============================================================ */

  /* Лёгкий параллакс устройств в хиро за курсором */
  function heroParallax() {
    var box = document.querySelector('.hero-in');
    if (!box) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var layers = box.querySelectorAll('.hero-art .ha');
    if (!layers.length) return;
    var depths = { 'ha-laptop': 0.55, 'ha-phone': 1.05, 'ha-buds': 1.5 };
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function tick() {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      layers.forEach(function (l) {
        var d = 1;
        Object.keys(depths).forEach(function (k) { if (l.classList.contains(k)) d = depths[k]; });
        l.style.transform = 'translate3d(' + (cx * d).toFixed(2) + 'px,' + (cy * d).toFixed(2) + 'px,0)';
      });
      if (Math.abs(tx - cx) > 0.15 || Math.abs(ty - cy) > 0.15) raf = requestAnimationFrame(tick);
      else raf = null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    box.addEventListener('mousemove', function (e) {
      var r = box.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 11;
      kick();
    });
    box.addEventListener('mouseleave', function () { tx = 0; ty = 0; kick(); });
  }

  /* ---------- Главная ---------- */
  function renderHome() {
    var hits = D.products.filter(function (p) { return p.hit; });
    var news = D.products.filter(function (p) { return p.isnew; });
    var sale = D.products.filter(function (p) { return p.old; });

    document.getElementById('home-cats').innerHTML = D.categories.slice(0, 8).map(function (c) {
      var n = D.products.filter(function (p) { return p.cat === c.id; }).length;
      return '<a class="cat-tile r" href="catalog.html?cat=' + c.id + '"><b>' + esc(c.name) + '</b>' +
        '<span>' + n + ' ' + plural(n, 'товар', 'товара', 'товаров') + '</span>' +
        '<span class="cart-art">' + ART(c.art, c.tone) + '</span></a>';
    }).join('');

    document.getElementById('home-hits').innerHTML = rail(hits, {
      title: 'Хиты недели', sub: 'То, что покупают чаще всего', link: 'catalog.html', linkText: 'Весь каталог'
    });

    document.getElementById('home-sale-count').textContent =
      sale.length + ' ' + plural(sale.length, 'товар', 'товара', 'товаров');

    document.getElementById('home-new').innerHTML = rail(news, {
      title: 'Новинки', sub: 'Только что на полках', link: 'catalog.html', linkText: 'Смотреть все'
    });

    setTimeout(heroParallax, 900); /* после входной анимации хиро */
  }

  /* ---------- Каталог ---------- */
  var catState;
  function renderCatalog() {
    catState = {
      cat: qp('cat'), q: qp('q'), sale: qp('sale') === '1',
      brands: [], min: '', max: '', sort: 'pop', page: 1
    };
    buildFilterUI();
    applyCatalog();

    document.querySelector('.sortsel').addEventListener('change', function () {
      catState.sort = this.value; catState.page = 1; applyCatalog();
    });
    var fl = document.querySelector('.filters');
    document.querySelector('.fbtn').addEventListener('click', function () { fl.classList.add('open'); document.body.style.overflow = 'hidden'; });
    document.querySelectorAll('.fclose, .fapply').forEach(function (b) {
      b.addEventListener('click', function () { fl.classList.remove('open'); document.body.style.overflow = ''; });
    });
  }

  function pool() {
    var list = D.products.slice();
    if (catState.cat) list = list.filter(function (p) { return p.cat === catState.cat; });
    if (catState.q) {
      var q = catState.q.toLowerCase();
      list = list.filter(function (p) { return (p.name + ' ' + p.brand).toLowerCase().indexOf(q) !== -1; });
    }
    return list;
  }

  function buildFilterUI() {
    var base = pool();
    var brands = {};
    base.forEach(function (p) { brands[p.brand] = (brands[p.brand] || 0) + 1; });
    var bhtml = Object.keys(brands).sort().map(function (b) {
      return '<label class="check"><input type="checkbox" value="' + esc(b) + '" data-f="brand">' +
        '<span class="box">' + IC.check + '</span>' + esc(b) + ' <span style="color:var(--ink-3);font-size:12.5px">' + brands[b] + '</span></label>';
    }).join('');
    document.getElementById('f-brands').innerHTML = bhtml || '<span style="font-size:13px;color:var(--ink-3)">Нет брендов</span>';

    document.getElementById('f-sale').checked = catState.sale;

    var chips = '<a class="chip ' + (!catState.cat ? 'on' : '') + '" href="catalog.html' + (catState.q ? '?q=' + encodeURIComponent(catState.q) : '') + '">Все</a>' +
      D.categories.map(function (c) {
        return '<a class="chip ' + (catState.cat === c.id ? 'on' : '') + '" href="catalog.html?cat=' + c.id + '">' + esc(c.name) + '</a>';
      }).join('');
    document.getElementById('cat-chips').innerHTML = chips;

    document.querySelector('.filters').addEventListener('change', function (e) {
      if (e.target.dataset.f === 'brand') {
        catState.brands = Array.from(document.querySelectorAll('[data-f="brand"]:checked')).map(function (i) { return i.value; });
      }
      if (e.target.id === 'f-sale') catState.sale = e.target.checked;
      catState.page = 1; applyCatalog();
    });
    ['f-min', 'f-max'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        catState[id === 'f-min' ? 'min' : 'max'] = this.value;
        catState.page = 1;
        clearTimeout(this._t); var self = this;
        this._t = setTimeout(function () { applyCatalog(); }, 350);
      });
    });
    document.querySelector('.freset').addEventListener('click', function () {
      location.href = 'catalog.html' + (catState.cat ? '?cat=' + catState.cat : '');
    });
  }

  function applyCatalog() {
    var list = pool();
    if (catState.brands.length) list = list.filter(function (p) { return catState.brands.indexOf(p.brand) !== -1; });
    if (catState.sale) list = list.filter(function (p) { return p.old; });
    if (catState.min) list = list.filter(function (p) { return p.price >= +catState.min; });
    if (catState.max) list = list.filter(function (p) { return p.price <= +catState.max; });

    var sorts = {
      pop: function (a, b) { return (b.hit - a.hit) || (b.rating * b.votes - a.rating * a.votes); },
      cheap: function (a, b) { return a.price - b.price; },
      exp: function (a, b) { return b.price - a.price; },
      disc: function (a, b) { return discount(b) - discount(a); },
      new: function (a, b) { return (!!b.isnew - !!a.isnew) || (b.rating - a.rating); }
    };
    list.sort(sorts[catState.sort] || sorts.pop);

    var c = catById(catState.cat);
    var title = catState.q ? 'Поиск: «' + catState.q + '»' : (c ? c.name : 'Каталог');
    document.getElementById('cat-title').textContent = title;
    document.title = title + ' · Ракета, магазин электроники в Магнитогорске';
    document.getElementById('cat-count').textContent = list.length + ' ' + plural(list.length, 'товар', 'товара', 'товаров');
    var bc = document.getElementById('crumb-cur');
    if (bc) bc.textContent = title;

    /* Витрина флагмана: только чистая первая страница категории */
    var showcase = '';
    var noFilters = !catState.brands.length && !catState.sale && !catState.min && !catState.max && catState.sort === 'pop';
    var feat = c && noFilters && catState.page === 1 ?
      list.find(function (p) { return p.featured; }) : null;
    if (feat) {
      list = list.filter(function (p) { return p.id !== feat.id; });
      showcase =
        '<a class="showcase" href="product.html?id=' + feat.id + '">' +
        '<span class="sc-kick">Витрина категории</span><h3>' + esc(feat.name) + '</h3>' +
        '<p>' + esc(feat.desc) + '</p>' +
        '<div class="sc-price">' + fmt(feat.price) + (feat.old ? '<span class="price-old">' + fmt(feat.old) + '</span>' : '') + '</div>' +
        '<span class="btn btn-light">Подробнее' + IC.arrowR + '</span>' +
        '<span class="promo-art">' + artOf(feat) + '</span></a>';
    }

    var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    catState.page = Math.min(catState.page, pages);
    var slice = list.slice((catState.page - 1) * PAGE_SIZE, catState.page * PAGE_SIZE);

    var grid = document.getElementById('cat-grid');
    if (!list.length) {
      grid.innerHTML = '<div class="noresults" style="grid-column:1/-1"><b>Ничего не нашлось</b>' +
        'Попробуйте изменить запрос или сбросить фильтры</div>';
    } else {
      grid.innerHTML = showcase + slice.map(cardHTML).join('');
    }

    var pager = document.getElementById('cat-pager');
    if (pages > 1) {
      var pb = '';
      for (var i = 1; i <= pages; i++) {
        pb += '<button class="pageb ' + (i === catState.page ? 'on' : '') + '" data-pg="' + i + '">' + i + '</button>';
      }
      pager.innerHTML = pb;
      pager.querySelectorAll('[data-pg]').forEach(function (b) {
        b.addEventListener('click', function () {
          catState.page = +b.dataset.pg; applyCatalog();
          document.querySelector('.cat-top').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    } else pager.innerHTML = '';
  }

  /* ---------- Карточка товара ---------- */
  function renderProduct() {
    var p = byId(qp('id')) || D.products[0];
    var c = catById(p.cat);
    document.title = p.name + ' купить в Магнитогорске · Ракета';

    document.getElementById('crumbs').innerHTML =
      '<a href="index.html">Главная</a>' + IC.chevR +
      '<a href="catalog.html?cat=' + c.id + '">' + esc(c.name) + '</a>' + IC.chevR +
      '<span class="cur">' + esc(p.name) + '</span>';

    /* Галерея: три ракурса одной иллюстрации */
    var art = artOf(p);
    document.getElementById('gallery').innerHTML =
      '<div class="gmain" id="gmain">' + badges(p, true) + art + '</div>' +
      '<div class="gthumbs">' +
      '<button class="gthumb on" data-v="0" aria-label="Вид 1">' + art + '</button>' +
      '<button class="gthumb z" data-v="1" aria-label="Крупный план">' + art + '</button>' +
      '<button class="gthumb dark" data-v="2" aria-label="На тёмном">' + art + '</button></div>';
    var gmain = document.getElementById('gmain');
    document.querySelectorAll('.gthumb').forEach(function (t) {
      t.addEventListener('click', function () {
        document.querySelectorAll('.gthumb').forEach(function (x) { x.classList.remove('on'); });
        t.classList.add('on');
        gmain.classList.add('fading');
        setTimeout(function () {
          gmain.classList.toggle('zoom', t.dataset.v === '1');
          gmain.classList.toggle('dark', t.dataset.v === '2');
          gmain.classList.remove('fading');
        }, 150);
      });
    });

    var revs = D.reviews[p.id] || [];
    document.getElementById('pinfo').innerHTML =
      '<h1>' + esc(p.name) + '</h1>' +
      '<div class="pmeta">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + '</span>' +
      '<a class="rev-link" href="#reviews">' + p.votes + ' ' + plural(p.votes, 'оценка', 'оценки', 'оценок') + '</a>' +
      '<span>Арт. RK-' + p.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + '</span></div>' +
      '<div class="pprice"><span class="now">' + fmt(p.price) + '</span>' +
      (p.old ? '<span class="price-old">' + fmt(p.old) + '</span><span class="disc-chip">Выгода ' + fmt(p.old - p.price) + '</span>' : '') + '</div>' +
      '<p class="installment">В рассрочку: <b>' + monthly(p.price) + '/мес</b> на 12 месяцев без переплат</p>' +
      '<span class="stock">' + IC.check + 'В наличии в магазине сегодня</span>' +
      '<div class="buyrow"><button class="btn btn-primary btn-lg" id="add-main">' + IC.cart + 'В корзину</button>' +
      '<button class="btn btn-ghost btn-lg" id="oneclick">Купить в 1 клик</button>' +
      '<button class="iconbtn pcard-fav ' + (Fav.has(p.id) ? 'act' : '') + '" style="position:static;width:54px;height:54px" data-fav="' + p.id + '">' +
      (Fav.has(p.id) ? IC.heartF : IC.heart) + '</button></div>' +
      '<p class="oneclick-note">Позвоним за 10 минут, привезём сегодня или отложим на кассе</p>' +
      '<div class="dlv-mini">' +
      '<div class="dlv-row">' + IC.geo + '<div><b>Самовывоз сегодня, бесплатно</b><span>' + esc(D.store.address) + ' · ' + esc(D.store.hours.toLowerCase()) + '</span></div></div>' +
      '<div class="dlv-row">' + IC.truck + '<div><b>Доставка по Магнитогорску от 2 часов</b><span>' + fmt(D.delivery.courier) + ', бесплатно от ' + fmt(D.delivery.freeFrom) + '</span></div></div>' +
      '<div class="dlv-row">' + IC.shield + '<div><b>Официальная гарантия</b><span>Обмен или возврат в течение 14 дней</span></div></div>' +
      '</div>';

    document.getElementById('add-main').addEventListener('click', function () {
      Cart.add(p.id, 1); flyToCart(this, p); toast('Товар в корзине', 'Оформить', 'cart.html');
    });
    document.getElementById('oneclick').addEventListener('click', function () { oneClick(p); });

    /* Комплект «вместе дешевле» */
    var bwrap = document.getElementById('bundle');
    if (p.bundle) {
      var bitems = [p].concat(p.bundle.items.map(byId));
      var btotal = bitems.reduce(function (s, x) { return s + x.price; }, 0);
      bwrap.innerHTML =
        '<h3>Вместе дешевле на ' + fmt(p.bundle.save) + '</h3>' +
        '<div class="bundle-items">' +
        bitems.map(function (x, i) {
          return (i ? '<span class="bundle-plus">+</span>' : '') +
            '<a class="bundle-item" href="product.html?id=' + x.id + '"><span class="bi-art">' + artOf(x) + '</span>' +
            '<span>' + esc(x.name.length > 30 ? x.name.slice(0, 30) + '…' : x.name) + '</span></a>';
        }).join('') + '</div>' +
        '<div class="bundle-total"><span class="bt-price">' + fmt(btotal - p.bundle.save) + '</span>' +
        '<span class="price-old">' + fmt(btotal) + '</span>' +
        '<span class="bundle-save">Экономия ' + fmt(p.bundle.save) + '</span>' +
        '<button class="btn btn-dark" id="add-bundle">Добавить комплект</button></div>';
      document.getElementById('add-bundle').addEventListener('click', function () {
        Cart.addBundle(p.id);
        flyToCart(this, p);
        toast('Комплект в корзине, скидка применится автоматически', 'Оформить', 'cart.html');
      });
    } else bwrap.remove();

    /* С этим товаром покупают */
    var accWrap = document.getElementById('acc-sec');
    var accs = (p.acc || []).map(byId).filter(Boolean);
    if (accs.length) {
      document.getElementById('acc-cards').innerHTML = accs.map(function (a) {
        return '<div class="minicard" data-href="product.html?id=' + a.id + '">' +
          '<span class="mc-art">' + artOf(a) + '</span>' +
          '<div><b>' + esc(a.name) + '</b><div class="mc-price">' + fmt(a.price) + '</div></div>' +
          '<button class="mc-add" data-add="' + a.id + '" aria-label="Добавить в корзину">' + IC.plus + '</button></div>';
      }).join('');
    } else accWrap.remove();

    /* Характеристики и описание */
    document.getElementById('specs').innerHTML = p.specs.map(function (s) {
      return '<div class="spec"><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>';
    }).join('');
    document.getElementById('pdesc').innerHTML =
      '<p>' + esc(p.desc) + '</p><p style="margin-top:10px">Товар в наличии в магазине «Ракета» на ' +
      esc(D.store.address) + '. Перед покупкой можно посмотреть и проверить устройство, менеджер поможет с переносом данных и настройкой.</p>';

    /* Отзывы */
    var rwrap = document.getElementById('reviews-list');
    document.getElementById('rev-summary').innerHTML =
      '<span class="rs-num">' + p.rating.toFixed(1) + '</span>' +
      '<div>' + stars(p.rating) + '<div class="rs-meta">' + p.votes + ' ' + plural(p.votes, 'оценка', 'оценки', 'оценок') +
      ' · по данным магазина и 2ГИС</div></div>';
    if (revs.length) {
      rwrap.innerHTML = revs.map(function (r) {
        return '<div class="review"><div class="review-top"><b>' + esc(r.name) + '</b>' + stars(r.stars) +
          '<time>' + esc(r.date) + '</time></div><p>' + esc(r.text) + '</p></div>';
      }).join('');
    } else {
      rwrap.innerHTML = '<p class="rev-empty">Текстовых отзывов пока нет. Купили этот товар? Поделитесь впечатлением первым.</p>';
    }
    document.getElementById('rev-add').addEventListener('click', function () {
      toast('Демо-режим: форма отзыва подключается вместе с каталогом');
    });

    /* Похожие */
    var related = D.products.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 8);
    if (related.length) {
      document.getElementById('related').innerHTML = rail(related, {
        title: 'Похожие товары', link: 'catalog.html?cat=' + p.cat, linkText: c.name
      });
    }

    /* Мобильная панель покупки */
    var bar = document.getElementById('buybar');
    bar.innerHTML = '<div class="bb-price">' + fmt(p.price) + '<small>' + esc(p.name.slice(0, 26)) + (p.name.length > 26 ? '…' : '') + '</small></div>' +
      '<button class="btn btn-primary" id="bb-add">' + IC.cart + 'В корзину</button>';
    document.getElementById('bb-add').addEventListener('click', function () {
      Cart.add(p.id, 1); flyToCart(this, p); toast('Товар в корзине', 'Оформить', 'cart.html');
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        bar.classList.toggle('show', !en[0].isIntersecting);
      }, { threshold: 0 }).observe(document.querySelector('.buyrow'));
    } else bar.classList.add('show');
  }

  /* ---------- Корзина и оформление ---------- */
  var promoApplied = 0, promoCode = '';
  function renderCartPage() {
    var mount = document.getElementById('cart-root');
    var t = Cart.compute(promoApplied);

    if (!t.lines.length) {
      mount.innerHTML =
        '<div class="empty"><div class="e-ic">' + IC.cart + '</div><h1>Корзина пуста</h1>' +
        '<p>Загляните в каталог: хиты, новинки и честные скидки уже ждут.</p>' +
        '<a class="btn btn-primary btn-lg" href="catalog.html">Перейти в каталог</a></div>';
      return;
    }

    var lines = t.lines.map(function (l) {
      return '<div class="cline">' +
        '<a class="cline-art" href="product.html?id=' + l.p.id + '">' + artOf(l.p) + '</a>' +
        '<div class="cline-info"><a href="product.html?id=' + l.p.id + '"><b>' + esc(l.p.name) + '</b></a>' +
        '<span>' + esc(l.p.brand) + '</span>' +
        '<span class="cl-unit">' + fmt(l.p.price) + ' за шт.' + (l.p.old ? ' <span class="price-old">' + fmt(l.p.old) + '</span>' : '') + '</span>' +
        '<button class="cl-remove" data-rm="' + l.p.id + '">' + IC.trash + 'Удалить</button></div>' +
        '<div class="cline-side"><div class="qty">' +
        '<button data-q="-1" data-id="' + l.p.id + '" aria-label="Меньше">' + IC.minus + '</button><b>' + l.qty + '</b>' +
        '<button data-q="1" data-id="' + l.p.id + '" aria-label="Больше">' + IC.plus + '</button></div>' +
        '<span class="cline-sum">' + fmt(l.sum) + '</span></div></div>';
    }).join('');

    var bundleRows = t.bundles.map(function (b) {
      return '<div class="bundleline">' + IC.check + 'Комплект «' + esc(b.name.slice(0, 28)) + '…»: скидка ' + fmt(b.bundle.save) + ' применена</div>';
    }).join('');

    /* Рекомендации: аксессуары к товарам в корзине, которых ещё нет */
    var inCart = t.lines.map(function (l) { return l.p.id; });
    var recIds = [];
    t.lines.forEach(function (l) {
      (l.p.acc || []).forEach(function (id) {
        if (inCart.indexOf(id) === -1 && recIds.indexOf(id) === -1) recIds.push(id);
      });
    });
    var recs = recIds.slice(0, 6).map(byId).filter(Boolean);
    var recHtml = recs.length ?
      '<section class="sec" style="padding-top:34px"><div class="sec-head"><div><h2>Не забудьте добавить</h2>' +
      '<div class="sub">Подобрано к товарам в вашей корзине</div></div></div>' +
      '<div class="minicards">' + recs.map(function (a) {
        return '<div class="minicard" data-href="product.html?id=' + a.id + '">' +
          '<span class="mc-art">' + artOf(a) + '</span>' +
          '<div><b>' + esc(a.name) + '</b><div class="mc-price">' + fmt(a.price) + '</div></div>' +
          '<button class="mc-add" data-add="' + a.id + '" aria-label="Добавить">' + IC.plus + '</button></div>';
      }).join('') + '</div></section>' : '';

    mount.innerHTML =
      '<div class="cat-head" style="margin-top:8px"><h1>Корзина</h1><span class="cnt">' +
      t.count + ' ' + plural(t.count, 'товар', 'товара', 'товаров') + '</span></div>' +
      '<div class="cart-layout"><div>' + lines + bundleRows + recHtml + '</div>' +
      '<aside class="csummary"><h3>Ваш заказ</h3>' +
      '<div class="crow"><span>Товары (' + t.count + ')</span><b>' + fmt(t.oldSubtotal) + '</b></div>' +
      (t.productSave ? '<div class="crow saving"><span>Скидки на товары</span><b>−' + fmt(t.productSave) + '</b></div>' : '') +
      (t.bundleSave ? '<div class="crow saving"><span>Скидка за комплекты</span><b>−' + fmt(t.bundleSave) + '</b></div>' : '') +
      (t.promoSave ? '<div class="crow saving"><span>Промокод ' + esc(promoCode) + '</span><b>−' + fmt(t.promoSave) + '</b></div>' : '') +
      '<div class="crow"><span>Доставка</span><b>' + (t.total >= D.delivery.freeFrom ? 'Бесплатно' : 'от ' + fmt(D.delivery.courier)) + '</b></div>' +
      '<div class="promo-row"><label class="sr-only" for="promo">Промокод</label>' +
      '<input id="promo" placeholder="Промокод" value="' + esc(promoCode) + '"><button class="btn btn-ghost" id="promo-go">ОК</button></div>' +
      '<div class="promo-msg" id="promo-msg"></div>' +
      '<div class="ctotal"><span class="tt">Итого</span><span class="tsum">' + fmt(t.total) + '</span></div>' +
      '<a class="btn btn-primary btn-lg btn-block" href="#checkout">Перейти к оформлению</a>' +
      '<p class="fine">Демо-режим: онлайн-оплата и касса по 54-ФЗ подключаются на следующем этапе. Сейчас заказ оформляется менеджером.</p>' +
      '</aside></div>' +

      '<section class="checkout" id="checkout"><h2>Оформление заказа</h2>' +
      '<form id="order-form" novalidate><div class="fields">' +
      '<div class="field"><label for="o-name">Имя</label><input id="o-name" autocomplete="name" placeholder="Как к вам обращаться">' +
      '<div class="errmsg">Укажите имя</div></div>' +
      '<div class="field"><label for="o-phone">Телефон</label><input id="o-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__">' +
      '<div class="errmsg">Укажите корректный телефон</div></div>' +
      '<div class="field field-full"><label>Способ получения</label><div class="rgroup">' +
      '<label class="rcard"><input type="radio" name="dlv" value="pickup" checked><span class="dot"></span>' +
      '<div><b>Самовывоз из магазина</b><span>' + esc(D.store.address) + ' · сегодня после подтверждения</span></div>' +
      '<span class="rc-tag">Бесплатно</span></label>' +
      '<label class="rcard"><input type="radio" name="dlv" value="courier"><span class="dot"></span>' +
      '<div><b>Доставка по Магнитогорску</b><span>Сегодня или завтра, интервал согласует менеджер</span></div>' +
      '<span class="rc-tag">' + (Cart.compute(promoApplied).total >= D.delivery.freeFrom ? 'Бесплатно' : fmt(D.delivery.courier)) + '</span></label>' +
      '</div></div>' +
      '<div class="field field-full" id="addr-field" style="display:none"><label for="o-addr">Адрес доставки</label>' +
      '<input id="o-addr" autocomplete="street-address" placeholder="Улица, дом, квартира"></div>' +
      '<div class="field field-full"><label>Оплата</label><div class="rgroup">' +
      '<label class="rcard"><input type="radio" name="pay" value="cash" checked><span class="dot"></span>' +
      '<div><b>При получении</b><span>Наличными или картой в магазине / курьеру</span></div></label>' +
      '<label class="rcard"><input type="radio" name="pay" value="online"><span class="dot"></span>' +
      '<div><b>Онлайн на сайте</b><span>Подключается на следующем этапе (эквайринг + чек 54-ФЗ)</span></div>' +
      '<span class="rc-tag badge badge-new" style="height:24px">Скоро</span></label>' +
      '<label class="rcard"><input type="radio" name="pay" value="installment"><span class="dot"></span>' +
      '<div><b>Рассрочка 0-0-12</b><span>Оформление за 10 минут, нужен только паспорт</span></div></label>' +
      '</div></div>' +
      '<div class="field field-full"><label for="o-comment">Комментарий</label>' +
      '<textarea id="o-comment" placeholder="Например: позвоните заранее"></textarea></div>' +
      '</div>' +
      '<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:22px">' +
      '<button class="btn btn-primary btn-lg" type="submit">Оформить заказ</button>' +
      '<span style="font-size:13px;color:var(--ink-3)">Нажимая кнопку, вы соглашаетесь с условиями обработки данных</span></div>' +
      '</form></section>';

    /* события корзины */
    mount.querySelectorAll('[data-q]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = Cart.read();
        var line = c.items.find(function (i) { return i.id === b.dataset.id; });
        Cart.setQty(b.dataset.id, line.qty + (+b.dataset.q));
        renderCartPage();
      });
    });
    mount.querySelectorAll('[data-rm]').forEach(function (b) {
      b.addEventListener('click', function () { Cart.remove(b.dataset.rm); renderCartPage(); });
    });
    document.getElementById('promo-go').addEventListener('click', function (e) {
      e.preventDefault();
      var v = document.getElementById('promo').value.trim().toUpperCase();
      var msg = document.getElementById('promo-msg');
      if (D.promo[v]) {
        promoApplied = D.promo[v]; promoCode = v;
        renderCartPage();
        document.getElementById('promo-msg').textContent = 'Промокод применён: −' + Math.round(D.promo[v] * 100) + '%';
        document.getElementById('promo-msg').className = 'promo-msg ok';
      } else {
        promoApplied = 0; promoCode = '';
        msg.textContent = v ? 'Такого промокода нет. Подсказка: РАКЕТА10' : 'Введите промокод';
        msg.className = 'promo-msg err';
      }
    });
    mount.querySelectorAll('[name="dlv"]').forEach(function (r) {
      r.addEventListener('change', function () {
        document.getElementById('addr-field').style.display = r.value === 'courier' && r.checked ? '' : 'none';
      });
    });
    document.getElementById('order-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('o-name');
      var phone = document.getElementById('o-phone');
      var ok = true;
      name.closest('.field').classList.toggle('err', !name.value.trim());
      if (!name.value.trim()) ok = false;
      var digits = phone.value.replace(/\D/g, '');
      phone.closest('.field').classList.toggle('err', digits.length < 10);
      if (digits.length < 10) ok = false;
      if (!ok) return;

      var tt = Cart.compute(promoApplied);
      var order = {
        num: 'РК-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
        name: name.value.trim(), phone: phone.value.trim(),
        delivery: mount.querySelector('[name="dlv"]:checked').value,
        address: (document.getElementById('o-addr') || {}).value || '',
        payment: mount.querySelector('[name="pay"]:checked').value,
        comment: document.getElementById('o-comment').value.trim(),
        promo: promoCode || null,
        items: tt.lines.map(function (l) { return { id: l.p.id, name: l.p.name, qty: l.qty, price: l.p.price }; }),
        total: tt.total
      };
      console.log('[РАКЕТА демо] Новый заказ:', order);
      Cart.clear();
      mount.innerHTML =
        '<div class="success"><div class="s-ic">' + IC.check + '</div>' +
        '<h1>Заказ оформлен</h1>' +
        '<p>Номер заказа: <span class="ordernum">' + order.num + '</span></p>' +
        '<p>Менеджер позвонит на ' + esc(order.phone) + ' в течение 10 минут, подтвердит наличие и ' +
        (order.delivery === 'pickup' ? 'отложит товар на кассе.' : 'согласует время доставки.') + '</p>' +
        '<a class="btn btn-primary btn-lg" href="catalog.html">Продолжить покупки</a></div>';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Акции ---------- */
  function renderSales() {
    var sale = D.products.filter(function (p) { return p.old; })
      .sort(function (a, b) { return discount(b) - discount(a); });
    document.getElementById('sale-grid').innerHTML = sale.map(cardHTML).join('');
    document.getElementById('sale-count').textContent =
      sale.length + ' ' + plural(sale.length, 'товар со скидкой', 'товара со скидкой', 'товаров со скидкой');
  }

  /* ---------- Контакты ---------- */
  function renderContacts() {
    var f = document.getElementById('contact-form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = f.querySelector('#cf-name').value.trim();
      var phone = f.querySelector('#cf-phone').value.trim();
      if (!name || phone.replace(/\D/g, '').length < 10) {
        toast('Заполните имя и телефон'); return;
      }
      console.log('[РАКЕТА демо] Обратная связь:', {
        name: name, phone: phone, message: f.querySelector('#cf-msg').value.trim()
      });
      f.innerHTML = '<div class="success" style="padding:26px 0"><div class="s-ic">' + IC.check + '</div>' +
        '<h1 style="font-size:22px">Сообщение отправлено</h1><p>Ответим в рабочее время: ' + esc(D.store.hours.toLowerCase()) + '.</p></div>';
    });
  }

  /* ---------- Инициализация ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('js');
    chrome();
    bindCardEvents(document);

    /* Статичные арт-плейсхолдеры в HTML (data-img: реальное фото, иначе SVG) */
    document.querySelectorAll('[data-art],[data-img]').forEach(function (el) {
      el.innerHTML = el.dataset.img
        ? '<img src="' + el.dataset.img + '" alt="">'
        : ART(el.dataset.art, el.dataset.tone);
    });

    var page = document.body.dataset.page;
    if (page === 'home') renderHome();
    if (page === 'catalog') renderCatalog();
    if (page === 'product') renderProduct();
    if (page === 'cart') renderCartPage();
    if (page === 'sales') renderSales();
    if (page === 'contacts') renderContacts();

    reveal();
  });
})();
