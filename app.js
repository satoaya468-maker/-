/* ============================================================
   УЛЬЯНА · ГРУМИНГ — vanilla JS
   Навигация · reveal · виджет записи · фильтр отзывов · формы
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Константы проекта ---------- */
  var PHONE_HREF = 'tel:+79097477360';
  var WA_HREF    = 'https://wa.me/79097477360';
  var GIS_HREF   = 'https://2gis.ru/magnitogorsk/firm/70000001083397497/tab/reviews';

  /* Telegram-заглушка. Подставить реальные значения перед запуском. */
  var TOKEN   = 'YOUR_BOT_TOKEN';
  var CHAT_ID = 'YOUR_CHAT_ID';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.matchMedia('(max-width: 767px)').matches; };

  /* Заполняется в initHeader — виджет закрывает мобильное меню перед открытием */
  var closeMobileNav = function () {};

  /* ============================================================
     1. Отправка заявки (Telegram-заглушка)
     ============================================================ */
  function notifyTelegram(payload) {
    var lines = ['<b>' + escapeHtml(payload.title || 'Новая заявка') + '</b>'];
    Object.keys(payload.fields || {}).forEach(function (k) {
      var v = payload.fields[k];
      if (v) lines.push(escapeHtml(k) + ': ' + escapeHtml(String(v)));
    });
    lines.push('Источник: ' + escapeHtml(payload.source || location.pathname));

    var body = {
      chat_id: CHAT_ID,
      text: lines.join('\n'),
      parse_mode: 'HTML'
    };

    console.log('[Ульяна · Груминг] Заявка →', payload.title, payload.fields, '| источник:', payload.source);

    if (TOKEN === 'YOUR_BOT_TOKEN' || CHAT_ID === 'YOUR_CHAT_ID') {
      console.info('[Ульяна · Груминг] Telegram не настроен — заявка только в консоли. Заполните TOKEN и CHAT_ID в app.js.');
      return Promise.resolve(false);
    }

    return fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.ok; })
      .catch(function (err) { console.warn('[Ульяна · Груминг] Не удалось отправить в Telegram:', err); return false; });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c];
    });
  }

  /* ============================================================
     2. Тосты
     ============================================================ */
  var toastStack;
  function getToastStack() {
    if (!toastStack) {
      toastStack = document.createElement('div');
      toastStack.className = 'toast-stack';
      toastStack.setAttribute('role', 'status');
      toastStack.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastStack);
    }
    return toastStack;
  }

  function toast(opts) {
    var el = document.createElement('div');
    el.className = 'toast';
    var html = '';
    if (opts.kicker) html += '<span class="toast__k">' + escapeHtml(opts.kicker) + '</span>';
    html += '<span class="toast__t">' + escapeHtml(opts.title) + '</span>';
    if (opts.sub) html += '<span class="toast__s">' + escapeHtml(opts.sub) + '</span>';
    el.innerHTML = html;
    getToastStack().appendChild(el);

    var life = opts.duration || 5200;
    setTimeout(function () {
      el.classList.add('is-out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 420);
    }, life);
    return el;
  }

  /* ============================================================
     3. Шапка: скролл-состояние + мобильное меню
     ============================================================ */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    if (header.classList.contains('site-header--over')) {
      var onScroll = function () {
        header.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.72);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    var burger = document.querySelector('.burger');
    var drawer = document.querySelector('.mobile-nav');
    if (!burger || !drawer) return;

    var setOpen = function (open) {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('is-locked', open);
      if (open) header.classList.add('is-solid');
      else if (header.classList.contains('site-header--over') && window.scrollY <= window.innerHeight * 0.72) {
        header.classList.remove('is-solid');
      }
    };

    closeMobileNav = function () {
      if (drawer.classList.contains('is-open')) setOpen(false);
    };

    burger.addEventListener('click', function () {
      setOpen(!drawer.classList.contains('is-open'));
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ============================================================
     4. Появление секций при скролле
     ============================================================ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     5. Видео в hero: пауза вне экрана, фолбэк на постер
     ============================================================ */
  function initHeroVideo() {
    var video = document.querySelector('.hero__media video');
    if (!video) return;

    var play = function () {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* автоплей заблокирован — остаётся постер */ });
    };

    /* При включённой экономии трафика и prefers-reduced-motion видео
       не загружается вовсе — посетитель видит постер. */
    var conn = navigator.connection || {};
    if (reduceMotion || conn.saveData) return;

    /* Размер выбираем сами (чтобы мобильный не тянул десктопную версию),
       а формат — уже браузер по type. */
    if (!video.currentSrc && !video.querySelector('source')) {
      var small = isMobile();
      var d = video.dataset;
      [
        { src: small ? d.mp4Mobile : d.mp4,  type: 'video/mp4' },
        { src: small ? d.webmMobile : d.webm, type: 'video/webm' }
      ].forEach(function (item) {
        if (!item.src) return;
        var s = document.createElement('source');
        s.src = item.src;
        s.type = item.type;
        video.appendChild(s);
      });
      video.load();
    }
    play();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : video.pause(); });
      }, { threshold: 0.05 });
      io.observe(video);
    }

    document.addEventListener('visibilitychange', function () {
      document.hidden ? video.pause() : play();
    });
  }

  /* ============================================================
     6. Виджет записи
     ============================================================ */
  var WIDGET_MARKUP =
    '<button class="uw-launcher" type="button" id="uwLauncher" aria-haspopup="dialog" aria-controls="uwPanel">' +
      '<span class="uw-ava" aria-hidden="true">У</span>' +
      '<span class="uw-launcher__dot" aria-hidden="true"></span>' +
      '<span class="uw-launcher__txt">' +
        '<span class="uw-launcher__t1">Ульяна — на связи</span>' +
        '<span class="uw-launcher__t2">Отвечу за 3 минуты</span>' +
      '</span>' +
      '<span class="sr-only">Открыть чат записи</span>' +
    '</button>' +
    '<div class="uw-panel" id="uwPanel" role="dialog" aria-modal="false" aria-label="Запись к Ульяне" aria-hidden="true">' +
      '<div class="uw-head">' +
        '<span class="uw-ava" aria-hidden="true">У</span>' +
        '<span class="uw-head__txt">' +
          '<span class="uw-head__t1">Ульяна Филипцевич</span>' +
          '<span class="uw-head__t2">Мастер груминга</span>' +
        '</span>' +
        '<button class="uw-close" type="button" id="uwClose" aria-label="Закрыть чат">' +
          '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">' +
            '<path d="M1 1 14 14M14 1 1 14" stroke="currentColor" stroke-width="1.3"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="uw-log" id="uwLog" aria-live="polite"></div>' +
      '<form class="uw-foot" id="uwForm" autocomplete="off">' +
        '<input class="uw-input" id="uwInput" type="text" placeholder="Напишите сообщение" aria-label="Сообщение">' +
        '<button class="uw-send" type="submit" aria-label="Отправить">' +
          '<svg width="19" height="14" viewBox="0 0 19 14" fill="none" aria-hidden="true">' +
            '<path d="M1 7h16M11.5 1.5 17.5 7l-6 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>' +
          '</svg>' +
        '</button>' +
      '</form>' +
    '</div>';

  var SCRIPT_STEPS = [
    { delay: 600,  text: 'Здравствуйте! Это Ульяна. Помогу записать вашего питомца. Собачка или кошка?' },
    { delay: 1200, text: 'Хорошо. Опишите питомца — порода, вес примерно, и что именно нужно: комплексный груминг, гигиеническая стрижка или вычёсывание?' },
    { delay: 1400, text: 'Записала. Подберу удобное время и пришлю в WhatsApp пару вариантов на выбор. Оставьте номер, отвечу в течение часа.' },
    { delay: 1000, text: 'Спасибо! Свяжусь с вами в WhatsApp в течение часа. Хорошего дня!' }
  ];

  function initWidget() {
    if (document.getElementById('uwLauncher')) return;

    var host = document.createElement('div');
    host.className = 'uw-root';
    host.innerHTML = WIDGET_MARKUP;
    document.body.appendChild(host);

    var launcher = host.querySelector('#uwLauncher');
    var panel    = host.querySelector('#uwPanel');
    var closeBtn = host.querySelector('#uwClose');
    var log      = host.querySelector('#uwLog');
    var form     = host.querySelector('#uwForm');
    var input    = host.querySelector('#uwInput');

    var started = false;
    var step = 0;                 // сколько реплик бота уже показано
    var answers = { pet: '', brief: '', phone: '' };
    var busy = false;

    function scrollLog() { log.scrollTop = log.scrollHeight; }

    function addMessage(text, who) {
      var el = document.createElement('div');
      el.className = 'uw-msg uw-msg--' + who;
      el.textContent = text;
      log.appendChild(el);
      scrollLog();
      return el;
    }

    function botSay(text, delay, after) {
      busy = true;
      var typing = document.createElement('div');
      typing.className = 'uw-typing';
      typing.setAttribute('aria-label', 'Ульяна печатает');
      typing.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(typing);
      scrollLog();

      setTimeout(function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        addMessage(text, 'bot');
        busy = false;
        if (typeof after === 'function') after();
      }, reduceMotion ? 250 : delay);
    }

    function openPanel() {
      closeMobileNav();
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      launcher.classList.add('is-hidden');
      launcher.setAttribute('aria-expanded', 'true');
      if (isMobile()) document.body.classList.add('is-locked');

      if (!started) {
        started = true;
        botSay(SCRIPT_STEPS[0].text, SCRIPT_STEPS[0].delay, function () { step = 1; });
      }
      if (!isMobile()) setTimeout(function () { input.focus(); }, 380);
    }

    function closePanel() {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      launcher.classList.remove('is-hidden');
      launcher.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      launcher.focus();
    }

    launcher.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });

    /* Любая кнопка «Записаться» на странице открывает виджет */
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-open-widget]');
      if (!trigger) return;
      e.preventDefault();
      openPanel();
    });

    function digits(s) { return (s.match(/\d/g) || []).length; }

    function maskPhone(raw) {
      var d = (raw.match(/\d/g) || []).join('');
      if (d.length >= 10) {
        var t = d.slice(-10);
        return '+7 ' + t.slice(0, 3) + ' ' + t.slice(3, 6) + ' ' + t.slice(6, 8) + ' ' + t.slice(8, 10);
      }
      return raw;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!value || busy) return;

      addMessage(value, 'user');
      input.value = '';

      if (step === 1) {
        answers.pet = value;
        botSay(SCRIPT_STEPS[1].text, SCRIPT_STEPS[1].delay, function () { step = 2; });

      } else if (step === 2) {
        answers.brief = value;
        botSay(SCRIPT_STEPS[2].text, SCRIPT_STEPS[2].delay, function () { step = 3; });

      } else if (step === 3) {
        if (digits(value) < 10) {
          botSay('Кажется, номер неполный. Напишите его целиком — например, +7 909 747 73 60.', 900);
          return;
        }
        answers.phone = maskPhone(value);

        notifyTelegram({
          title: 'Новая запись на груминг',
          fields: {
            'Питомец': answers.pet,
            'Задача': answers.brief,
            'Телефон': answers.phone,
            'Канал': 'Виджет на сайте'
          },
          source: document.title + ' (' + location.pathname.replace(/^\//, '') + ')'
        });

        toast({
          kicker: 'Ascend Systems · CRM',
          title: 'Новая запись зафиксирована',
          sub: 'Заявка на груминг · ' + answers.phone + ' · передана Ульяне',
          duration: 7000
        });

        step = 4;
        setTimeout(function () {
          botSay(SCRIPT_STEPS[3].text, SCRIPT_STEPS[3].delay);
        }, 400);

      } else {
        botSay('Всё записала. Если нужно что-то добавить — напишите в WhatsApp, отвечу там же.', 900);
      }
    });
  }

  /* ============================================================
     7. Оценка звёздами: 5 → 2ГИС, ниже → личное обращение
     ============================================================ */
  function initRating() {
    document.querySelectorAll('[data-rating]').forEach(function (root) {
      var stars = Array.prototype.slice.call(root.querySelectorAll('.rate__star'));
      var hint  = root.querySelector('[data-rate-hint]');
      var pane  = document.getElementById(root.dataset.rating);
      if (!stars.length) return;

      var chosen = 0;

      function paint(n) {
        stars.forEach(function (s, i) { s.classList.toggle('is-on', i < n); });
      }

      function say(html) { if (hint) hint.innerHTML = html; }

      stars.forEach(function (star) {
        var value = parseInt(star.dataset.value, 10);

        star.addEventListener('mouseenter', function () { paint(value); });
        star.addEventListener('focus', function () { paint(value); });

        star.addEventListener('click', function () {
          chosen = value;
          paint(value);
          stars.forEach(function (s, i) {
            s.setAttribute('aria-pressed', i < value ? 'true' : 'false');
          });

          if (value === 5) {
            if (pane) pane.hidden = true;
            say('Спасибо! Открываем 2ГИС — там можно оставить отзыв. ' +
                'Не открылось? <a href="' + GIS_HREF + '" target="_blank" rel="noopener">Перейти вручную</a>.');
            window.open(GIS_HREF, '_blank', 'noopener');
            return;
          }

          /* Меньше пяти — обращение уходит лично Ульяне, в ленту не попадает */
          say('Обращение придёт лично Ульяне и не будет опубликовано.');
          if (!pane) return;
          pane.hidden = false;
          var label = pane.querySelector('[data-rate-label]');
          if (label) label.textContent = value + '★';
          var rating = pane.querySelector('[name="rating"]');
          if (rating) rating.value = value;
          var first = pane.querySelector('input, textarea');
          if (first) first.focus({ preventScroll: true });
          pane.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
        });
      });

      root.addEventListener('mouseleave', function () { paint(chosen); });
      root.addEventListener('focusout', function (e) {
        if (!root.contains(e.relatedTarget)) paint(chosen);
      });
    });
  }

  /* ============================================================
     8. Приватная форма обратной связи (главная и otzyvy.html)
     ============================================================ */
  function initFeedbackForms() {
    document.querySelectorAll('[data-feedback-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = new FormData(form);

        notifyTelegram({
          title: 'Обращение с сайта (не публикуется)',
          fields: {
            'Оценка': (data.get('rating') || '—') + '★',
            'Имя': data.get('name'),
            'Телефон': data.get('phone'),
            'Что произошло': data.get('message'),
            'Связаться': data.get('channel')
          },
          source: location.pathname.replace(/^\//, '') + ' · приватная обратная связь'
        });

        form.reset();
        toast({
          title: 'Спасибо, Ульяна свяжется с вами в течение суток',
          sub: 'Обращение отправлено лично мастеру и не публикуется на сайте.',
          duration: 6000
        });
      });
    });
  }

  /* ============================================================
    10. Форма записи (contakty.html)
     ============================================================ */
  function initBookingForm() {
    var form = document.getElementById('bookingForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);

      notifyTelegram({
        title: 'Заявка на запись с сайта',
        fields: {
          'Имя': data.get('name'),
          'Телефон': data.get('phone'),
          'Питомец': data.get('pet'),
          'Желаемая дата': data.get('date'),
          'Комментарий': data.get('comment')
        },
        source: 'contakty.html · форма записи'
      });

      form.reset();
      toast({
        kicker: 'Ascend Systems · CRM',
        title: 'Спасибо! Ульяна свяжется с вами в течение часа',
        sub: 'Заявка передана мастеру. Если нужно срочно — ' + '+7 909 747 73 60',
        duration: 6500
      });
    });
  }

  /* ============================================================
    11. Год в подвале
     ============================================================ */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Bootstrap ---------- */
  function boot() {
    initHeader();
    initReveal();
    initHeroVideo();
    initWidget();
    initRating();
    initFeedbackForms();
    initBookingForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Небольшой публичный хук — на случай интеграции с CRM */
  window.UlianaGrooming = { notify: notifyTelegram, toast: toast, PHONE: PHONE_HREF, WHATSAPP: WA_HREF };
})();
