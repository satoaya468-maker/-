/* ============================================================
   Dp line · ОБЩИЙ UI-СЛОЙ
   Иконки (единый набор, stroke 1.7), форматирование,
   корзина (localStorage), рендер шапки/подвала, микро-анимации.
   ============================================================ */

window.DP = window.DP || {};

(function () {

  /* ---------- Иконки: один консистентный набор ---------- */
  const paths = {
    search:  '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
    cart:    '<circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    minus:   '<path d="M5 12h14"/>',
    trash:   '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    chevdown:'<path d="m6 9 6 6 6-6"/>',
    arrowr:  '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    arrowl:  '<path d="M19 12H5m6 6-6-6 6-6"/>',
    check:   '<path d="m4 12.5 5 5L20 6.5"/>',
    clock:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.8"/>',
    pin:     '<path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    phone:   '<path d="M5 4h4l1.5 4.5L8 10a12.5 12.5 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    box:     '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    info:    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8v.5"/>',
    vin:     '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 11h2m2 0h2m2 0h2"/>',
    /* категории */
    disc:    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4"/><path d="M12 3.6v2.2M12 18.2v2.2M3.6 12h2.2M18.2 12h2.2M6.3 6.3l1.5 1.5M16.2 16.2l1.5 1.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5"/>',
    filter:  '<path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/>',
    drop:    '<path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3Z"/><path d="M9.5 14.5a2.8 2.8 0 0 0 2.5 2.7"/>',
    spark:   '<path d="M9 3h6M10 3v3h4V3M9 6h6v4l-1.5 1.5v3L15 16v2l-3 3-3-3v-2l1.5-1.5v-3L9 10V6Z"/>',
    spring:  '<path d="M8 3h8M8 21h8M12 3v2m0 14v2M7 7l10 2M7 11l10 2M7 15l10 2M7 7v8M17 9v8"/>',
    battery: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8V5h3v3m4 0V5h3v3M6.5 13.5h3M14.8 13.5h3.2M16.4 11.9v3.2"/>',
    belt:    '<circle cx="7" cy="12" r="3.6"/><circle cx="17" cy="12" r="3.6"/><path d="M7 8.4h10M7 15.6h10"/>',
    lamp:    '<path d="M9 6a6 6 0 0 0 0 12h2.5V6H9Z"/><path d="M15 7.5h5M15 12h5M15 16.5h5"/>',
  };

  DP.icon = (name, size = 18) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.box}</svg>`;

  DP.logoSvg = (size = 34) => `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs><linearGradient id="dpg${size}" x1="4" y1="34" x2="44" y2="14" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2BC8EC"/><stop offset=".52" stop-color="#7B5CFF"/><stop offset="1" stop-color="#E650EC"/>
      </linearGradient></defs>
      <path d="M22 6v22.5a8.5 8.5 0 1 1-3-6.5" stroke="url(#dpg${size})" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M26 42V19.5a8.5 8.5 0 1 1 3 6.5" stroke="url(#dpg${size})" stroke-width="4.6" stroke-linecap="round"/>
    </svg>`;

  /* ---------- Форматирование ---------- */
  DP.fmt = {
    price: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽',
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

  /* ---------- Шапка и подвал ---------- */
  DP.renderHeader = function (mount) {
    const shop = window.DP_DB.shop;
    mount.innerHTML = `
      <div class="topline" aria-hidden="true"></div>
      <div class="wrap hrow">
        <a class="logo" href="index.html" aria-label="Dp line — на главную">
          ${DP.logoSvg(34)}
          <span class="logo-t">dp·line<small>автозапчасти</small></span>
        </a>
        <div class="hspacer"></div>
        <a class="hphone" href="${shop.phoneHref}">
          ${shop.phone}<span>${shop.city} · самовывоз</span>
        </a>
        <a class="hcart" href="cart.html" aria-label="Корзина">
          ${DP.icon('cart', 19)}
          <b class="hcart-n" hidden>0</b>
        </a>
      </div>`;
    const badge = mount.querySelector('.hcart-n');
    const sync = (n) => {
      badge.textContent = n;
      badge.hidden = n === 0;
    };
    sync(DP.cart.count());
    document.addEventListener('dp:cart', (e) => {
      sync(e.detail.count);
      badge.classList.remove('bump');
      void badge.offsetWidth; /* перезапуск CSS-анимации */
      badge.classList.add('bump');
    });
  };

  DP.renderFooter = function (mount) {
    const shop = window.DP_DB.shop;
    const pk = window.DP_DB.pickup;
    mount.innerHTML = `
      <div class="wrap frow">
        <div class="fcol fbrand">
          ${DP.logoSvg(28)}
          <div><b>dp·line</b> — автозапчасти под заказ<br>
          <span class="fmut">Поиск по ${shop.supplierCount} поставщикам · только самовывоз</span></div>
        </div>
        <div class="fcol">
          <span class="mlabel">Пункт выдачи</span>
          <p>${pk.address}<br><span class="fmut">${pk.hours.map((h) => `${h.d} ${h.h}`).join(' · ')}</span></p>
        </div>
        <div class="fcol">
          <span class="mlabel">Связь</span>
          <p><a href="${shop.phoneHref}" class="flink">${shop.phone}</a><br>
          <span class="fmut">Позвоним, когда заказ поступит на пункт выдачи</span></p>
        </div>
      </div>
      <div class="wrap fbottom">
        <span>© ${new Date().getFullYear()} Dp line · Магнитогорск</span>
        <span class="fmut mono-xs">данные каталога — демонстрационные</span>
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
    btn.innerHTML = `${DP.icon('check', 16)} Добавлено`;
    setTimeout(() => {
      btn.classList.remove('ok');
      btn.innerHTML = prev;
      btn.style.minWidth = '';
      delete btn.dataset.busy;
    }, 1300);
  };

  /* ---------- Общий шаблон карточки-предложения ---------- */
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

  /* ---------- Хелпер: URL-параметры ---------- */
  DP.qs = (key) => new URLSearchParams(location.search).get(key) || '';

  /* ---------- Автоинициализация шапки/подвала ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const h = document.querySelector('header[data-dp-header]');
    if (h) DP.renderHeader(h);
    const f = document.querySelector('footer[data-dp-footer]');
    if (f) DP.renderFooter(f);
  });
})();
