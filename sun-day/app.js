/* ===========================================================
   Sun Day — общий скрипт: навигация, тосты, отправка заявок,
   цифровой ассистент (Ascend Systems)
   =========================================================== */

(function () {
  'use strict';

  /* ---------- Telegram-интеграция (заглушка) ---------- */

  var TOKEN = 'YOUR_BOT_TOKEN';
  var CHAT_ID = 'YOUR_CHAT_ID';

  function buildLeadText(lead) {
    var lines = [
      '🌞 Sun Day — новая заявка',
      'Тип: ' + (lead.type || '—'),
      'Для кого: ' + (lead.audience || '—'),
      'Уровень: ' + (lead.level || '—'),
      'Имя: ' + (lead.name || '—'),
      'Телефон: ' + (lead.phone || '—'),
      'Источник: ' + (lead.source || document.title)
    ];
    return lines.join('\n');
  }

  function sendLead(lead) {
    var text = buildLeadText(lead);

    if (TOKEN === 'YOUR_BOT_TOKEN' || CHAT_ID === 'YOUR_CHAT_ID') {
      // Заглушка: реальные токены подставляются на стороне клиента.
      console.log('[Sun Day → Telegram]\n' + text);
      return Promise.resolve();
    }

    return fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: text })
    }).catch(function () { /* сеть недоступна — заявка уже показана пользователю */ });
  }

  /* ---------- Тосты ---------- */

  function toastStack() {
    var stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function toast(opts) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');

    if (opts.kicker) {
      var k = document.createElement('div');
      k.className = 'toast-kicker';
      k.textContent = opts.kicker;
      el.appendChild(k);
    }

    var t = document.createElement('div');
    t.className = 'toast-title';
    t.textContent = opts.title || '';
    el.appendChild(t);

    if (opts.sub) {
      var s = document.createElement('div');
      s.className = 'toast-sub';
      s.textContent = opts.sub;
      el.appendChild(s);
    }

    toastStack().appendChild(el);

    var life = opts.duration || 5000;
    setTimeout(function () {
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, 400);
    }, life);
  }

  /* ---------- Утилиты ---------- */

  function digits(value) {
    return (value || '').replace(/\D/g, '');
  }

  function isPhone(value) {
    var d = digits(value);
    return d.length >= 10 && d.length <= 15;
  }

  /* ---------- Мобильное меню ---------- */

  function initNav() {
    var burger = document.querySelector('[data-burger]');
    var nav = document.getElementById('site-nav');
    if (!burger || !nav) return;

    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Виджет-ассистент ---------- */

  var WIDGET_HTML = [
    '<button class="sd-launcher" type="button" data-sd-open aria-label="Открыть чат с ассистентом Sun Day">',
    '  <span class="sd-avatar" aria-hidden="true">SD</span>',
    '  <span>',
    '    <span class="sd-launcher-title" style="display:block">Ассистент Sun Day</span>',
    '    <span class="sd-launcher-sub" style="display:block">Ответ в течение 3 минут</span>',
    '  </span>',
    '  <span class="sd-dot" aria-hidden="true"></span>',
    '</button>',
    '<div class="sd-panel" role="dialog" aria-label="Чат с ассистентом Sun Day">',
    '  <div class="sd-header">',
    '    <span class="sd-avatar sd-avatar--sm" aria-hidden="true">SD</span>',
    '    <span>',
    '      <span class="sd-header-title" style="display:block">Sun Day · Ассистент</span>',
    '      <span class="sd-header-sub" style="display:block">Онлайн</span>',
    '    </span>',
    '    <button class="sd-close" type="button" data-sd-close aria-label="Закрыть чат">✕</button>',
    '  </div>',
    '  <div class="sd-body" data-sd-body></div>',
    '  <div class="sd-quick" data-sd-quick></div>',
    '  <form class="sd-input-row" data-sd-form>',
    '    <label class="sr-only" for="sd-input" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Сообщение</label>',
    '    <input class="sd-input" id="sd-input" type="text" autocomplete="off" placeholder="Напишите сообщение" data-sd-input>',
    '    <button class="sd-send" type="submit" aria-label="Отправить">',
    '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    '    </button>',
    '  </form>',
    '</div>'
  ].join('');

  function initWidget() {
    var widget = document.createElement('div');
    widget.className = 'sd-widget';
    widget.innerHTML = WIDGET_HTML;
    document.body.appendChild(widget);

    var body = widget.querySelector('[data-sd-body]');
    var quick = widget.querySelector('[data-sd-quick]');
    var form = widget.querySelector('[data-sd-form]');
    var input = widget.querySelector('[data-sd-input]');

    var started = false;
    var busy = false;
    var step = 'audience';
    var lead = { type: 'Пробное занятие', source: document.title };

    function scrollDown() {
      body.scrollTop = body.scrollHeight;
    }

    function addMessage(text, who) {
      var el = document.createElement('div');
      el.className = 'sd-msg sd-msg--' + who;
      el.textContent = text;
      body.appendChild(el);
      scrollDown();
    }

    function setChips(items) {
      quick.innerHTML = '';
      (items || []).forEach(function (label) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'sd-chip';
        chip.textContent = label;
        chip.addEventListener('click', function () { handleUser(label); });
        quick.appendChild(chip);
      });
    }

    function botSay(text, delay, chips) {
      busy = true;
      setChips([]);

      var typing = document.createElement('div');
      typing.className = 'sd-typing';
      typing.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(typing);
      scrollDown();

      setTimeout(function () {
        typing.remove();
        addMessage(text, 'bot');
        setChips(chips);
        busy = false;
      }, delay);
    }

    function showCrmToast() {
      toast({
        kicker: 'ASCEND SYSTEMS · CRM',
        title: 'Заявка на пробное занятие зафиксирована',
        sub: 'Передано руководителю Sun Day · +7 XXX XXX XX XX',
        duration: 7000
      });
    }

    function handleUser(text) {
      if (busy || step === 'done') return;
      var value = (text || '').trim();
      if (!value) return;

      if (step === 'phone' && !isPhone(value)) {
        addMessage(value, 'user');
        botSay('Кажется, в номере не хватает цифр. Напишите, пожалуйста, в формате +7 900 000 00 00.', 900);
        return;
      }

      addMessage(value, 'user');

      if (step === 'audience') {
        lead.audience = value;
        step = 'level';
        botSay(
          'Отлично. Какой уровень английского сейчас — совсем с нуля, начальный или уже что-то знаете?',
          1200,
          ['Совсем с нуля', 'Начальный', 'Уже что-то знаем']
        );
        return;
      }

      if (step === 'level') {
        lead.level = value;
        step = 'phone';
        botSay(
          'Записала. Подберу подходящую группу и запишу вас на бесплатное пробное занятие. Оставьте номер — пришлю в WhatsApp расписание и подтверждение.',
          1400
        );
        return;
      }

      if (step === 'phone') {
        lead.phone = value;
        step = 'done';
        setChips([]);
        showCrmToast();
        sendLead(lead);
        botSay(
          'Спасибо! Расписание уйдёт вам в WhatsApp сегодня, до 20:00. До встречи на пробном занятии!',
          1000
        );
        input.placeholder = 'Заявка отправлена';
      }
    }

    function open() {
      widget.classList.add('is-open');
      if (!started) {
        started = true;
        botSay(
          'Здравствуйте! Меня зовут Евгения, помогаю с записью в Sun Day. Для кого хотите занятия — для ребёнка или для себя?',
          600,
          ['Для ребёнка', 'Для себя']
        );
      }
      setTimeout(function () { input.focus(); }, 260);
    }

    function close() {
      widget.classList.remove('is-open');
    }

    widget.querySelector('[data-sd-open]').addEventListener('click', open);
    widget.querySelector('[data-sd-close]').addEventListener('click', close);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value;
      input.value = '';
      handleUser(value);
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-open-assistant]')) {
        e.preventDefault();
        open();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && widget.classList.contains('is-open')) close();
    });
  }

  /* ---------- Формы записи (hero на главной и страница контактов) ---------- */

  function initSignupForms() {
    document.querySelectorAll('[data-signup-form]').forEach(initSignupForm);
  }

  function initSignupForm(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('[name="name"]');
      var phone = form.querySelector('[name="phone"]');
      var branch = form.querySelector('[name="branch"]');
      var error = form.querySelector('[data-form-error]');
      var button = form.querySelector('button[type="submit"]');

      if (!name.value.trim()) {
        error.textContent = 'Пожалуйста, укажите имя.';
        name.focus();
        return;
      }
      if (!isPhone(phone.value)) {
        error.textContent = 'Проверьте номер телефона — нужно не меньше 10 цифр.';
        phone.focus();
        return;
      }
      error.textContent = '';

      var label = button.innerHTML;
      button.disabled = true;
      button.textContent = 'Отправляем…';

      sendLead({
        type: 'Запись на пробное занятие',
        name: name.value.trim(),
        phone: phone.value.trim(),
        audience: branch ? branch.value : 'Филиал уточняется',
        source: form.getAttribute('data-source') || document.title
      });

      setTimeout(function () {
        button.disabled = false;
        button.innerHTML = label;
        form.reset();
        toast({
          kicker: 'ASCEND SYSTEMS · CRM',
          title: 'Заявка на пробное занятие зафиксирована',
          sub: 'Передано руководителю Sun Day · +7 XXX XXX XX XX',
          duration: 7000
        });
      }, 700);
    });
  }

  /* ---------- Появление блоков при скролле ---------- */

  var REVEAL_SELECTOR = '.perk, .program-card, .program-row, .price-card, .review-card,' +
    ' .step, .stat-card, .info-card, .map-card, .form-card, .rating-card, .cta-banner, .pay-strip';

  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var items = Array.prototype.slice.call(document.querySelectorAll(REVEAL_SELECTOR));
    if (!items.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    items.forEach(function (item) {
      item.classList.add('reveal');

      // лёгкая лесенка внутри одного ряда, но не длиннее 240мс
      var siblings = Array.prototype.slice.call(item.parentNode.children);
      var index = siblings.indexOf(item);
      if (index > 0) item.style.transitionDelay = Math.min(index, 3) * 80 + 'ms';

      observer.observe(item);
    });
  }

  /* ---------- Инициализация ---------- */

  window.SunDay = { toast: toast, sendLead: sendLead, isPhone: isPhone };

  function boot() {
    initNav();
    initWidget();
    initSignupForms();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
