/* ============================================================
   ЮЛА — общий скрипт сайта
   · мобильное меню
   · онлайн-бронирование (модальное окно + формы на страницах)
   · CRM-уведомления (toast)
   · цифровой ассистент «Юля» от Ascend Systems
   Vanilla JS, без зависимостей.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Заглушка отправки в Telegram ----------
     Давид: подставьте токен бота и chat_id — заявки полетят в чат. */
  var TOKEN = 'YOUR_BOT_TOKEN';
  var CHAT_ID = 'YOUR_CHAT_ID';

  function sendToTelegram(text) {
    var url = 'https://api.telegram.org/bot' + TOKEN + '/sendMessage';
    var payload = { chat_id: CHAT_ID, text: text, parse_mode: 'HTML' };

    if (TOKEN === 'YOUR_BOT_TOKEN' || CHAT_ID === 'YOUR_CHAT_ID') {
      console.log('[Telegram · заглушка] POST ' + url, payload);
      return Promise.resolve({ ok: true, stub: true });
    }
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  /* ---------- Утилиты ---------- */
  var PACKAGES = [
    { id: 'zharkiy-bum', name: 'Жаркий бум', price: 8000 },
    { id: 'letniy', name: 'Летний', price: 11990 },
    { id: 'samye-malenkie', name: 'Самые маленькие (до 3 лет)', price: 9000 },
    { id: 'sladkiy', name: 'Сладкий', price: 7000 },
    { id: 'raduzhnyy', name: 'Радужный', price: 8990 },
    { id: 'razvlekatelnyy', name: 'Развлекательный 7+', price: 13990 }
  ];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function maskPhone(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (d.length === 11 && (d[0] === '8' || d[0] === '7')) d = '7' + d.slice(1);
    if (d.length === 10) d = '7' + d;
    if (d.length !== 11) return String(raw || '').trim() || 'номер не указан';
    return '+7 ' + d.slice(1, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7, 9) + ' ' + d.slice(9, 11);
  }

  /* Дату праздника нельзя выбрать в прошлом */
  function todayISO() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function lockPastDates(root) {
    $$('input[type="date"]', root).forEach(function (el) { el.min = todayISO(); });
  }

  function nowStamp() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ---------- Toast «Ascend Systems · CRM» ---------- */
  function toastStack() {
    var s = $('.toast-stack');
    if (!s) {
      s = document.createElement('div');
      s.className = 'toast-stack';
      document.body.appendChild(s);
    }
    return s;
  }

  function showToast(title, sub, top) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');

    var t1 = document.createElement('div');
    t1.className = 't-top';
    t1.textContent = top || 'ASCEND SYSTEMS · CRM';

    var t2 = document.createElement('b');
    t2.textContent = title;

    var t3 = document.createElement('div');
    t3.className = 't-sub';
    t3.textContent = sub;

    el.appendChild(t1); el.appendChild(t2); el.appendChild(t3);
    toastStack().appendChild(el);

    setTimeout(function () {
      el.classList.add('is-out');
      setTimeout(function () { el.remove(); }, 400);
    }, 7000);
  }
  window.yulaToast = showToast;

  /* ---------- Мобильное меню ---------- */
  function initMenu() {
    var burger = $('#burger');
    var menu = $('#mobileMenu');
    if (!burger || !menu) return;

    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Модальное окно онлайн-бронирования ---------- */
  var modal;

  function buildModal() {
    if ($('#bookModal')) { modal = $('#bookModal'); return; }

    var options = PACKAGES.map(function (p) {
      return '<option value="' + p.name + '">' + p.name + ' — ' + p.price.toLocaleString('ru-RU') + ' ₽</option>';
    }).join('');

    var html =
      '<div class="modal" id="bookModal" role="dialog" aria-modal="true" aria-labelledby="bookModalTitle">' +
        '<div class="modal__box">' +
          '<div class="modal__head">' +
            '<div class="yw-ava" aria-hidden="true">Ю</div>' +
            '<div>' +
              '<h3 id="bookModalTitle">Онлайн-бронирование</h3>' +
              '<p>Заполните форму — администратор подтвердит дату в течение часа</p>' +
            '</div>' +
            '<button class="yw-close" type="button" data-close aria-label="Закрыть">&times;</button>' +
          '</div>' +
          '<div class="modal__body" id="bookModalBody">' +
            '<form id="bookForm" novalidate>' +
              '<div class="field-row">' +
                '<div class="field"><label for="bf-name">Имя родителя</label><input id="bf-name" name="name" type="text" required autocomplete="name" placeholder="Как к вам обращаться"></div>' +
                '<div class="field"><label for="bf-phone">Телефон</label><input id="bf-phone" name="phone" type="tel" required autocomplete="tel" placeholder="+7 999 000 00 00"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field"><label for="bf-age">Возраст ребёнка</label><input id="bf-age" name="age" type="text" placeholder="например, 5 лет"></div>' +
                '<div class="field"><label for="bf-kids">Сколько детей</label><input id="bf-kids" name="kids" type="number" min="1" max="40" placeholder="10"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field"><label for="bf-date">Дата праздника</label><input id="bf-date" name="date" type="date" required></div>' +
                '<div class="field"><label for="bf-time">Время</label><input id="bf-time" name="time" type="time" value="14:00"></div>' +
              '</div>' +
              '<div class="field"><label for="bf-pkg">Пакет</label><select id="bf-pkg" name="pkg">' +
                '<option value="">Подберём вместе</option>' + options +
              '</select></div>' +
              '<div class="field"><label for="bf-note">Комментарий</label><textarea id="bf-note" name="note" placeholder="Любимый герой ребёнка, пожелания по программе, свой фотограф или торт"></textarea></div>' +
              '<button class="btn btn--primary btn--wide" type="submit">Забронировать дату</button>' +
              '<p class="form-note">Бронь закрепляется предоплатой от 2 000 ₽. Приезжать не нужно — можно перевести на карту.</p>' +
            '</form>' +
          '</div>' +
          '<div class="modal__ok" id="bookModalOk">' +
            '<div class="ok-mark" aria-hidden="true">&#10003;</div>' +
            '<h3 class="h3">Заявка принята</h3>' +
            '<p class="lead" style="margin:12px auto 0;text-align:center">Администратор Юля свяжется с вами в течение часа и подтвердит свободную дату.</p>' +
            '<button class="btn btn--ghost" type="button" data-close style="margin-top:26px">Закрыть</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var host = document.createElement('div');
    host.innerHTML = html;
    modal = host.firstChild;
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
    $('#bookForm').addEventListener('submit', onBookSubmit);
    lockPastDates($('#bookForm'));
  }

  function openModal(preselect) {
    buildModal();
    $('#bookModalBody').style.display = '';
    $('#bookModalOk').classList.remove('is-on');
    if (preselect) {
      var sel = $('#bf-pkg');
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.toLowerCase().indexOf(preselect.toLowerCase()) === 0) { sel.selectedIndex = i; break; }
      }
    }
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('#bf-name').focus(); }, 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  window.yulaBooking = openModal;

  function onBookSubmit(e) {
    e.preventDefault();
    var f = e.target;
    if (!f.name.value.trim() || !f.phone.value.trim() || !f.date.value) {
      ['name', 'phone', 'date'].forEach(function (k) {
        f[k].style.borderColor = f[k].value.trim() ? '' : '#D63C6E';
      });
      return;
    }
    var phone = maskPhone(f.phone.value);
    var text =
      '<b>Заявка на праздник · сайт Юла</b>\n' +
      'Родитель: ' + f.name.value.trim() + '\n' +
      'Телефон: ' + phone + '\n' +
      'Возраст ребёнка: ' + (f.age.value.trim() || '—') + '\n' +
      'Детей: ' + (f.kids.value || '—') + '\n' +
      'Дата: ' + f.date.value + ' ' + (f.time.value || '') + '\n' +
      'Пакет: ' + (f.pkg.value || 'подобрать') + '\n' +
      'Комментарий: ' + (f.note.value.trim() || '—') + '\n' +
      'Получено: ' + nowStamp();

    sendToTelegram(text);
    showToast('Заявка на праздник зафиксирована', 'Передано администратору Юла · ' + phone);

    $('#bookModalBody').style.display = 'none';
    $('#bookModalOk').classList.add('is-on');
    f.reset();
  }

  /* Кнопки бронирования на всех страницах */
  function initBookingTriggers() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-book]');
      if (!t) return;
      e.preventDefault();
      openModal(t.getAttribute('data-book'));
    });
  }

  /* ---------- Формы на страницах (быстрая бронь, обратная связь) ---------- */
  function initPageForms() {
    $$('form[data-form]').forEach(function (form) {
      if (form.getAttribute('data-form') === 'booking') lockPastDates(form);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var kind = form.getAttribute('data-form');
        var data = {};
        $$('input, select, textarea', form).forEach(function (el) {
          if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
          else if (el.name) data[el.name] = el.value.trim();
        });

        if (kind === 'booking') {
          if (!data.name || !data.phone || !data.date) return;
          var phone = maskPhone(data.phone);
          sendToTelegram(
            '<b>Заявка на праздник · форма на сайте</b>\n' +
            'Родитель: ' + data.name + '\nТелефон: ' + phone +
            '\nВозраст ребёнка: ' + (data.age || '—') +
            '\nДата: ' + data.date + '\nПакет: ' + (data.pkg || 'подобрать') +
            '\nКомментарий: ' + (data.note || '—') + '\nПолучено: ' + nowStamp()
          );
          showToast('Заявка на праздник зафиксирована', 'Передано администратору Юла · ' + phone);
        } else {
          if (!data.phone) return;
          var ph = maskPhone(data.phone);
          sendToTelegram(
            '<b>Обращение с сайта · разбор ситуации</b>\n' +
            'Оценка: ' + (data.rating || '—') + '\nИмя ребёнка: ' + (data.child || '—') +
            '\nТелефон: ' + ph + '\nДата праздника: ' + (data.date || '—') +
            '\nСвязь: ' + (data.contact || '—') + '\nЧто произошло: ' + (data.message || '—') +
            '\nПолучено: ' + nowStamp()
          );
          showToast('Спасибо, Юля свяжется с вами в течение суток', 'Обращение получено лично администратором · ' + ph);
        }

        var ok = form.parentNode.querySelector('[data-form-ok]');
        form.reset();
        if (ok) { form.style.display = 'none'; ok.style.display = 'block'; }
      });
    });
  }

  /* ---------- Блок оценки: 5 звёзд → 2ГИС, ниже → форма ---------- */
  function starSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.95 6.15 6.75.86-4.95 4.63 1.27 6.7L12 17.3l-6.02 3.24 1.27-6.7L2.3 9.21l6.75-.86z"/></svg>';
  }

  function initRating() {
    var box = $('#rateBox');
    if (!box) return;

    var starsWrap = $('#rateStars', box);
    var ask = $('#rateAsk', box);
    var good = $('#rateGood', box);
    var bad = $('#rateBad', box);
    var value = 0;

    for (var i = 1; i <= 5; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Оценка ' + i + ' из 5');
      b.dataset.val = String(i);
      b.innerHTML = starSvg();
      starsWrap.appendChild(b);
    }
    var buttons = $$('button', starsWrap);

    function paint(n) {
      buttons.forEach(function (b, idx) { b.classList.toggle('on', idx < n); });
    }
    starsWrap.addEventListener('mouseleave', function () { paint(value); });
    buttons.forEach(function (b) {
      b.addEventListener('mouseenter', function () { paint(+b.dataset.val); });
      b.addEventListener('click', function () {
        value = +b.dataset.val;
        paint(value);
        ask.style.display = 'none';
        if (value === 5) { good.style.display = 'block'; bad.style.display = 'none'; }
        else {
          good.style.display = 'none';
          bad.style.display = 'block';
          var hidden = $('input[name="rating"]', bad);
          if (hidden) hidden.value = value + ' из 5';
        }
      });
    });
  }

  /* ============================================================
     Цифровой ассистент «Юля»
     ============================================================ */
  var chat = {
    step: 0,
    started: false,
    data: { age: '', date: '', phone: '' }
  };

  function buildWidget() {
    if ($('#ywLauncher')) return;

    var launcher = document.createElement('button');
    launcher.className = 'yw-launcher';
    launcher.id = 'ywLauncher';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Открыть чат с администратором Юлей');
    launcher.innerHTML =
      '<span class="yw-ava" aria-hidden="true">Ю</span>' +
      '<span class="yw-launcher__txt"><b>Юля — отвечу за минуту</b><span>Забронируем ваш праздник</span></span>';

    var panel = document.createElement('div');
    panel.className = 'yw-panel';
    panel.id = 'ywPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Чат с администратором');
    panel.innerHTML =
      '<div class="yw-head">' +
        '<div class="yw-ava" aria-hidden="true">Ю</div>' +
        '<div class="yw-head__txt"><b>Юля · Администратор Юла</b><span>Отвечает круглосуточно</span></div>' +
        '<button class="yw-close" type="button" id="ywClose" aria-label="Закрыть чат">&times;</button>' +
      '</div>' +
      '<div class="yw-body" id="ywBody"></div>' +
      '<div class="yw-quick" id="ywQuick"></div>' +
      '<div class="yw-foot">' +
        '<form class="yw-input" id="ywForm">' +
          '<label class="sr-only" for="ywInput">Сообщение</label>' +
          '<input id="ywInput" type="text" autocomplete="off" placeholder="Напишите сообщение">' +
          '<button class="yw-send" type="submit" aria-label="Отправить">&rarr;</button>' +
        '</form>' +
        '<div class="yw-legal">Цифровой администратор · Ascend Systems</div>' +
      '</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    launcher.addEventListener('click', openChat);
    $('#ywClose').addEventListener('click', closeChat);
    $('#ywForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#ywInput');
      var val = input.value.trim();
      if (!val) return;
      input.value = '';
      handleUser(val);
    });
  }

  function openChat() {
    buildWidget();
    $('#ywPanel').classList.add('is-open');
    $('#ywLauncher').classList.add('is-hidden');
    if (!chat.started) {
      chat.started = true;
      botSay('Здравствуйте! Меня зовут Юля, помогу забронировать праздник. Сколько лет исполняется малышу?', 600, function () {
        quick(['3 года', '5 лет', '7 лет', '10 лет']);
      });
    }
    setTimeout(function () { $('#ywInput').focus(); }, 240);
  }

  function closeChat() {
    $('#ywPanel').classList.remove('is-open');
    $('#ywLauncher').classList.remove('is-hidden');
  }

  function scrollChat() {
    var body = $('#ywBody');
    body.scrollTop = body.scrollHeight;
  }

  function bubble(text, who) {
    var el = document.createElement('div');
    el.className = 'yw-msg yw-msg--' + who;
    el.textContent = text;
    $('#ywBody').appendChild(el);
    scrollChat();
  }

  function quick(items) {
    var wrap = $('#ywQuick');
    wrap.innerHTML = '';
    (items || []).forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', function () { handleUser(label); });
      wrap.appendChild(b);
    });
  }

  function botSay(text, delay, done) {
    var typing = document.createElement('div');
    typing.className = 'yw-typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    $('#ywBody').appendChild(typing);
    scrollChat();
    setTimeout(function () {
      typing.remove();
      bubble(text, 'bot');
      if (done) done();
    }, delay);
  }

  function handleUser(text) {
    quick([]);
    bubble(text, 'user');

    if (chat.step === 0) {
      chat.data.age = text;
      chat.step = 1;
      botSay('Отлично! На какую дату планируете и сколько будет детей?', 1200, function () {
        quick(['В ближайшую субботу', 'Через две недели', 'Ещё выбираем дату']);
      });
      return;
    }

    if (chat.step === 1) {
      chat.data.date = text;
      chat.step = 2;
      botSay('Записала. Подберу подходящий пакет и пришлю в WhatsApp свободные даты с ценами. Оставьте номер — свяжусь в течение часа.', 1400);
      return;
    }

    if (chat.step === 2) {
      chat.data.phone = text;
      chat.step = 3;
      var phone = maskPhone(text);

      sendToTelegram(
        '<b>Заявка на праздник · чат-ассистент</b>\n' +
        'Возраст ребёнка: ' + chat.data.age + '\n' +
        'Дата и гости: ' + chat.data.date + '\n' +
        'Телефон: ' + phone + '\n' +
        'Источник: виджет на сайте\n' +
        'Получено: ' + nowStamp()
      );
      showToast('Заявка на праздник зафиксирована', 'Передано администратору Юла · ' + phone);

      botSay('Спасибо! Свяжусь с вами в WhatsApp в течение часа. Хорошего дня!', 1000, function () {
        var el = document.createElement('div');
        el.className = 'yw-msg yw-msg--sys';
        el.textContent = 'Заявка передана в CRM · Ascend Systems';
        $('#ywBody').appendChild(el);
        scrollChat();
        quick(['Открыть форму брони', 'Написать в WhatsApp']);
      });
      return;
    }

    if (text === 'Открыть форму брони') { closeChat(); openModal(); return; }
    if (text === 'Написать в WhatsApp') { window.open('https://wa.me/79995833426', '_blank', 'noopener'); return; }

    botSay('Записала, передам Юле. Если удобнее голосом — позвоните: +7 (999) 583-34-26.', 1100, function () {
      quick(['Открыть форму брони', 'Написать в WhatsApp']);
    });
  }

  /* ---------- Лёгкое видео для мобильных ---------- */
  function initHeroVideo() {
    var v = $('.hero__media video');
    if (!v) return;
    if (window.matchMedia('(max-width: 760px)').matches && v.src.indexOf('hero-mobile') === -1) {
      v.src = './video/hero-mobile.mp4';
      v.load();
      var played = v.play();
      if (played && played.catch) played.catch(function () { /* автозапуск запрещён — останется постер */ });
    }
  }

  /* ---------- Старт ---------- */
  function init() {
    initHeroVideo();
    initMenu();
    initBookingTriggers();
    initPageForms();
    initRating();
    buildWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
