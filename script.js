/* =========================================================
   Фисташка: интерактив лендинга
   ========================================================= */

/* Адрес приёмника заявок. Подставьте URL воркера.
   Тело запроса: JSON { name, phone, type, comment, page }.
   Никаких токенов и ключей во фронтенде: авторизация остаётся на стороне воркера. */
const FORM_ENDPOINT = 'ЗАМЕНИТЬ_НА_URL_ВОРКЕРА';

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. Состояние шапки после скролла.
        IntersectionObserver по сентинелу вместо scroll-слушателя:
        не нагружает главный поток на каждом кадре прокрутки.
     --------------------------------------------------------- */
  const header = document.getElementById('header');
  const sentinel = document.getElementById('top-sentinel');

  if (header && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries) {
        header.classList.toggle('is-stuck', !entries[0].isIntersecting);
      },
      { rootMargin: '0px' }
    ).observe(sentinel);
  }

  /* ---------------------------------------------------------
     2. Мобильное меню
     --------------------------------------------------------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  function closeMenu() {
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    nav.classList.remove('is-open');
    header.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      const open = burger.getAttribute('aria-expanded') === 'true';
      if (open) {
        closeMenu();
      } else {
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', 'Закрыть меню');
        nav.classList.add('is-open');
        header.classList.add('is-open');
      }
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        burger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---------------------------------------------------------
     3. Плейсхолдеры: пока настоящих фото нет, прячем битую
        картинку и показываем подпись, что за кадр сюда нужен.
     --------------------------------------------------------- */
  function markEmpty(img) {
    const box = img.closest('.ph');
    if (box) box.classList.add('is-empty');
  }

  document.querySelectorAll('.ph img').forEach(function (img) {
    img.addEventListener('error', function () { markEmpty(img); });
    // изображение могло не загрузиться ещё до навешивания обработчика
    if (img.complete && img.naturalWidth === 0) markEmpty(img);
  });

  /* ---------------------------------------------------------
     4. Появление секций при скролле
     --------------------------------------------------------- */
  const revealables = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );

    // лёгкий каскад внутри одной сетки, чтобы карточки не всплывали разом
    document.querySelectorAll('.cards, .bento').forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (child, i) {
        if (child.classList.contains('reveal')) {
          child.style.setProperty('--delay', Math.min(i, 5) * 60 + 'ms');
        }
      });
    });

    revealables.forEach(function (el) { revealObserver.observe(el); });

    // Страховка: показать всё, что уже находится в зоне видимости или выше неё.
    // Это закрывает переход по прямой ссылке с якорем и восстановление позиции
    // прокрутки при перезагрузке, когда обсервер не успевает отработать.
    function revealPassed() {
      revealables.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
        }
      });
    }
    window.addEventListener('load', revealPassed);
    window.addEventListener('hashchange', function () {
      window.setTimeout(revealPassed, 400);
    });
  }

  /* ---------------------------------------------------------
     5. Маска телефона +7 (999) 999-99-99
     --------------------------------------------------------- */
  function onlyDigits(value) {
    return value.replace(/\D/g, '');
  }

  function normalize(digits) {
    if (!digits) return '';
    if (digits[0] === '8' || digits[0] === '7') digits = '7' + digits.slice(1);
    else digits = '7' + digits;
    return digits.slice(0, 11);
  }

  function formatPhone(digits) {
    const rest = digits.slice(1);
    let out = '+7';
    if (rest.length) out += ' (' + rest.slice(0, 3);
    if (rest.length >= 3) out += ')';
    if (rest.length > 3) out += ' ' + rest.slice(3, 6);
    if (rest.length > 6) out += '-' + rest.slice(6, 8);
    if (rest.length > 8) out += '-' + rest.slice(8, 10);
    return out;
  }

  document.querySelectorAll('[data-phone]').forEach(function (input) {
    input.addEventListener('focus', function () {
      if (!input.value) input.value = '+7 ';
    });

    input.addEventListener('blur', function () {
      if (onlyDigits(input.value).length <= 1) input.value = '';
    });

    input.addEventListener('input', function (e) {
      const deleting = e.inputType && e.inputType.indexOf('delete') === 0;
      let digits = onlyDigits(input.value);

      // при удалении разделителя убираем ещё и цифру перед ним,
      // иначе маска сразу возвращает удалённый символ на место
      if (deleting && input.value && !/\d$/.test(input.value)) {
        digits = digits.slice(0, -1);
      }

      if (!digits) {
        input.value = '';
        return;
      }

      input.value = formatPhone(normalize(digits));
    });

    input.addEventListener('paste', function (e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      const digits = onlyDigits(text);
      if (digits) input.value = formatPhone(normalize(digits));
    });
  });

  /* ---------------------------------------------------------
     6. Валидация и отправка заявок
     --------------------------------------------------------- */
  function setError(input, message) {
    const errorBox = document.getElementById(input.id + '-error');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
        input.setAttribute('aria-describedby', errorBox.id);
      }
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      if (errorBox) {
        errorBox.textContent = '';
        errorBox.hidden = true;
      }
    }
  }

  function validate(form) {
    let firstInvalid = null;

    const name = form.querySelector('input[name="name"]');
    if (name) {
      const value = name.value.trim();
      if (value.length < 2) {
        setError(name, 'Напишите, как к вам обращаться');
        firstInvalid = firstInvalid || name;
      } else {
        setError(name, '');
      }
    }

    const phone = form.querySelector('input[name="phone"]');
    if (phone) {
      const digits = onlyDigits(phone.value);
      if (digits.length !== 11) {
        setError(phone, 'Введите номер телефона полностью');
        firstInvalid = firstInvalid || phone;
      } else {
        setError(phone, '');
      }
    }

    return firstInvalid;
  }

  function handleSubmit(form) {
    const button = form.querySelector('[data-submit]');
    const status = form.querySelector('[data-status]');
    const idleLabel = button.textContent;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      status.textContent = '';
      status.className = 'form__status';

      const invalid = validate(form);
      if (invalid) {
        invalid.focus();
        return;
      }

      if (FORM_ENDPOINT === 'ЗАМЕНИТЬ_НА_URL_ВОРКЕРА') {
        status.textContent = 'Приём заявок ещё не подключён: укажите FORM_ENDPOINT в script.js.';
        status.className = 'form__status is-error';
        return;
      }

      const data = {
        name: form.querySelector('[name="name"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        type: form.querySelector('[name="type"]').value,
        comment: (form.querySelector('[name="comment"]') || { value: '' }).value.trim(),
        page: window.location.href
      };

      button.disabled = true;
      button.textContent = 'Отправляем...';

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          button.textContent = 'Заявка отправлена';
          status.textContent = 'Спасибо, мы получили заявку и перезвоним в рабочие часы.';
          status.className = 'form__status is-success';
          form.reset();
        })
        .catch(function () {
          button.disabled = false;
          button.textContent = idleLabel;
          status.textContent = 'Не получилось отправить заявку. Позвоните нам по номеру +7 982 333-27-28.';
          status.className = 'form__status is-error';
        });
    });

    // снимаем ошибку, как только человек начал править поле
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.hasAttribute('aria-invalid')) setError(field, '');
      });
    });
  }

  document.querySelectorAll('#form-wholesale, #form-order').forEach(handleSubmit);
})();
