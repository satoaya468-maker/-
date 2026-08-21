/* ГБО-АВТО сервис — весь клиентский код. Ванильный JS, без зависимостей.
   Порядок: утилиты, цели Метрики, шапка, меню, появление секций,
   маска телефона, отправка форм, калькулятор, карусель, оценка,
   карта, чат-виджет с квизом. */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var RUB = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  function money(n) { return RUB.format(Math.round(n)) + ' ₽'; }

  /* --- Цели Яндекс.Метрики. Работает и без подключённой Метрики -------- */
  window.gboGoal = function (name, params) {
    var id = window.GBO_METRIKA_ID;
    if (id && typeof window.ym === 'function') window.ym(id, 'reachGoal', name, params || {});
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-goal]');
    if (el) window.gboGoal(el.getAttribute('data-goal'));
  });

  /* --- Шапка: инфобар прячется при скролле вниз, возвращается вверх ---- */
  (function () {
    var hdr = document.getElementById('hdr');
    if (!hdr) return;
    var last = window.pageYOffset, ticking = false;
    function onScroll() {
      var y = window.pageYOffset;
      if (y > 80 && y > last) hdr.classList.add('is-hidden');
      else if (y < last) hdr.classList.remove('is-hidden');
      last = y;
      ticking = false;
    }
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
  })();

  /* --- Мобильное меню -------------------------------------------------- */
  (function () {
    var menu = document.getElementById('menu');
    var open = $('[data-menu-open]'), close = $('[data-menu-close]');
    if (!menu || !open) return;
    function set(on) {
      menu.classList.toggle('is-open', on);
      menu.hidden = !on;
      body.classList.toggle('is-locked', on);
      open.setAttribute('aria-expanded', String(on));
      if (on) { var f = menu.querySelector('a,button'); if (f) f.focus(); } else open.focus();
    }
    open.addEventListener('click', function () { set(true); });
    if (close) close.addEventListener('click', function () { set(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) set(false);
    });
  })();

  /* --- Появление секций: один раз, fade + 10px ------------------------- */
  (function () {
    var els = $$('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* --- Маска телефона +7 (___) ___-__-__ ------------------------------- */
  function maskPhone(input) {
    function digits(v) {
      var d = v.replace(/\D/g, '');
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      return d.slice(0, 11);
    }
    function fmt(d) {
      var o = '+7';
      if (d.length > 1) o += ' (' + d.slice(1, 4);
      if (d.length >= 4) o += ')';
      if (d.length > 4) o += ' ' + d.slice(4, 7);
      if (d.length > 7) o += '-' + d.slice(7, 9);
      if (d.length > 9) o += '-' + d.slice(9, 11);
      return o;
    }
    input.addEventListener('input', function () { input.value = fmt(digits(input.value)); });
    input.addEventListener('focus', function () { if (!input.value) input.value = '+7 ('; });
    input.addEventListener('blur', function () { if (input.value.replace(/\D/g, '').length < 2) input.value = ''; });
  }
  $$('[data-mask-phone]').forEach(maskPhone);

  /* --- Отправка форм ---------------------------------------------------
     Единая точка: сменить адрес приёмника можно в src/_data/site.json,
     компоненты при этом не трогаются. Токена бота в клиенте нет и быть
     не может — за отправку в Telegram отвечает серверный релей.        */
  var RELAY = body.getAttribute('data-relay') || '';
  var MIN_DELAY = parseInt(body.getAttribute('data-mindelay') || '3', 10) * 1000;
  var loadedAt = Date.now();

  window.gboSend = function (payload) {
    payload.page = location.pathname;
    payload.url = location.href;
    payload.time = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' });
    if (!RELAY) {
      /* Релей ещё не подключён: не делаем вид, что заявка ушла. */
      console.info('[ГБО] Заявка не отправлена — relayUrl пуст. Данные:', payload);
      return Promise.reject(new Error('relay-not-configured'));
    }
    return fetch(RELAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return {}; });
    });
  };

  function formState(form, state, text) {
    var btn = $('[data-form-submit]', form);
    if (state === 'sending') {
      btn.setAttribute('aria-disabled', 'true');
      btn.dataset.label = btn.textContent;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Отправляем…';
    } else if (state === 'idle') {
      btn.removeAttribute('aria-disabled');
      if (btn.dataset.label) btn.textContent = btn.dataset.label;
    } else if (state === 'ok') {
      var ok = document.createElement('div');
      ok.className = 'form__msg form__msg--ok';
      ok.setAttribute('role', 'status');
      ok.innerHTML = '<b>Заявка принята.</b><br>Перезвоним в течение 15 минут на указанный номер.';
      form.replaceWith(ok);
    } else if (state === 'err') {
      var err = $('.form__msg--err', form.parentNode);
      if (!err) {
        err = document.createElement('div');
        err.className = 'form__msg form__msg--err';
        err.setAttribute('role', 'alert');
        err.style.marginTop = '16px';
        form.parentNode.insertBefore(err, form.nextSibling);
      }
      err.innerHTML = text;
      formState(form, 'idle');
    }
  }

  $$('[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);

      if (fd.get('website')) return;                     /* honeypot */
      if (Date.now() - loadedAt < MIN_DELAY) {
        formState(form, 'err', 'Слишком быстрая отправка. Попробуйте ещё раз через пару секунд.');
        return;
      }
      var phone = String(fd.get('phone') || '');
      var need = form.querySelector('[name="phone"][required]');
      if (need && phone.replace(/\D/g, '').length !== 11) {
        need.setAttribute('aria-invalid', 'true');
        formState(form, 'err', 'Проверьте номер телефона — нужны все 11 цифр.');
        need.focus();
        return;
      }
      if (need) need.removeAttribute('aria-invalid');

      var payload = { source: form.getAttribute('data-source') || 'Форма' };
      fd.forEach(function (v, k) { if (k !== 'website' && v) payload[k] = v; });

      formState(form, 'sending');
      window.gboSend(payload).then(function () {
        window.gboGoal('form_submit');
        formState(form, 'ok');
      }).catch(function (err) {
        var tail = ' Позвоните нам: <a class="accent-link" href="tel:+79088196369">+7 (908) 819-63-69</a>.';
        formState(form, 'err', err.message === 'relay-not-configured'
          ? 'Отправка заявок ещё не подключена к этому домену.' + tail
          : 'Не удалось отправить заявку.' + tail);
      });
    });
  });

  /* --- Калькулятор окупаемости ------------------------------------------
     литрыБензина  = пробег / 100 * расход
     литрыГаза     = литрыБензина * consumptionFactor
     затратыБензин = литрыБензина * ценаБензина
     затратыГаз    = литрыГаза * ценаГаза
     экономияМес   = затратыБензин - затратыГаз
     окупаемость   = ceil(installFrom / экономияМес)                      */
  (function () {
    var root = $('[data-calc]');
    if (!root) return;

    var CARS = JSON.parse(root.getAttribute('data-cars'));
    var FUEL = JSON.parse(root.getAttribute('data-fuel'));

    var elCar = $('[data-calc-car]', root),
        elConsum = $('[data-calc-consum]', root),
        elPetrol = $('[data-calc-petrol]', root),
        elGas = $('[data-calc-gas]', root),
        elMileage = $('[data-calc-mileage]', root),
        elMileageOut = $('[data-calc-mileage-out]', root),
        elUnit = $('[data-calc-unit]', root),
        elFuelNote = $('[data-calc-fuelnote]', root),
        elMethaNote = $('[data-calc-methanote]', root),
        outPayback = $('[data-calc-payback]', root),
        outMonth = $('[data-calc-month]', root),
        outYear = $('[data-calc-year]', root),
        outSplit = $('[data-calc-split]', root),
        outTank = $('[data-calc-tank]', root),
        outInstall = $('[data-calc-install]', root),
        btnWa = $('[data-calc-wa]', root),
        btnBook = $('[data-calc-book]', root);

    var fuelId = 'propane';
    var used = false;

    function car() {
      var id = elCar.value;
      for (var i = 0; i < CARS.length; i++) if (CARS[i].id === id) return CARS[i];
      return CARS[0];
    }

    /* Плавная интерполяция значения, не отсчёт от нуля */
    function animate(el, to, fmt) {
      var from = parseFloat(el.dataset.v || '0');
      el.dataset.v = to;
      if (reduced || !from) { el.textContent = fmt(to); return; }
      var t0 = performance.now(), dur = 250;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }

    function calc() {
      var f = FUEL[fuelId];
      var mileage = +elMileage.value;
      var consum = parseFloat(elConsum.value) || 0;
      var petrol = parseFloat(elPetrol.value) || 0;
      var gas = parseFloat(elGas.value) || 0;

      var litersPetrol = mileage / 100 * consum;
      var litersGas = litersPetrol * f.consumptionFactor;
      var costPetrol = litersPetrol * petrol;
      var costGas = litersGas * gas;
      var saveMonth = costPetrol - costGas;
      var saveYear = saveMonth * 12;
      var payback = saveMonth > 0 ? Math.ceil(f.installFrom / saveMonth) : null;

      elMileageOut.textContent = RUB.format(mileage) + ' км';

      if (payback === null || !isFinite(payback)) {
        outPayback.textContent = '—';
        outPayback.dataset.v = 0;
        outMonth.textContent = '—'; outMonth.dataset.v = 0;
        outYear.textContent = '—'; outYear.dataset.v = 0;
        outSplit.textContent = 'При таких ценах газ не даёт экономии — проверьте цену литра.';
      } else {
        animate(outPayback, payback, function (v) { return String(Math.round(v)); });
        animate(outMonth, saveMonth, money);
        animate(outYear, saveYear, money);
        outSplit.textContent = 'Сейчас на бензине: ' + money(costPetrol) + '/мес → На газе: ' + money(costGas) + '/мес';
      }

      outTank.textContent = car().tank;
      outInstall.textContent = 'от ' + money(f.installFrom) + ' — точная сумма после бесплатной диагностики';

      var txt = 'Здравствуйте! Хочу точный расчёт по ГБО.\n'
        + 'Автомобиль: ' + car().name + '\n'
        + 'Пробег: ' + RUB.format(mileage) + ' км/мес\n'
        + 'Топливо: ' + f.label + '\n'
        + (payback ? 'По калькулятору окупаемость: ' + payback + ' мес.' : '');
      btnWa.href = 'https://wa.me/79088196369?text=' + encodeURIComponent(txt);

      if (btnBook) {
        btnBook.dataset.prefill = 'Расчёт с сайта: ' + car().name + ', '
          + RUB.format(mileage) + ' км/мес, ' + f.label
          + (payback ? ', окупаемость ' + payback + ' мес.' : '');
      }

      if (!used) { used = true; window.gboGoal('calc_used'); }
    }

    function applyCar() {
      var c = car();
      if (c.consum) { elConsum.value = c.consum; elConsum.removeAttribute('data-manual'); }
      else if (!elConsum.value || !elConsum.hasAttribute('data-manual')) {
        elConsum.value = 10; elConsum.setAttribute('data-manual', '');
      }
      calc();
    }

    function applyFuel() {
      var f = FUEL[fuelId];
      elGas.value = f.pricePerUnit;
      elUnit.textContent = '₽/' + f.unit;
      elFuelNote.textContent = f.note;
      if (elMethaNote) elMethaNote.hidden = f.confirmed;
      calc();
    }

    elCar.addEventListener('change', applyCar);
    [elConsum, elPetrol, elGas].forEach(function (el) { el.addEventListener('input', calc); });
    elMileage.addEventListener('input', function () {
      $$('[data-calc-preset]', root).forEach(function (b) {
        b.setAttribute('aria-pressed', String(+b.getAttribute('data-calc-preset') === +elMileage.value));
      });
      calc();
    });
    $$('[data-calc-preset]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        elMileage.value = b.getAttribute('data-calc-preset');
        $$('[data-calc-preset]', root).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        calc();
      });
    });
    $$('[data-calc-fuel]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        fuelId = b.getAttribute('data-calc-fuel');
        $$('[data-calc-fuel]', root).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        applyFuel();
      });
    });

    if (btnBook) {
      btnBook.addEventListener('click', function () {
        var target = $('#zayavka');
        if (!target) return;                       /* на других страницах — обычный переход */
        var ta = target.querySelector('textarea[name="comment"]');
        if (ta) ta.value = btnBook.dataset.prefill || '';
      });
    }

    applyCar();
    applyFuel();
  })();

  /* --- Карусель отзывов: свайп, стрелки, точки, без автопрокрутки ------- */
  $$('[data-carousel]').forEach(function (root) {
    var track = $('[data-carousel-track]', root);
    var prev = $('[data-carousel-prev]', root);
    var next = $('[data-carousel-next]', root);
    var dotsBox = $('[data-carousel-dots]', root);
    var slides = $$('.slide', track);
    if (!slides.length) return;

    slides.forEach(function (s, i) {
      s.setAttribute('aria-roledescription', 'слайд');
      s.setAttribute('aria-label', (i + 1) + ' из ' + slides.length);
    });

    var dots = slides.map(function (s, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'carousel__dot';
      d.setAttribute('aria-label', 'Слайд ' + (i + 1));
      d.addEventListener('click', function () { go(i); });
      dotsBox.appendChild(d);
      return d;
    });

    function step() { return slides[0].offsetWidth + parseFloat(getComputedStyle(track).gap || 24); }
    function index() { return Math.round(track.scrollLeft / step()); }
    function go(i) {
      track.scrollTo({ left: i * step(), behavior: reduced ? 'auto' : 'smooth' });
    }
    function sync() {
      var i = index();
      dots.forEach(function (d, n) { d.setAttribute('aria-current', String(n === i)); });
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    if (prev) prev.addEventListener('click', function () { go(Math.max(0, index() - 1)); });
    if (next) next.addEventListener('click', function () { go(Math.min(slides.length - 1, index() + 1)); });
    track.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(slides.length - 1, index() + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, index() - 1)); }
    });
    sync();
  });

  /* --- Оцените нас ------------------------------------------------------
     reviewGating = false (по умолчанию): ссылка на 2ГИС доступна всем.
     reviewGating = true: 4–5 ведут на 2ГИС, 1–3 только во внутреннюю форму.
     Предупреждение о рисках review gating — в README проекта.           */
  (function () {
    var root = $('[data-rate]');
    if (!root) return;
    var GATING = body.getAttribute('data-gating') === 'true';
    var GIS = document.querySelector('[data-goal="gis_click"]').href;
    var stars = $$('[data-rate-star]', root);
    var panel = $('[data-rate-panel]', root);
    var form = $('[data-rate-form]', root);
    var score = 0;

    function paint(n) {
      stars.forEach(function (s, i) { s.classList.toggle('is-lit', i < n); });
    }
    stars.forEach(function (s, i) {
      s.addEventListener('mouseenter', function () { paint(i + 1); });
      s.addEventListener('focus', function () { paint(i + 1); });
      s.addEventListener('click', function () { choose(i + 1); });
    });
    root.addEventListener('mouseleave', function () { paint(score); });

    function link(label) {
      return '<a class="btn btn--primary" href="' + GIS + '" target="_blank" rel="noopener" data-goal="gis_click">' + label + '</a>';
    }

    function choose(n) {
      score = n;
      paint(n);
      stars.forEach(function (s, i) { s.setAttribute('aria-checked', String(i === n - 1)); });
      window.gboGoal('rating_given', { score: n });

      panel.hidden = false;
      if (GATING && n >= 4) { location.href = GIS; return; }

      if (n >= 4) {
        panel.innerHTML = '<div class="form__msg form__msg--ok"><b>Спасибо за оценку.</b><br>'
          + 'Если не сложно, оставьте пару слов в 2ГИС — это заметно помогает сервису.</div>'
          + '<div class="row" style="margin-top:16px">' + link('Оставить отзыв в 2ГИС') + '</div>';
        if (form) form.hidden = true;
      } else {
        panel.innerHTML = '<div class="form__msg form__msg--ok"><b>Спасибо, что сказали.</b><br>'
          + 'Напишите, что пошло не так — разберёмся и ответим.</div>'
          + (GATING ? '' : '<div class="row" style="margin-top:16px">' + link('Или оставить отзыв в 2ГИС') + '</div>');
        if (form) form.hidden = false;
      }
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        if (fd.get('website')) return;
        window.gboSend({
          source: 'Оценка сайта: ' + score + ' звёзд',
          score: score,
          comment: fd.get('comment') || ''
        }).then(function () {
          form.replaceWith(Object.assign(document.createElement('div'), {
            className: 'form__msg form__msg--ok',
            innerHTML: '<b>Отправлено.</b><br>Спасибо, разберёмся.'
          }));
        }).catch(function () {
          var e2 = document.createElement('div');
          e2.className = 'form__msg form__msg--err';
          e2.style.marginTop = '12px';
          e2.innerHTML = 'Не удалось отправить. Позвоните нам: '
            + '<a class="accent-link" href="tel:+79088196369">+7 (908) 819-63-69</a>.';
          form.appendChild(e2);
        });
      });
    }
  })();

  /* --- Карта: iframe грузится только по клику --------------------------- */
  $$('[data-map]').forEach(function (box) {
    var btn = $('[data-map-load]', box);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-src');
      f.title = 'Карта проезда к сервису';
      f.loading = 'lazy';
      f.setAttribute('allowfullscreen', '');
      box.innerHTML = '';
      box.appendChild(f);
    });
  });

  /* --- Чат-виджет и квиз -------------------------------------------------
     Сценарий заскриптован. Ни языковой модели, ни внешних API: виджет
     говорит с клиентами сервиса про цены и сроки, и ошибаться ему нельзя. */
  (function () {
    var widget = document.getElementById('widget');
    var quiz = document.getElementById('quiz');
    if (!widget || !quiz) return;
    if (sessionStorage.getItem('gbo-widget-closed') === '1') return;

    var stepBox = document.getElementById('quiz-step');
    var prog = document.getElementById('quiz-prog');
    var answers = {};
    var shown = false;

    var STEPS = [
      { key: 'car', q: 'Подберём ГБО под вашу машину. Какая марка и год?', type: 'text', ph: 'Например, Lada Granta 2019' },
      { key: 'fuel', q: 'Пропан или метан?', type: 'opts', opts: ['Пропан', 'Метан', 'Не знаю, подберите сами'] },
      { key: 'mileage', q: 'Сколько проезжаете в месяц?', type: 'opts', opts: ['До 1500 км', '1500–4000 км', 'Больше 4000 км'] },
      { key: 'phone', q: 'Куда отправить расчёт?', type: 'phone' }
    ];
    var at = 0;

    function show() {
      if (shown) return;
      shown = true;
      widget.hidden = false;
    }
    setTimeout(show, 18000);
    addEventListener('scroll', function () {
      var h = document.documentElement;
      if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.4) show();
    }, { passive: true });

    function markProg() {
      $$('i', prog).forEach(function (i, n) { i.classList.toggle('is-on', n <= at); });
    }

    function render() {
      var s = STEPS[at];
      markProg();
      if (!s) return finish();

      var html = '<p class="quiz__q">' + s.q + '</p>';
      if (s.type === 'opts') {
        html += '<div class="quiz__opts">' + s.opts.map(function (o, i) {
          return '<button class="quiz__opt" type="button" data-opt="' + i + '">' + o + '</button>';
        }).join('') + '</div>';
      } else {
        var isPhone = s.type === 'phone';
        html += '<form class="flow flow-12" data-quiz-form>'
          + '<label class="field"><span class="vh">' + s.q + '</span>'
          + '<input class="input" type="' + (isPhone ? 'tel' : 'text') + '" name="v" required '
          + (isPhone ? 'data-mask-phone inputmode="tel" placeholder="+7 (___) ___-__-__"'
                     : 'placeholder="' + s.ph + '"') + '></label>'
          + '<button class="btn btn--primary btn--wide" type="submit">'
          + (isPhone ? 'Получить расчёт' : 'Дальше') + '</button></form>';
      }
      stepBox.innerHTML = html;

      $$('[data-opt]', stepBox).forEach(function (b) {
        b.addEventListener('click', function () {
          answers[s.key] = s.opts[+b.getAttribute('data-opt')];
          at++; render();
        });
      });
      var f = $('[data-quiz-form]', stepBox);
      if (f) {
        var inp = $('input', f);
        if (s.type === 'phone') maskPhone(inp);
        inp.focus();
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          var v = inp.value.trim();
          if (s.type === 'phone' && v.replace(/\D/g, '').length !== 11) {
            inp.setAttribute('aria-invalid', 'true');
            return;
          }
          if (!v) return;
          answers[s.key] = v;
          at++; render();
        });
      }
    }

    function finish() {
      var txt = 'Здравствуйте! Заявка с сайта.\n'
        + 'Авто: ' + (answers.car || '—') + '\n'
        + 'Топливо: ' + (answers.fuel || '—') + '\n'
        + 'Пробег: ' + (answers.mileage || '—') + '\n'
        + 'Телефон: ' + (answers.phone || '—');
      stepBox.innerHTML = '<p class="quiz__q">Мастер перезвонит в течение 15 минут</p>'
        + '<p class="sm muted">Мы записали: ' + [answers.car, answers.fuel, answers.mileage].filter(Boolean).join(' · ') + '</p>'
        + '<div class="flow flow-8" style="margin-top:16px">'
        + '<a class="btn btn--primary btn--wide" href="tel:+79088196369" data-goal="phone_click">Позвонить сейчас</a>'
        + '<a class="btn btn--outline btn--wide" href="https://wa.me/79088196369?text='
        + encodeURIComponent(txt) + '" target="_blank" rel="noopener" data-goal="whatsapp_click">Написать в WhatsApp</a>'
        + '</div>';
      window.gboGoal('quiz_complete');
      window.gboSend({ source: 'Квиз-виджет', name: '', phone: answers.phone || '',
                       car: answers.car || '', service: 'Подбор ГБО',
                       comment: 'Топливо: ' + (answers.fuel || '—') + '. Пробег: ' + (answers.mileage || '—') })
            .catch(function () { /* канал связи уже показан кнопками выше */ });
    }

    function open() {
      quiz.hidden = false;
      widget.hidden = true;
      if (!stepBox.innerHTML) render();
    }
    function close(remember) {
      quiz.hidden = true;
      widget.hidden = true;
      if (remember) sessionStorage.setItem('gbo-widget-closed', '1');
    }

    document.getElementById('widget-btn').addEventListener('click', open);
    var bub = document.getElementById('widget-bubble');
    if (bub) bub.addEventListener('click', open);
    document.getElementById('widget-close').addEventListener('click', function () { close(true); });
    document.getElementById('quiz-close').addEventListener('click', function () { close(true); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && !quiz.hidden) close(true); });
  })();

})();
