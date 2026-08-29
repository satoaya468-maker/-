/* =========================================================================
   EasyLead.
   Ни одного слушателя scroll: всё, что зависит от положения на странице,
   построено на IntersectionObserver. Анимации только по transform, opacity
   и filter.
   ========================================================================= */

(function () {
  'use strict';

  var CFG = window.EASYLEAD || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Контакты. Один источник правды: js/config.js
     --------------------------------------------------------------------- */

  function applyContacts() {
    if (CFG.phoneHref) {
      document.querySelectorAll('[data-contact="phone-link"]').forEach(function (el) {
        el.setAttribute('href', 'tel:' + CFG.phoneHref);
      });
    }
    if (CFG.phone) {
      document.querySelectorAll('[data-contact="phone-text"]').forEach(function (el) {
        el.textContent = CFG.phone;
      });
    }
    if (CFG.telegram) {
      document.querySelectorAll('[data-contact="tg-link"]').forEach(function (el) {
        el.setAttribute('href', CFG.telegram);
      });
    }
  }

  /* ---------------------------------------------------------------------
     Шапка. Прилипает по сентинелу в начале документа.
     --------------------------------------------------------------------- */

  function initHeader() {
    var header = document.getElementById('header');
    var sentinel = document.getElementById('top-sentinel');
    if (!header || !sentinel || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      header.dataset.stuck = String(!entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ---------------------------------------------------------------------
     Появление секций. Один раз, без блокировки контента: элементы уже
     в потоке, класс .js только добавляет стартовое смещение.
     --------------------------------------------------------------------- */

  function initReveals() {
    var items = document.querySelectorAll('.reveal');

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

    items.forEach(function (el) { io.observe(el); });

    window.addEventListener('load', function () {
      setTimeout(function () {
        document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
          var box = el.getBoundingClientRect();
          if (box.top < window.innerHeight * 1.5) el.classList.add('is-in');
        });
      }, 900);
    }, { once: true });

    /* Первый экран показываем сразу: ждать наблюдателя незачем. */
    requestAnimationFrame(function () {
      document.querySelectorAll('.hero .reveal').forEach(function (el) {
        el.classList.add('is-in');
        io.unobserve(el);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Меню на телефоне. На многостраничнике это единственный способ попасть
     в раздел: навигация в шапке спрятана до 900px.
     --------------------------------------------------------------------- */

  function initMenu() {
    var btn  = document.querySelector('[data-burger]');
    var menu = document.querySelector('[data-menu]');
    if (!btn || !menu) return;

    /* Текущий раздел подсвечиваем по адресу, а не руками в каждой странице. */
    var here = location.pathname.replace(/index\.html$/, '');
    menu.querySelectorAll('a[href^="/"]').forEach(function (a) {
      if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
    });

    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      document.body.dataset.menuOpen = String(open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.dataset.open = 'true'; });
      } else {
        menu.dataset.open = 'false';
        var hide = function () { menu.hidden = true; };
        if (reduced) hide();
        else setTimeout(hide, 280);
      }
    }

    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    /* Ссылка внутри страницы меню не перезагружает, поэтому закрываем сами. */
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Мобильный док. Показываем, когда герой ушёл за верхний край.
     --------------------------------------------------------------------- */

  function initDock() {
    var dock = document.querySelector('[data-dock]');
    var hero = document.querySelector('.hero');
    if (!dock || !hero || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      var show = !entries[0].isIntersecting;
      dock.dataset.show = String(show);
      dock.setAttribute('aria-hidden', String(!show));
    }, { threshold: 0, rootMargin: '-70px 0px 0px 0px' }).observe(hero);
  }

  /* На подстраницах героя нет, там за док отвечает верх страницы. */
  function initDockFallback() {
    var dock = document.querySelector('[data-dock]');
    var head = document.querySelector('.page-head');
    if (!dock || !head || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      var show = !entries[0].isIntersecting;
      dock.dataset.show = String(show);
      dock.setAttribute('aria-hidden', String(!show));
    }, { threshold: 0, rootMargin: '-70px 0px 0px 0px' }).observe(head);
  }

  /* ---------------------------------------------------------------------
     Бесконечные анимации ставим на паузу, пока элемент вне экрана.
     Лента из 36 логотипов и блик по панели иначе занимают композитор
     всё время, пока человек читает середину страницы.
     --------------------------------------------------------------------- */

  function initOffscreenPause() {
    var nodes = document.querySelectorAll('[data-anim]');
    if (!nodes.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.dataset.anim = entry.isIntersecting ? 'running' : 'paused';
      });
    }, { rootMargin: '120px 0px' });

    nodes.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Часы в панели заявок. Реальное время устройства, не выдуманная цифра.
     --------------------------------------------------------------------- */

  function timeNow() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function initClock() {
    var el = document.querySelector('[data-clock]');
    if (!el) return;
    var tick = function () { el.textContent = timeNow(); };
    tick();
    setInterval(tick, 20000);
  }

  /* ---------------------------------------------------------------------
     Телефон. Маска и проверка под российский номер.
     --------------------------------------------------------------------- */

  function digitsOf(value) {
    var d = (value || '').replace(/\D/g, '');
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] === '9') d = '7' + d;
    if (d[0] !== '7') d = d ? '7' + d : d;
    return d.slice(0, 11);
  }

  function formatPhone(value) {
    var d = digitsOf(value);
    if (!d) return '';
    var rest = d.slice(1);
    var out = '+7';
    if (rest.length) out += ' (' + rest.slice(0, 3);
    if (rest.length >= 3) out += ')';
    if (rest.length > 3) out += ' ' + rest.slice(3, 6);
    if (rest.length > 6) out += '-' + rest.slice(6, 8);
    if (rest.length > 8) out += '-' + rest.slice(8, 10);
    return out;
  }

  function phoneIsValid(value) { return digitsOf(value).length === 11; }

  function bindPhoneMask(input) {
    var reformat = function () {
      var atEnd = input.selectionStart === input.value.length;
      var next = formatPhone(input.value);
      if (next === input.value) return;
      input.value = next;
      if (atEnd) {
        var end = input.value.length;
        try { input.setSelectionRange(end, end); } catch (e) { /* type=tel в старых браузерах */ }
      }
    };
    input.addEventListener('input', reformat);
    input.addEventListener('blur', reformat);
  }

  /* ---------------------------------------------------------------------
     Панель заявок. Отражает то, что печатают в любой из форм.
     --------------------------------------------------------------------- */

  var panel = {
    root:   document.querySelector('[data-panel]'),
    name:   document.querySelector('[data-panel-name]'),
    phone:  document.querySelector('[data-panel-phone]'),
    status: document.querySelector('[data-panel-status]')
  };

  function setPanelValue(el, text) {
    if (!el) return;
    var empty = !text;
    var next = empty ? 'не заполнено' : text;
    if (el.textContent === next) return;

    /* Blur на подмене: без него два значения читаются как два объекта. */
    if (!reduced) {
      el.classList.add('is-swapping');
      setTimeout(function () {
        el.textContent = next;
        el.dataset.empty = String(empty);
        el.classList.remove('is-swapping');
      }, 90);
    } else {
      el.textContent = next;
      el.dataset.empty = String(empty);
    }
  }

  var typed = { name: '', phone: '' };

  function mirror(field, value) {
    if (!panel.root) return;
    if (panel.root.dataset.state === 'sent') return;

    typed[field] = value.trim();
    if (field === 'name')  setPanelValue(panel.name, typed.name);
    if (field === 'phone') setPanelValue(panel.phone, typed.phone);

    var filled = Boolean(typed.name || typed.phone);
    panel.root.dataset.state = filled ? 'typing' : 'idle';
    if (panel.status) {
      panel.status.textContent =
        typed.name && phoneIsValid(typed.phone) ? 'Готово к отправке'
        : filled ? 'Заполняется'
        : 'Ждём заявку';
    }
  }

  function panelDelivered(name, phone) {
    if (!panel.root) return;
    setPanelValue(panel.name, name);
    setPanelValue(panel.phone, phone);
    panel.root.dataset.state = 'sent';
    if (panel.status) panel.status.textContent = 'Доставлено в ' + timeNow();
  }

  /* ---------------------------------------------------------------------
     Формы
     --------------------------------------------------------------------- */

  var MSG = {
    sending: 'Отправляем',
    done:    'Заявка у нас. Перезвоним на указанный номер.',
    fail:    'Не получилось отправить. Позвоните нам: ',
    noWire:  'Форма ещё не подключена. Позвоните нам: '
  };

  function fieldOf(input) { return input.closest('.field'); }

  function markInvalid(input, invalid) {
    var f = fieldOf(input);
    if (f) f.dataset.invalid = String(invalid);
    input.setAttribute('aria-invalid', String(invalid));
  }

  function validate(form) {
    var name  = form.querySelector('[data-mirror="name"]');
    var phone = form.querySelector('[data-mirror="phone"]');
    var ok = true;

    if (!name.value.trim()) { markInvalid(name, true); ok = false; } else markInvalid(name, false);
    if (!phoneIsValid(phone.value)) { markInvalid(phone, true); ok = false; } else markInvalid(phone, false);

    if (!ok) {
      var first = form.querySelector('[data-invalid="true"] .field__input');
      if (first) first.focus();
    }
    return ok;
  }

  function setBusy(form, busy) {
    var btn   = form.querySelector('[data-submit]');
    var label = form.querySelector('[data-submit-label]');
    btn.disabled = busy;
    if (busy) {
      label.textContent = MSG.sending;
      if (!btn.querySelector('.spinner')) {
        var s = document.createElement('span');
        s.className = 'spinner';
        btn.appendChild(s);
      }
    } else {
      var sp = btn.querySelector('.spinner');
      if (sp) sp.remove();
      label.textContent = 'Оставить заявку';
    }
  }

  function say(form, text, tone) {
    var el = form.querySelector('[data-status]');
    if (!el) return;
    el.textContent = text;
    if (tone) el.dataset.tone = tone; else el.removeAttribute('data-tone');
  }

  function contactSuffix() {
    return (CFG.phone || '') + (CFG.telegram ? ' или напишите в Telegram.' : '');
  }

  function lockDone(form, name, phone) {
    form.querySelectorAll('.field__input').forEach(function (i) { i.readOnly = true; });
    var btn   = form.querySelector('[data-submit]');
    var label = form.querySelector('[data-submit-label]');
    var sp    = btn.querySelector('.spinner');
    if (sp) sp.remove();
    btn.disabled = true;
    btn.classList.add('btn--done');
    label.textContent = 'Заявка отправлена';
    if (!btn.querySelector('.check')) {
      var ok = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      ok.setAttribute('class', 'check');
      ok.setAttribute('viewBox', '0 0 16 16');
      ok.setAttribute('aria-hidden', 'true');
      ok.innerHTML = '<circle cx="8" cy="8" r="6.6"/><path d="M5.2 8.2l2 2 3.6-4"/>';
      btn.insertBefore(ok, btn.firstChild);
    }
    say(form, MSG.done, 'done');
    panelDelivered(name, phone);
  }

  function initForms() {
    document.querySelectorAll('[data-lead-form]').forEach(function (form) {
      var phoneInput = form.querySelector('[data-mirror="phone"]');
      bindPhoneMask(phoneInput);

      form.querySelectorAll('[data-mirror]').forEach(function (input) {
        input.addEventListener('input', function () {
          if (fieldOf(input) && fieldOf(input).dataset.invalid === 'true') markInvalid(input, false);
          mirror(input.dataset.mirror, input.value);
        });
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (form.dataset.state === 'done' || form.dataset.state === 'busy') return;

        /* Ловушка для ботов: живой человек это поле не видит. */
        var honey = form.querySelector('.honey');
        if (honey && honey.value) return;

        if (!validate(form)) {
          say(form, 'Проверьте выделенные поля.', 'error');
          return;
        }

        var name  = form.querySelector('[data-mirror="name"]').value.trim();
        var phone = formatPhone(form.querySelector('[data-mirror="phone"]').value);

        if (!CFG.endpoint) {
          /* Ложного «отправлено» не показываем. */
          say(form, MSG.noWire + contactSuffix(), 'error');
          console.error('[EasyLead] Не задан endpoint в js/config.js. Заявка никуда не ушла.');
          return;
        }

        form.dataset.state = 'busy';
        setBusy(form, true);
        say(form, '');

        fetch(CFG.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            phone: phone,
            page: location.href,
            ref: document.referrer || null,
            ts: new Date().toISOString()
          })
        })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            form.dataset.state = 'done';
            lockDone(form, name, phone);
            if (CFG.thanksUrl) setTimeout(function () { location.href = CFG.thanksUrl; }, 900);
          })
          .catch(function (err) {
            form.dataset.state = '';
            setBusy(form, false);
            say(form, MSG.fail + contactSuffix(), 'error');
            console.error('[EasyLead] Отправка не удалась:', err);
          });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Старт
     --------------------------------------------------------------------- */

  applyContacts();
  initHeader();
  initMenu();
  initOffscreenPause();
  initReveals();
  initDock();
  initDockFallback();
  initClock();
  initForms();
})();
