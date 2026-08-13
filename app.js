/* ==========================================================================
   Мастер Макс — общий скрипт: навигация, формы, цифровой ассистент
   Разработка — Ascend Systems
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     Telegram — заглушка интеграции
     Подставьте реальные значения, чтобы заявки уходили в чат мастерской.
     ---------------------------------------------------------------------- */
  var TOKEN = 'YOUR_BOT_TOKEN';
  var CHAT_ID = 'YOUR_CHAT_ID';

  function sendLead(lead) {
    var payload = {
      name: lead.name || 'не указано',
      service: lead.service || 'не указано',
      wheels: lead.wheels || 'не указано',
      phone: lead.phone || 'не указано',
      source: lead.source || document.title,
      page: location.pathname.split('/').pop() || 'index.html',
      time: new Date().toLocaleString('ru-RU')
    };

    var text = [
      'Заявка с сайта «Мастер Макс»',
      'Имя: ' + payload.name,
      'Услуга: ' + payload.service,
      'Диаметр / количество колёс: ' + payload.wheels,
      'Телефон: ' + payload.phone,
      'Источник: ' + payload.source + ' (' + payload.page + ')',
      'Время: ' + payload.time
    ].join('\n');

    if (TOKEN === 'YOUR_BOT_TOKEN' || CHAT_ID === 'YOUR_CHAT_ID') {
      console.log('[Telegram-заглушка] отправка отключена, заявка:', payload, text);
      return Promise.resolve(false);
    }

    return fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: text, disable_web_page_preview: true })
    })
      .then(function (res) { return res.ok; })
      .catch(function (err) {
        console.log('[Telegram-заглушка] запрос не выполнен:', err.message, payload);
        return false;
      });
  }

  /* ----------------------------------------------------------------------
     Тосты
     ---------------------------------------------------------------------- */
  function showToast(lines, ms) {
    var el = document.createElement('div');
    el.className = 'mx-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');

    var l1 = document.createElement('div');
    l1.className = 'mx-toast-l1';
    l1.textContent = lines[0] || '';
    el.appendChild(l1);

    if (lines[1]) {
      var l2 = document.createElement('div');
      l2.className = 'mx-toast-l2';
      l2.textContent = lines[1];
      el.appendChild(l2);
    }

    if (lines[2]) {
      var l3 = document.createElement('div');
      l3.className = 'mx-toast-l3';
      l3.textContent = lines[2];
      el.appendChild(l3);
    }

    document.body.appendChild(el);

    window.setTimeout(function () {
      el.classList.add('is-out');
      window.setTimeout(function () { el.remove(); }, 300);
    }, ms || 7000);
  }

  window.mxToast = showToast;
  window.mxSendLead = sendLead;

  /* ----------------------------------------------------------------------
     Шапка — мобильное меню
     ---------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var burger = header.querySelector('.burger');
    if (!burger) return;

    burger.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && header.classList.contains('is-open')) {
        header.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------------------
     Формы страниц (контакты, обратная связь)
     ---------------------------------------------------------------------- */
  function initForms() {
    var forms = document.querySelectorAll('form[data-lead]');

    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var data = new FormData(form);
        var lead = {
          name: data.get('name') || '',
          service: data.get('service') || form.getAttribute('data-lead'),
          wheels: data.get('time') || data.get('contact') || '',
          phone: data.get('phone') || '',
          source: form.getAttribute('data-source') || document.title
        };

        var comment = data.get('comment') || data.get('message') || '';
        if (comment) lead.service = lead.service + ' — ' + comment;

        sendLead(lead);

        showToast([
          'ASCEND SYSTEMS · CRM',
          form.getAttribute('data-toast-title') || 'Заявка зафиксирована',
          form.getAttribute('data-toast-note') || 'Передано администратору · перезвоним в рабочее время'
        ]);

        form.reset();
      });
    });
  }

  /* ----------------------------------------------------------------------
     Предзаполнение услуги из ссылки: contakty.html?usluga=Правка%20диска
     ---------------------------------------------------------------------- */
  function initServiceParam() {
    var select = document.getElementById('z-service');
    if (!select) return;

    var wanted = new URLSearchParams(location.search).get('usluga');
    if (!wanted) return;

    var normalized = wanted.trim().toLowerCase();

    Array.prototype.forEach.call(select.options, function (option) {
      if (option.textContent.trim().toLowerCase().indexOf(normalized.split(' ')[0]) === 0) {
        select.value = option.value || option.textContent;
      }
    });
  }

  /* ----------------------------------------------------------------------
     Цифровой ассистент «Максим»
     ---------------------------------------------------------------------- */
  var CHAT = {
    steps: [
      'Здравствуйте. Максим, администратор Мастер Макс. Что нужно сделать — шиномонтаж, балансировка, ремонт, правка диска?',
      'Понял. Диаметр колёс R какой? И сколько колёс?',
      'Записал. Свободное время подберу, скину в WhatsApp с ценой. Оставьте номер.',
      'Записал. Свяжусь в WhatsApp в течение 5 минут.'
    ],
    delays: [600, 1200, 1400, 1000]
  };

  function buildWidget() {
    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'mx-launcher';
    launcher.setAttribute('aria-label', 'Открыть чат с администратором');
    launcher.innerHTML =
      '<span class="mx-ava" aria-hidden="true">М</span>' +
      '<span class="mx-launcher-text">' +
      '<span class="mx-launcher-t1">Максим — на связи</span>' +
      '<span class="mx-launcher-t2">Ответ в течение 5 минут</span>' +
      '</span>';

    var panel = document.createElement('div');
    panel.className = 'mx-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Чат с администратором Мастер Макс');
    panel.innerHTML =
      '<div class="mx-head">' +
      '<span class="mx-ava" aria-hidden="true">М</span>' +
      '<span>' +
      '<span class="mx-head-t1">Максим Иванов</span>' +
      '<span class="mx-head-t2">Администратор · Мастер Макс</span>' +
      '</span>' +
      '<button type="button" class="mx-close" aria-label="Закрыть чат">✕</button>' +
      '</div>' +
      '<div class="mx-log" id="mx-log" role="log" aria-live="polite"></div>' +
      '<form class="mx-form" autocomplete="off">' +
      '<label class="sr-only" for="mx-input">Сообщение</label>' +
      '<input class="mx-input" id="mx-input" name="message" type="text" placeholder="Напишите сообщение">' +
      '<button class="mx-send" type="submit" aria-label="Отправить">→</button>' +
      '</form>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    return { launcher: launcher, panel: panel };
  }

  function initWidget() {
    var parts = buildWidget();
    var launcher = parts.launcher;
    var panel = parts.panel;
    var log = panel.querySelector('.mx-log');
    var form = panel.querySelector('.mx-form');
    var input = panel.querySelector('.mx-input');
    var close = panel.querySelector('.mx-close');

    var started = false;
    var step = 0;
    var lead = { service: '', wheels: '', phone: '' };

    function scroll() { log.scrollTop = log.scrollHeight; }

    function addMessage(text, who) {
      var msg = document.createElement('div');
      msg.className = 'mx-msg ' + (who === 'user' ? 'mx-user' : 'mx-bot');
      msg.textContent = text;
      log.appendChild(msg);
      scroll();
    }

    function addTyping() {
      var t = document.createElement('div');
      t.className = 'mx-typing';
      t.innerHTML = '<i></i><i></i><i></i>';
      t.setAttribute('aria-label', 'Максим печатает');
      log.appendChild(t);
      scroll();
      return t;
    }

    function botSay(text, delay) {
      var typing = addTyping();
      window.setTimeout(function () {
        typing.remove();
        addMessage(text, 'bot');
      }, delay);
    }

    function open() {
      panel.classList.add('is-open');
      launcher.hidden = true;

      if (!started) {
        started = true;
        botSay(CHAT.steps[0], CHAT.delays[0]);
      }

      window.setTimeout(function () { input.focus(); }, 260);
    }

    function hide() {
      panel.classList.remove('is-open');
      launcher.hidden = false;
      launcher.focus();
    }

    launcher.addEventListener('click', open);
    close.addEventListener('click', hide);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) hide();
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-open-chat]'), function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var value = input.value.trim();
      if (!value) return;

      addMessage(value, 'user');
      input.value = '';

      if (step === 0) {
        lead.service = value;
        step = 1;
        botSay(CHAT.steps[1], CHAT.delays[1]);
        return;
      }

      if (step === 1) {
        lead.wheels = value;
        step = 2;
        botSay(CHAT.steps[2], CHAT.delays[2]);
        return;
      }

      if (step === 2) {
        lead.phone = value;
        step = 3;

        sendLead({
          name: 'Клиент из чата',
          service: lead.service,
          wheels: lead.wheels,
          phone: lead.phone,
          source: 'Чат-ассистент · ' + document.title
        });

        showToast([
          'ASCEND SYSTEMS · CRM',
          'Заявка зафиксирована',
          'Передано администратору · ' + lead.phone
        ]);

        botSay(CHAT.steps[3], CHAT.delays[3]);
        return;
      }

      botSay('Принял, передал администратору. Позвоните, если срочно: +7 908 086 46 41.', 1000);
    });
  }

  /* ----------------------------------------------------------------------
     Запуск
     ---------------------------------------------------------------------- */
  function init() {
    initHeader();
    initForms();
    initServiceParam();
    initWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
