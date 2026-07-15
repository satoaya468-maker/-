/* ============================================================
   Dp line · ОБЩИЙ UI-СЛОЙ
   Форматирование, корзина (localStorage), шапка/подвал магазина.
   Иконки — только функциональные (поиск, корзина, количество).
   ============================================================ */

window.DP = window.DP || {};

(function () {

  /* ---------- Функциональные глифы ---------- */
  const paths = {
    search:  '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
    cart:    '<circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    minus:   '<path d="M5 12h14"/>',
    trash:   '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    chevdown:'<path d="m6 9 6 6 6-6"/>',
    check:   '<path d="m4 12.5 5 5L20 6.5"/>',
  };

  DP.icon = (name, size = 18) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;

  DP.logoSvg = (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs><linearGradient id="dpg${size}" x1="4" y1="34" x2="44" y2="14" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2BC8EC"/><stop offset=".52" stop-color="#7B5CFF"/><stop offset="1" stop-color="#E650EC"/>
      </linearGradient></defs>
      <path d="M22 6v22.5a8.5 8.5 0 1 1-3-6.5" stroke="url(#dpg${size})" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M26 42V19.5a8.5 8.5 0 1 1 3 6.5" stroke="url(#dpg${size})" stroke-width="4.6" stroke-linecap="round"/>
    </svg>`;

  /* ---------- Форматирование ---------- */
  DP.fmt = {
    price: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽',
    days: (o) => {
      if (o.days === 0) return 'в наличии';
      if (o.days === 1 && !o.daysMax) return 'завтра';
      if (o.daysMax) return `${o.days}–${o.daysMax} дн.`;
      return `${o.days} дн.`;
    },
    plural: (n, one, few, many) => {
      const m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return one;
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
      return many;
    },
  };

  /* ---------- Корзина (localStorage) ---------- */
  const CART_KEY = 'dpline.cart.v1';
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  };
  const writeCart = (items) => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('dp:cart', { detail: { count: items.length } }));
  };

  DP.cart = {
    items: readCart,
    count: () => readCart().length,
    /* сумма считается синхронно по мок-базе — для бейджа в шапке */
    total: () => readCart().reduce((s, i) => {
      const p = window.DP_DB.parts.find((x) => x.id === i.partId);
      const o = p && p.offers[i.offerIdx];
      return s + (o ? o.price * i.qty : 0);
    }, 0),
    /* offerIdx — индекс предложения в part.offers */
    add(partId, offerIdx, qty = 1) {
      const items = readCart();
      const hit = items.find((i) => i.partId === partId && i.offerIdx === offerIdx);
      if (hit) hit.qty += qty; else items.push({ partId, offerIdx, qty });
      writeCart(items);
    },
    setQty(partId, offerIdx, qty) {
      let items = readCart();
      const hit = items.find((i) => i.partId === partId && i.offerIdx === offerIdx);
      if (hit) hit.qty = Math.max(1, Math.min(99, qty));
      writeCart(items);
    },
    remove(partId, offerIdx) {
      writeCart(readCart().filter((i) => !(i.partId === partId && i.offerIdx === offerIdx)));
    },
    clear() { writeCart([]); },
  };

  /* ---------- Шапка магазина ---------- */
  DP.renderHeader = function (mount) {
    const shop = window.DP_DB.shop;
    const pk = window.DP_DB.pickup;
    const cats = window.DP_DB.categories;
    const curCat = DP.qs('cat');

    mount.innerHTML = `
      <div class="ubar"><div class="wrap ubar-in">
        <a class="ph" href="${shop.phoneHref}">${shop.phone}</a>
        <a class="ph u2" href="${shop.phone2Href}">${shop.phone2}</a>
        <a class="tg" href="${shop.telegram}" target="_blank" rel="noopener">написать в Telegram</a>
        <span class="hrs u2">${pk.hours.map((h) => `${h.d} ${h.h}`).slice(0, 2).join(' · ')}</span>
        <span class="right">${shop.city} · ${shop.branches}</span>
      </div></div>

      <div class="wrap mainrow" style="padding-left:0;padding-right:0">
        <a class="logo" href="index.html" aria-label="Dp line — на главную">
          ${DP.logoSvg(38)}
          <span class="logo-t">dp line<small>автозапчасти</small></span>
        </a>
        <div class="hpickup">
          <b>Выдача заказов</b>
          <span>${pk.address.replace('Магнитогорск, ', '')}</span>
        </div>
        <div class="hspacer"></div>
        <a class="hcart" href="cart.html" aria-label="Корзина">
          ${DP.icon('cart', 17)}
          Корзина
          <b class="hcart-n">0</b>
          <span class="hcart-sum">0 ₽</span>
        </a>
      </div>

      <nav class="catnav" aria-label="Категории"><div class="wrap catnav-in" style="padding:0 16px">
        <a href="index.html" class="${!curCat && /(index\.html|\/)$/.test(location.pathname) ? 'on' : ''}">Главная</a>
        ${cats.map((c) => `<a href="search.html?cat=${c.id}" class="${curCat === c.id ? 'on' : ''}">${c.name}</a>`).join('')}
        <a class="srv" href="index.html#service">Автосервис</a>
      </div></nav>

      <div class="searchband"><div class="wrap">
        <form id="hdr-search" role="search">
          <input type="search" name="q" placeholder="Введите артикул или название запчасти" autocomplete="off" aria-label="Поиск по каталогу" value="${(DP.qs('q') || '').replace(/"/g, '&quot;')}">
          <button class="go" type="submit">${DP.icon('search', 16)}Найти</button>
        </form>
      </div></div>`;

    /* поиск из шапки работает на любой странице */
    mount.querySelector('#hdr-search').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = mount.querySelector('#hdr-search input').value.trim();
      location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });

    const badge = mount.querySelector('.hcart-n');
    const sum = mount.querySelector('.hcart-sum');
    const sync = () => {
      badge.textContent = DP.cart.count();
      sum.textContent = DP.fmt.price(DP.cart.total());
    };
    sync();
    document.addEventListener('dp:cart', () => {
      sync();
      badge.classList.remove('bump');
      void badge.offsetWidth; /* перезапуск CSS-анимации */
      badge.classList.add('bump');
    });
  };

  /* ---------- Подвал ---------- */
  DP.renderFooter = function (mount) {
    const shop = window.DP_DB.shop;
    const pk = window.DP_DB.pickup;
    const cats = window.DP_DB.categories;
    mount.innerHTML = `
      <div class="wrap frow">
        <div class="fcol fbrand">
          <a class="logo" href="index.html">${DP.logoSvg(30)}<span class="logo-t" style="font-size:19px">dp line</span></a>
          <p>Интернет-магазин автозапчастей в Магнитогорске. Поиск по ${shop.supplierCount} поставщикам, заказ онлайн, оплата при получении.</p>
        </div>
        <div class="fcol">
          <span class="lbl">Каталог</span>
          ${cats.slice(0, 5).map((c) => `<a href="search.html?cat=${c.id}" style="display:block;padding:2px 0">${c.name}</a>`).join('')}
        </div>
        <div class="fcol">
          <span class="lbl">Контакты</span>
          <a class="ph" href="${shop.phoneHref}">${shop.phone}</a>
          <a class="ph" href="${shop.phone2Href}">${shop.phone2}</a>
          <a class="tg" href="${shop.telegram}" target="_blank" rel="noopener">написать в Telegram</a>
          <p class="fmut" style="margin-top:6px">${pk.hours.map((h) => `${h.d} ${h.h}`).join(' · ')}</p>
        </div>
        <div class="fcol">
          <span class="lbl">Выдача заказов</span>
          <p>${pk.address}<br><span class="fmut">${pk.note}</span></p>
          <p class="fmut" style="margin-top:6px">${shop.branches} в Магнитогорске</p>
        </div>
      </div>
      <div class="fbottom">
        <span>© ${new Date().getFullYear()} Dp line · Магнитогорск, 455025</span>
        <span>данные каталога — демонстрационные</span>
      </div>`;
  };

  /* ---------- Reveal-анимация при скролле ---------- */
  DP.reveal = function () {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- Фидбек кнопки «В корзину» ---------- */
  DP.buyFeedback = function (btn) {
    if (btn.dataset.busy) return;
    btn.dataset.busy = '1';
    const w = btn.offsetWidth;
    btn.style.minWidth = w + 'px';
    const prev = btn.innerHTML;
    btn.classList.add('ok');
    btn.innerHTML = `${DP.icon('check', 15)} Добавлено`;
    setTimeout(() => {
      btn.classList.remove('ok');
      btn.innerHTML = prev;
      btn.style.minWidth = '';
      delete btn.dataset.busy;
    }, 1300);
  };

  /* ---------- Строка предложения поставщика ---------- */
  DP.offerRow = function (part, offer, idx, { best = false } = {}) {
    const sup = DP.api.getSupplier(offer.sup);
    return `
      <div class="offer" data-part="${part.id}" data-offer="${idx}">
        ${best ? '<span class="best">выгодно</span>' : ''}
        <div class="sup">
          <b>${sup.name}</b>
          <span>склад ${sup.city} · ${offer.qty} шт</span>
        </div>
        <span class="days ${offer.days === 0 ? 'today' : ''}">${DP.fmt.days(offer)}</span>
        <span class="p">${DP.fmt.price(offer.price)}</span>
        <button class="mini js-add" data-part="${part.id}" data-offer="${idx}" aria-label="Добавить в корзину: ${sup.name}, ${DP.fmt.price(offer.price)}">
          ${DP.icon('plus', 15)}
        </button>
      </div>`;
  };

  /* ---------- Фото-заглушка ---------- */
  DP.noPhoto = (cls = '') => `<span class="nophoto ${cls}">нет фото</span>`;

  /* ---------- Товарная карточка (главная, аналоги) ---------- */
  DP.goodCard = function (p) {
    const availCls = p.best.days <= 2 ? 'g' : 'w';
    const availTxt = p.best.days === 0 ? 'В наличии' : `Срок: ${DP.fmt.days(p.best)}`;
    return `
      <div class="good">
        <a href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true">${DP.noPhoto()}</a>
        <div class="brand-l"><b>${p.brand}</b><span class="art">${p.article}</span></div>
        <a class="n" href="product.html?id=${p.id}">${p.name}</a>
        <div class="pr">${DP.fmt.price(p.best.price)} ${p.offersCount > 1 ? `<small>от ${p.offersCount} поставщиков</small>` : ''}</div>
        <div class="avail ${availCls}">${availTxt}</div>
        <button class="btn js-add" data-part="${p.id}" data-offer="${p.offers.indexOf(p.best) === -1 ? 0 : p.offers.indexOf(p.best)}">В корзину</button>
      </div>`;
  };

  /* ---------- Хелпер: URL-параметры ---------- */
  DP.qs = (key) => new URLSearchParams(location.search).get(key) || '';

  /* ---------- Автоинициализация шапки/подвала ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const h = document.querySelector('header[data-dp-header]');
    if (h && !h.innerHTML.trim()) DP.renderHeader(h);
    const f = document.querySelector('footer[data-dp-footer]');
    if (f && !f.innerHTML.trim()) DP.renderFooter(f);
  });
})();
