/* Оил Маркет — демо-логика статического сайта.
   Всё локально: корзина в localStorage, формы — заглушки. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var CART_KEY = 'om_cart_v1';

  /* ---------------- Корзина ---------------- */
  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeCart(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
    paintCount();
  }
  function cartCount() {
    return readCart().reduce(function (n, i) { return n + i.qty; }, 0);
  }
  function paintCount() {
    var n = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.style.display = n ? '' : 'none';
    });
  }
  function addToCart(item) {
    var items = readCart();
    var found = items.filter(function (i) { return i.id === item.id; })[0];
    if (found) { found.qty += 1; } else { item.qty = 1; items.push(item); }
    writeCart(items);
  }

  window.OM = {
    readCart: readCart,
    writeCart: writeCart,
    formatPrice: formatPrice
  };

  function formatPrice(v) {
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  /* Кнопки «В корзину» */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    addToCart({
      id: btn.dataset.add,
      name: btn.dataset.name || 'Товар',
      price: parseInt(btn.dataset.price, 10) || 0,
      icon: btn.dataset.icon || 'oil'
    });
    var old = btn.textContent;
    btn.textContent = 'Добавлено ✓';
    btn.disabled = true;
    setTimeout(function () { btn.textContent = old; btn.disabled = false; }, 1400);
  });

  paintCount();

  /* ---------------- Модальное окно записи / заявки ---------------- */
  var modal = document.getElementById('lead-modal');

  function openModal(title, subject) {
    if (!modal) return;
    modal.querySelector('[data-modal-title]').textContent = title || 'Запись на сервис';
    var subj = modal.querySelector('[name="subject"]');
    if (subj) subj.value = subject || title || '';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var first = modal.querySelector('input[name="name"]');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-book]');
    if (open) {
      e.preventDefault();
      openModal(open.dataset.bookTitle || 'Запись на сервис', open.dataset.book);
      return;
    }
    if (e.target.closest('[data-modal-close]') || e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeChat(); }
  });

  /* ---------------- Формы-заглушки ---------------- */
  document.querySelectorAll('form[data-stub]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var box = form.querySelector('[data-stub-result]');
      var msg = 'Заявка передаётся администратору. Мы перезвоним в рабочее время: ежедневно 09:00–21:00.';
      if (box) {
        box.innerHTML = '<div class="notice notice--ok"><b>Заявка принята.</b> ' + msg +
          '<br>Срочно? Позвоните: <a href="tel:+73519450574">+7 (3519) 45-05-74</a></div>';
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        alert('Заявка принята. ' + msg);
      }
      form.reset();
      if (form.dataset.stub === 'modal') setTimeout(closeModal, 4000);
    });
  });

  /* ---------------- Поиск по каталогу (демо) ---------------- */
  document.querySelectorAll('form[data-search]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = form.querySelector('input').value.trim();
      location.href = 'catalog.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  });

  /* ---------------- Подбор по марке авто ---------------- */
  var CARS = {
    'LADA': ['Granta', 'Vesta', 'XRAY', 'Largus', 'Niva Legend', 'Niva Travel'],
    'Hyundai': ['Solaris', 'Creta', 'Tucson', 'Elantra', 'Santa Fe'],
    'Kia': ['Rio', 'Ceed', 'Sportage', 'Optima', 'Seltos'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Highlander'],
    'Volkswagen': ['Polo', 'Tiguan', 'Passat', 'Golf', 'Touareg'],
    'Renault': ['Logan', 'Duster', 'Sandero', 'Kaptur', 'Arkana'],
    'Nissan': ['Almera', 'Qashqai', 'X-Trail', 'Terrano', 'Juke'],
    'Skoda': ['Octavia', 'Rapid', 'Kodiaq', 'Superb', 'Karoq'],
    'Ford': ['Focus', 'Mondeo', 'Kuga', 'Fiesta', 'Explorer'],
    'Chevrolet': ['Lacetti', 'Cruze', 'Aveo', 'Niva', 'Captiva'],
    'Haval': ['Jolion', 'F7', 'Dargo', 'H9'],
    'Chery': ['Tiggo 4', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Arrizo 8'],
    'Geely': ['Coolray', 'Atlas', 'Tugella', 'Monjaro'],
    'BMW': ['3 series', '5 series', 'X3', 'X5'],
    'Mercedes-Benz': ['C-class', 'E-class', 'GLC', 'GLE']
  };
  var YEARS = (function () {
    var a = [], y = 2026;
    for (; y >= 1998; y--) a.push(y);
    return a;
  })();

  var brandSel = document.getElementById('pick-brand');
  var modelSel = document.getElementById('pick-model');
  var yearSel = document.getElementById('pick-year');

  if (brandSel) {
    Object.keys(CARS).forEach(function (b) {
      brandSel.insertAdjacentHTML('beforeend', '<option value="' + b + '">' + b + '</option>');
    });
    brandSel.addEventListener('change', function () {
      modelSel.innerHTML = '<option value="">Выберите модель</option>';
      (CARS[brandSel.value] || []).forEach(function (m) {
        modelSel.insertAdjacentHTML('beforeend', '<option value="' + m + '">' + m + '</option>');
      });
      modelSel.disabled = !brandSel.value;
    });
  }
  if (yearSel) {
    YEARS.forEach(function (y) {
      yearSel.insertAdjacentHTML('beforeend', '<option value="' + y + '">' + y + '</option>');
    });
  }

  /* ---------------- Чат-виджет ---------------- */
  var chatPanel = document.querySelector('[data-chat-panel]');
  function closeChat() { if (chatPanel) chatPanel.classList.remove('is-open'); }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-chat-toggle]')) {
      e.preventDefault();
      chatPanel.classList.toggle('is-open');
    } else if (e.target.closest('[data-chat-close]')) {
      closeChat();
    } else if (chatPanel && chatPanel.classList.contains('is-open') && !e.target.closest('.chat')) {
      closeChat();
    }
  });

  /* ---------------- Карусель отзывов ---------------- */
  document.querySelectorAll('[data-carousel]').forEach(function (track) {
    var root = track.closest('section') || document;
    root.querySelectorAll('[data-carousel-prev]').forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: -360, behavior: 'smooth' }); });
    });
    root.querySelectorAll('[data-carousel-next]').forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: 360, behavior: 'smooth' }); });
    });
  });

  /* ---------------- Фильтры на мобильных ---------------- */
  var fToggle = document.querySelector('[data-filters-toggle]');
  if (fToggle) {
    fToggle.addEventListener('click', function () {
      document.querySelector('.filters').classList.toggle('is-open');
    });
  }

  /* ---------------- Табы ---------------- */
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    group.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        group.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        document.querySelectorAll('[data-tab-panel]').forEach(function (p) {
          p.hidden = p.dataset.tabPanel !== tab.dataset.tab;
        });
      });
    });
  });

  /* ---------------- Фильтрация каталога (демо) ---------------- */
  var grid = document.querySelector('[data-product-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.children);
    var countEl = document.querySelector('[data-result-count]');

    function applyFilters() {
      var brands = Array.prototype.slice
        .call(document.querySelectorAll('[data-filter-brand]:checked'))
        .map(function (i) { return i.value; });
      var min = parseInt((document.getElementById('price-min') || {}).value, 10);
      var max = parseInt((document.getElementById('price-max') || {}).value, 10);
      var cat = (document.querySelector('[data-filter-cat]:checked') || {}).value || 'all';
      var sort = (document.getElementById('sort') || {}).value || 'pop';

      var shown = 0;
      cards.forEach(function (c) {
        var p = parseInt(c.dataset.price, 10);
        var ok = true;
        if (brands.length && brands.indexOf(c.dataset.brand) === -1) ok = false;
        if (!isNaN(min) && p < min) ok = false;
        if (!isNaN(max) && p > max) ok = false;
        if (cat !== 'all' && c.dataset.cat !== cat) ok = false;
        c.hidden = !ok;
        if (ok) shown++;
      });

      var visible = cards.filter(function (c) { return !c.hidden; });
      visible.sort(function (a, b) {
        var pa = parseInt(a.dataset.price, 10), pb = parseInt(b.dataset.price, 10);
        if (sort === 'asc') return pa - pb;
        if (sort === 'desc') return pb - pa;
        return 0;
      });
      visible.forEach(function (c) { grid.appendChild(c); });

      if (countEl) countEl.textContent = shown + ' ' + plural(shown, ['товар', 'товара', 'товаров']);
    }

    function plural(n, f) {
      var n10 = n % 10, n100 = n % 100;
      if (n10 === 1 && n100 !== 11) return f[0];
      if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return f[1];
      return f[2];
    }

    document.querySelectorAll('[data-filter-brand], [data-filter-cat], #price-min, #price-max, #sort')
      .forEach(function (el) {
        el.addEventListener('change', applyFilters);
        el.addEventListener('input', applyFilters);
      });

    var reset = document.querySelector('[data-filters-reset]');
    if (reset) {
      reset.addEventListener('click', function () {
        document.querySelectorAll('[data-filter-brand]').forEach(function (i) { i.checked = false; });
        var all = document.querySelector('[data-filter-cat][value="all"]');
        if (all) all.checked = true;
        ['price-min', 'price-max'].forEach(function (id) {
          var el = document.getElementById(id); if (el) el.value = '';
        });
        applyFilters();
      });
    }

    /* Поисковый запрос из строки адреса */
    var q = new URLSearchParams(location.search).get('q');
    if (q) {
      var note = document.querySelector('[data-search-note]');
      if (note) {
        note.hidden = false;
        note.innerHTML = 'Показаны позиции по запросу <b>«' + q.replace(/[<>&]/g, '') +
          '»</b> — в демо-версии выдача не фильтруется по тексту. Уточните подбор у эксперта: ' +
          '<a href="tel:+73519450574">+7 (3519) 45-05-74</a>';
      }
    }

    applyFilters();
  }

  /* ---------------- Страница корзины ---------------- */
  var cartRoot = document.querySelector('[data-cart-root]');
  if (cartRoot) renderCart();

  function renderCart() {
    var items = readCart();
    var empty = document.querySelector('[data-cart-empty]');
    var sumBox = document.querySelector('[data-cart-summary]');

    if (!items.length) {
      cartRoot.innerHTML = '';
      if (empty) empty.hidden = false;
      if (sumBox) sumBox.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (sumBox) sumBox.hidden = false;

    cartRoot.innerHTML = items.map(function (i, idx) {
      return '<div class="cart-item">' +
        '<div class="cart-item__media">' + iconSvg(i.icon) + '</div>' +
        '<div><div class="product__name">' + i.name + '</div>' +
        '<div class="qty"><button type="button" data-qty="-1" data-idx="' + idx + '" aria-label="Меньше">−</button>' +
        '<span>' + i.qty + '</span>' +
        '<button type="button" data-qty="1" data-idx="' + idx + '" aria-label="Больше">+</button></div></div>' +
        '<div><div class="cart-item__price">' + formatPrice(i.price * i.qty) + '</div>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-remove="' + idx + '" style="margin-top:6px">Убрать</button></div>' +
        '</div>';
    }).join('');

    var total = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    var totalEl = document.querySelector('[data-cart-total]');
    var subEl = document.querySelector('[data-cart-sub]');
    if (subEl) subEl.textContent = formatPrice(total);
    if (totalEl) totalEl.textContent = formatPrice(total);
  }

  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-qty]');
    var r = e.target.closest('[data-remove]');
    if (!q && !r) return;
    var items = readCart();
    if (q) {
      var i = items[+q.dataset.idx];
      i.qty += +q.dataset.qty;
      if (i.qty < 1) items.splice(+q.dataset.idx, 1);
    } else {
      items.splice(+r.dataset.remove, 1);
    }
    writeCart(items);
    renderCart();
  });

  /* ---------------- Большой поиск: VIN / каталог ---------------- */
  var searchTabs = document.querySelectorAll('.searchbox__tab');
  if (searchTabs.length) {
    var bigInput = document.querySelector('.bigsearch input');
    searchTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        searchTabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        bigInput.placeholder = tab.dataset.mode === 'vin'
          ? 'Введите VIN или номер кузова'
          : 'Название запчасти, масла или артикул';
        bigInput.focus();
      });
    });
  }

  /* Подбор по марке — раскрытие */
  var pickerToggle = document.querySelector('[data-picker-toggle]');
  if (pickerToggle) {
    pickerToggle.addEventListener('click', function () {
      var box = document.querySelector('[data-picker]');
      box.classList.toggle('is-open');
      if (box.classList.contains('is-open')) document.getElementById('pick-brand').focus();
    });
  }

  /* ---------------- Появление блоков при скролле ---------------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, n) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('is-in'); }, Math.min(n * 45, 220));
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- FAQ-аккордеон ---------------- */
  document.querySelectorAll('.faq__q').forEach(function (q) {
    q.addEventListener('click', function () {
      q.parentNode.classList.toggle('is-open');
    });
  });

  /* ---------------- «Сейчас открыто» ---------------- */
  (function openStatus() {
    var els = document.querySelectorAll('[data-open-status]');
    if (!els.length) return;
    var now = new Date();
    var h = now.getHours(), m = now.getMinutes();
    var open = h >= 9 && (h < 21);
    var text;
    if (open) {
      var left = (21 - h) * 60 - m;
      text = left <= 60
        ? 'Открыто · закрываемся через ' + left + ' мин'
        : 'Сейчас открыто · до 21:00';
    } else {
      text = 'Сейчас закрыто · откроемся в 09:00';
    }
    els.forEach(function (el) {
      el.textContent = text;
      var dot = el.parentNode.querySelector('.topbar__dot, .livebar__dot');
      if (dot && !open) dot.style.background = '#f5a623';
    });
  })();

  /* ---------------- Счётчики ---------------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseInt(el.dataset.count, 10), t0 = null;
        io2.unobserve(el);
        requestAnimationFrame(function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 900, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        });
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io2.observe(el); });
  }

  function iconSvg(kind) {
    var i = {
      oil: '<svg viewBox="0 0 64 64"><rect x="18" y="14" width="28" height="38" rx="4" fill="#e11b22"/><rect x="26" y="8" width="12" height="8" rx="2" fill="#16191d"/><rect x="23" y="26" width="18" height="12" rx="2" fill="#fff"/></svg>',
      tire: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#16191d"/><circle cx="32" cy="32" r="10" fill="#c9ced6"/><circle cx="32" cy="32" r="5" fill="#e11b22"/></svg>',
      filter: '<svg viewBox="0 0 64 64"><rect x="20" y="16" width="24" height="32" rx="6" fill="#3d444d"/><rect x="24" y="10" width="16" height="8" rx="2" fill="#e11b22"/><path d="M24 26h16M24 32h16M24 38h16" stroke="#c9ced6" stroke-width="3"/></svg>',
      chem: '<svg viewBox="0 0 64 64"><path d="M26 10h12v10l10 24a6 6 0 0 1-5 10H21a6 6 0 0 1-5-10l10-24z" fill="#e11b22"/><rect x="24" y="6" width="16" height="6" rx="2" fill="#16191d"/></svg>',
      brake: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="21" fill="#c9ced6"/><circle cx="32" cy="32" r="9" fill="#3d444d"/><path d="M32 11v8M53 32h-8M32 53v-8M11 32h8" stroke="#e11b22" stroke-width="4"/></svg>',
      fluid: '<svg viewBox="0 0 64 64"><path d="M24 18h16v6l5 18a6 6 0 0 1-6 8H25a6 6 0 0 1-6-8l5-18z" fill="#e11b22"/><rect x="26" y="10" width="12" height="9" rx="2" fill="#16191d"/><rect x="22" y="36" width="20" height="10" rx="2" fill="#fff"/></svg>',
      spark: '<svg viewBox="0 0 64 64"><rect x="27" y="8" width="10" height="16" rx="4" fill="#c9ced6"/><rect x="25" y="22" width="14" height="8" rx="2" fill="#3d444d"/><path d="M24 30h16l-2 10H26z" fill="#c9ced6"/><rect x="27" y="40" width="10" height="14" rx="2" fill="#8d959f"/><path d="M44 20l-6 8h5l-5 8" stroke="#e11b22" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
      pads: '<svg viewBox="0 0 64 64"><path d="M14 22h24a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H14z" fill="#c9ced6"/><path d="M8 24h6v20H8z" fill="#e11b22"/><path d="M30 18h22a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H30z" fill="#e3e7ec"/><path d="M24 20h6v20h-6z" fill="#e11b22" opacity=".8"/></svg>',
      wrench: '<svg viewBox="0 0 64 64"><path d="M44 10a14 14 0 0 0-17 18L10 45a5 5 0 0 0 7 7l17-17a14 14 0 0 0 18-17L42 30l-8-8z" fill="#e11b22"/><circle cx="15" cy="47" r="2.6" fill="#fff"/></svg>',
      disk: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#c9ced6"/><circle cx="32" cy="32" r="7" fill="#16191d"/><path d="M32 12v12M52 32H40M32 52V40M12 32h12" stroke="#fff" stroke-width="5"/></svg>'
    };
    return i[kind] || i.oil;
  }
})();
