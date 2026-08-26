/* ==========================================================================
   EasyLead — общий скрипт
   Ванильный JS, без зависимостей. Всё, что здесь есть, только улучшает
   уже работающую страницу: без JS сайт читается и по нему можно ходить.
   ========================================================================== */

/* Адрес обработчика формы. Токены, ключи и chat_id остаются на стороне
   воркера, во фронтенде только этот URL. */
const FORM_ENDPOINT = 'ЗАМЕНИТЬ_НА_URL_ВОРКЕРА';

/* Контакты в одном месте: используются в модалке заявки. */
const CONTACTS = {
  phone: '+7 (999) 000-00-00',
  phoneHref: 'tel:+79990000000',
  telegram: '@easylead',
  telegramHref: 'https://t.me/easylead'
};

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------------
     1. Шапка: прозрачная наверху, полупрозрачная с размытием после 40px.
     Наблюдаем за маячком высотой 40px вместо слушателя scroll: он
     перестаёт пересекаться с экраном ровно на этой отметке.
     ---------------------------------------------------------------------- */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }, { rootMargin: '0px' }).observe(sentinel);
  }

  /* ------------------------------------------------------------------------
     2. Мобильное меню: полный экран, Esc, возврат фокуса, блокировка прокрутки
     ---------------------------------------------------------------------- */
  function initMobileMenu() {
    const burger = document.querySelector('[data-burger]');
    const menu = document.querySelector('[data-mobile-menu]');
    const main = document.querySelector('main');
    if (!burger || !menu) return;

    function open() {
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
      if (main) main.setAttribute('inert', '');
      const first = menu.querySelector('a, button');
      if (first) first.focus();
    }

    function close(returnFocus) {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      if (main) main.removeAttribute('inert');
      if (returnFocus) burger.focus();
    }

    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') close(true);
      else open();
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) close(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) close(true);
    });

    /* Меню только для узких экранов: при возврате на десктоп закрываем. */
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (event) {
      if (event.matches && !menu.hidden) close(false);
    });
  }

  /* ------------------------------------------------------------------------
     3. Появление блоков при скролле
     ---------------------------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ------------------------------------------------------------------------
     4. Плейсхолдеры изображений
     Пока файла нет, виден блок с подписью. Как только картинка окажется
     в /img под тем же именем, она проявится и подпись исчезнет.
     ---------------------------------------------------------------------- */
  function initMedia() {
    document.querySelectorAll('.media__img, .logo-item__img').forEach(function (img) {
      function markLoaded() {
        if (img.naturalWidth > 0) img.classList.add('is-loaded');
      }
      if (img.complete) markLoaded();
      else img.addEventListener('load', markLoaded, { once: true });
    });
  }

  /* ------------------------------------------------------------------------
     5. FAQ: нативные details/summary плюс плавная высота.
     Семантику и доступность даёт сама пара details/summary, поэтому
     ручных aria-атрибутов здесь нет: они бы дублировали нативные.
     ---------------------------------------------------------------------- */
  function initFaq() {
    document.querySelectorAll('[data-faq] .faq__item').forEach(function (item) {
      const summary = item.querySelector('summary');
      const body = item.querySelector('.faq__body');
      if (!summary || !body) return;

      summary.addEventListener('click', function (event) {
        if (reduceMotion.matches || typeof body.animate !== 'function') return;
        event.preventDefault();

        if (item.open) {
          const anim = body.animate(
            { height: [body.scrollHeight + 'px', '0px'], opacity: [1, 0] },
            { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
          );
          anim.onfinish = function () { item.open = false; body.style.height = ''; };
        } else {
          item.open = true;
          body.animate(
            { height: ['0px', body.scrollHeight + 'px'], opacity: [0, 1] },
            { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
          );
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. Форма заявки
     ---------------------------------------------------------------------- */
  const NICHES = [
    'Автосервис и автотовары',
    'Строительство и ремонт',
    'Красота и здоровье',
    'Клининг и бытовые услуги',
    'Доставка и логистика',
    'Кафе, бары, рестораны',
    'Обучение и курсы',
    'Другая ниша'
  ];

  const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"/></svg>';

  /* Разметка формы живёт в одном месте: её используют и страница контактов,
     и модалка. Без JS форма не отправилась бы всё равно, поэтому в разметке
     страницы на её месте стоит noscript с телефоном и телеграмом. */
  function leadFormMarkup(id) {
    const options = NICHES.map(function (niche) {
      return '<option value="' + niche + '">' + niche + '</option>';
    }).join('');

    return '' +
      '<form class="form" novalidate data-lead-form-el>' +
        '<div class="form__row">' +
          '<div class="field" data-field="name">' +
            '<label for="' + id + '-name">Имя <span class="field__req" aria-hidden="true">*</span></label>' +
            '<input id="' + id + '-name" name="name" type="text" autocomplete="name" placeholder="Как к вам обращаться" required aria-describedby="' + id + '-name-error">' +
            '<p class="field__error" id="' + id + '-name-error"></p>' +
          '</div>' +
          '<div class="field" data-field="phone">' +
            '<label for="' + id + '-phone">Телефон <span class="field__req" aria-hidden="true">*</span></label>' +
            '<input id="' + id + '-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required aria-describedby="' + id + '-phone-error">' +
            '<p class="field__error" id="' + id + '-phone-error"></p>' +
          '</div>' +
        '</div>' +
        '<div class="field" data-field="niche">' +
          '<label for="' + id + '-niche">Ниша бизнеса</label>' +
          '<select id="' + id + '-niche" name="niche">' +
            '<option value="">Выберите нишу</option>' + options +
          '</select>' +
        '</div>' +
        '<div class="field" data-field="comment">' +
          '<label for="' + id + '-comment">Комментарий</label>' +
          '<textarea id="' + id + '-comment" name="comment" rows="3" placeholder="Что нужно сделать, есть ли сайт сейчас, к какому сроку"></textarea>' +
        '</div>' +
        '<div class="form__submit">' +
          '<button class="btn btn--primary" type="submit" data-submit>' +
            '<span data-submit-label>Отправить заявку</span>' +
          '</button>' +
          '<p class="form__status" role="status" aria-live="polite" data-form-status></p>' +
          '<p class="form__note">Нажимая кнопку, вы соглашаетесь на обработку контактных данных. Отвечаем в рабочее время, обычно в течение часа.</p>' +
        '</div>' +
      '</form>';
  }

  function formatPhone(raw) {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits && !digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);
    if (!digits) return '';

    let out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length > 4) out += ') ' + digits.slice(4, 7);
    if (digits.length > 7) out += '-' + digits.slice(7, 9);
    if (digits.length > 9) out += '-' + digits.slice(9, 11);
    return out;
  }

  function phoneDigits(value) {
    return value.replace(/\D/g, '').length;
  }

  function bindPhoneMask(input) {
    input.addEventListener('focus', function () {
      if (!input.value) input.value = '+7 (';
    });

    input.addEventListener('input', function () {
      const caretAtEnd = input.selectionStart === input.value.length;
      const digitsBeforeCaret = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
      const formatted = formatPhone(input.value);
      input.value = formatted;

      if (caretAtEnd || !digitsBeforeCaret) {
        input.setSelectionRange(formatted.length, formatted.length);
        return;
      }
      let seen = 0;
      let position = formatted.length;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          seen++;
          if (seen === digitsBeforeCaret) { position = i + 1; break; }
        }
      }
      input.setSelectionRange(position, position);
    });

    input.addEventListener('blur', function () {
      if (phoneDigits(input.value) <= 1) input.value = '';
    });
  }

  function setFieldError(form, name, message) {
    const field = form.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    const control = field.querySelector('input, select, textarea');
    const error = field.querySelector('.field__error');
    field.setAttribute('data-invalid', message ? 'true' : 'false');
    if (control) {
      if (message) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
    if (error) error.textContent = message || '';
  }

  function validate(form) {
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value;
    let firstInvalid = null;

    if (name.length < 2) {
      setFieldError(form, 'name', 'Напишите, как к вам обращаться');
      firstInvalid = firstInvalid || form.elements.name;
    } else {
      setFieldError(form, 'name', '');
    }

    if (phoneDigits(phone) !== 11) {
      setFieldError(form, 'phone', 'Телефон нужен полностью: +7 и 10 цифр');
      firstInvalid = firstInvalid || form.elements.phone;
    } else {
      setFieldError(form, 'phone', '');
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return null;
    }

    return {
      name: name,
      phone: phone,
      niche: form.elements.niche.value || '',
      comment: form.elements.comment.value.trim(),
      page: document.body.dataset.page || document.title,
      url: window.location.href
    };
  }

  function initLeadForm(form) {
    if (!form || form.dataset.ready === 'true') return;
    form.dataset.ready = 'true';

    const button = form.querySelector('[data-submit]');
    const label = form.querySelector('[data-submit-label]');
    const status = form.querySelector('[data-form-status]');
    const phone = form.elements.phone;

    bindPhoneMask(phone);

    /* Ошибка поля гаснет, как только человек начал её исправлять. */
    ['name', 'phone'].forEach(function (name) {
      form.elements[name].addEventListener('input', function () {
        if (form.querySelector('[data-field="' + name + '"]').getAttribute('data-invalid') === 'true') {
          setFieldError(form, name, '');
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';
      status.removeAttribute('data-tone');

      const payload = validate(form);
      if (!payload) return;

      if (FORM_ENDPOINT === 'ЗАМЕНИТЬ_НА_URL_ВОРКЕРА') {
        status.setAttribute('data-tone', 'error');
        status.textContent = 'Форма пока не подключена: укажите адрес обработчика в script.js. Данные не отправлены.';
        return;
      }

      button.disabled = true;
      label.textContent = 'Отправляем...';

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) throw new Error('bad-status');
          button.innerHTML = ICON_CHECK + '<span data-submit-label>Заявка отправлена</span>';
          status.setAttribute('data-tone', 'ok');
          status.textContent = 'Спасибо. Свяжемся с вами по указанному номеру.';
          form.elements.name.value = '';
          form.elements.phone.value = '';
          form.elements.niche.value = '';
          form.elements.comment.value = '';
        })
        .catch(function () {
          /* Форму не очищаем: человек должен видеть, что он ввёл. */
          button.disabled = false;
          label.textContent = 'Отправить заявку';
          status.setAttribute('data-tone', 'error');
          status.textContent = 'Не удалось отправить заявку. Проверьте связь и попробуйте ещё раз или напишите нам в Telegram.';
        });
    });
  }

  /* Форма на странице контактов */
  function mountInlineForms() {
    document.querySelectorAll('[data-lead-form]').forEach(function (mount, index) {
      mount.innerHTML = leadFormMarkup(mount.id || 'lead-' + index);
      initLeadForm(mount.querySelector('[data-lead-form-el]'));
    });
  }

  /* ------------------------------------------------------------------------
     7. Модалка заявки
     Кнопки остаются ссылками на contact.html#form, поэтому без JS они
     тоже работают. Здесь мы лишь перехватываем клик.
     ---------------------------------------------------------------------- */
  function initDialog() {
    const triggers = document.querySelectorAll('[data-lead-open]');
    if (!triggers.length || typeof HTMLDialogElement !== 'function') return;

    let dialog = null;

    function build() {
      dialog = document.createElement('dialog');
      dialog.className = 'dialog';
      dialog.id = 'lead-dialog';
      dialog.setAttribute('aria-labelledby', 'lead-dialog-title');
      dialog.innerHTML = '' +
        '<div class="dialog__inner">' +
          '<div class="dialog__head">' +
            '<div>' +
              '<h2 id="lead-dialog-title">Расчёт стоимости</h2>' +
              '<p>Оставьте контакты. Зададим пару вопросов и пришлём смету с фиксированной ценой и сроком.</p>' +
            '</div>' +
            '<button type="button" class="dialog__close" data-lead-close aria-label="Закрыть окно">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
            '</button>' +
          '</div>' +
          leadFormMarkup('dialog') +
          '<p class="form__note" style="margin-top:16px">Или сразу напишите: ' +
            '<a class="link-inline" href="' + CONTACTS.phoneHref + '">' + CONTACTS.phone + '</a>, ' +
            '<a class="link-inline" href="' + CONTACTS.telegramHref + '" rel="noopener">Telegram ' + CONTACTS.telegram + '</a>.' +
          '</p>' +
        '</div>';

      document.body.appendChild(dialog);
      initLeadForm(dialog.querySelector('[data-lead-form-el]'));

      dialog.querySelector('[data-lead-close]').addEventListener('click', function () {
        dialog.close();
      });

      /* Клик по подложке закрывает окно. */
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
      });

      dialog.addEventListener('close', function () {
        document.body.classList.remove('is-locked');
      });
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        if (!dialog) build();
        document.body.classList.add('is-locked');
        dialog.showModal();
        const firstField = dialog.querySelector('input');
        if (firstField) firstField.focus();
      });
    });
  }

  /* ------------------------------------------------------------------------
     Запуск
     ---------------------------------------------------------------------- */
  function init() {
    initHeader();
    initMobileMenu();
    initReveal();
    initMedia();
    initFaq();
    mountInlineForms();
    initDialog();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
