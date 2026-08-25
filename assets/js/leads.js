/**
 * ГБО-АВТО сервис — отправка заявок в Telegram.
 * Подключение:  <script src="/assets/js/leads.js" defer></script>
 *
 * Любая форма с атрибутом data-lead-form отправляется в Worker.
 *   <form data-lead-form data-source="Форма в шапке"> ... </form>
 * Поля читаются по name: name, phone, car, service, comment.
 * Honeypot и таймер добавляются автоматически.
 *
 * Программная отправка (чат-виджет):
 *   window.GBOLeads.send({ name, phone, comment, source: 'Чат-виджет' })
 */
(function () {
  'use strict';

  /* Адрес Worker'а берётся из data-relay на <body>, куда его подставляет
     Eleventy из site.json -> relayUrl: боевой URL правится в одном месте
     и не требует трогать этот файл. Константа ниже — запасной вариант,
     если атрибута нет. */
  var ENDPOINT = 'https://gbo-avto-leads.<ваш-субдомен>.workers.dev/lead';
  var fromAttr = document.body && document.body.getAttribute('data-relay');
  if (fromAttr) ENDPOINT = fromAttr;
  var PHONE_FALLBACK = '+7 908 819-63-69';

  /* ---------- utm ---------- */

  function captureUtm() {
    try {
      var q = new URLSearchParams(location.search);
      var found = false, out = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].forEach(function (k) {
        var v = q.get(k);
        if (v) { out[k] = v.slice(0, 120); found = true; }
      });
      if (found) sessionStorage.setItem('gbo_utm', JSON.stringify(out));
    } catch (e) { /* приватный режим — игнорируем */ }
  }

  function readUtm() {
    try { return JSON.parse(sessionStorage.getItem('gbo_utm') || '{}'); }
    catch (e) { return {}; }
  }

  /* ---------- телефон ---------- */

  function maskPhone(input) {
    function format(v) {
      var d = v.replace(/\D/g, '');
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] === '9') d = '7' + d;
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var out = '+7';
      if (d.length > 1) out += ' ' + d.slice(1, 4);
      if (d.length >= 5) out += ' ' + d.slice(4, 7);
      if (d.length >= 8) out += '-' + d.slice(7, 9);
      if (d.length >= 10) out += '-' + d.slice(9, 11);
      return out;
    }
    input.addEventListener('focus', function () {
      if (!input.value) input.value = '+7 ';
    });
    input.addEventListener('input', function () {
      input.value = format(input.value);
      input.setCustomValidity('');
    });
    input.addEventListener('blur', function () {
      if (input.value.replace(/\D/g, '').length < 11) input.value = input.value === '+7 ' ? '' : input.value;
    });
  }

  function phoneIsValid(v) {
    return String(v || '').replace(/\D/g, '').length >= 11;
  }

  /* ---------- отправка ---------- */

  function send(payload) {
    var utm = readUtm();
    var body = Object.assign({
      page: location.href.slice(0, 200),
      source: 'Форма на сайте'
    }, utm, payload);

    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    }).then(function (res) {
      return res.json().catch(function () { return { ok: res.ok }; });
    }).then(function (data) {
      if (!data || !data.ok) throw new Error((data && data.message) || 'Не удалось отправить заявку');
      try {
        if (window.ym && window.gboYmId) window.ym(window.gboYmId, 'reachGoal', 'lead');
        if (window.gtag) window.gtag('event', 'generate_lead');
      } catch (e) { /* аналитика не должна ломать отправку */ }
      return data;
    });
  }

  /* ---------- формы ---------- */

  function setStatus(form, kind, text) {
    var box = form.querySelector('[data-lead-status]');
    if (!box) {
      box = document.createElement('p');
      box.setAttribute('data-lead-status', '');
      form.appendChild(box);
    }
    box.className = 'lead-status lead-status--' + kind;
    box.textContent = text;
    box.hidden = !text;
  }

  function initForm(form) {
    if (form.__gboInit) return;
    form.__gboInit = true;
    form.setAttribute('novalidate', '');

    // honeypot
    var hp = document.createElement('input');
    hp.type = 'text';
    hp.name = 'website';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    form.appendChild(hp);

    var openedAt = Date.now();

    var phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
      phoneInput.setAttribute('inputmode', 'tel');
      phoneInput.setAttribute('autocomplete', 'tel');
      maskPhone(phoneInput);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fd = new FormData(form);
      var payload = {
        name: fd.get('name') || '',
        phone: fd.get('phone') || '',
        car: fd.get('car') || '',
        service: fd.get('service') || '',
        comment: fd.get('comment') || fd.get('message') || '',
        website: fd.get('website') || '',
        t_elapsed: Date.now() - openedAt,
        source: form.getAttribute('data-source') || 'Форма на сайте'
      };

      if (!phoneIsValid(payload.phone)) {
        setStatus(form, 'error', 'Укажите телефон полностью — перезвоним в течение 15 минут.');
        if (phoneInput) phoneInput.focus();
        return;
      }

      var btn = form.querySelector('button[type="submit"], input[type="submit"]');
      var btnText = btn ? btn.textContent : null;
      if (btn) { btn.disabled = true; btn.textContent = 'Отправляем…'; }
      setStatus(form, 'pending', '');

      send(payload)
        .then(function () {
          form.reset();
          openedAt = Date.now();
          setStatus(form, 'success', 'Заявка принята. Перезвоним в рабочее время, обычно в течение 15 минут.');
          var done = form.getAttribute('data-success-redirect');
          if (done) setTimeout(function () { location.href = done; }, 1200);
        })
        .catch(function (err) {
          setStatus(form, 'error', (err && err.message ? err.message : 'Ошибка отправки') + ' Позвоните: ' + PHONE_FALLBACK);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
    });
  }

  function initAll() {
    document.querySelectorAll('form[data-lead-form]').forEach(initForm);
  }

  captureUtm();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // формы, добавленные динамически (чат-виджет, модалки)
  new MutationObserver(initAll).observe(document.documentElement, { childList: true, subtree: true });

  window.GBOLeads = { send: send, initForm: initForm, endpoint: ENDPOINT };
})();
