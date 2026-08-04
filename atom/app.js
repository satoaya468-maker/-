/* =============================================================================
   Атом — сервисный центр. Общий скрипт для всех страниц.

   Формы работают как заглушки: данные уходят в console.log и показывается
   модальное окно подтверждения. Подключить бэкенд можно в submitLead().
   ========================================================================== */

(function () {
  'use strict';

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  };

  /* --- Шапка: тень при прокрутке ---------------------------------------- */

  var header = $('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Мобильное меню ---------------------------------------------------- */

  var burger = $('.burger');
  var mobileMenu = $('.mobilemenu');

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    doc.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      doc.body.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    $$('.mobilemenu__close, .mobilemenu__link', mobileMenu).forEach(function (el) {
      el.addEventListener('click', closeMenu);
    });
  }

  /* --- Модальное окно ---------------------------------------------------- */

  var modal = $('#success-modal');
  var lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = doc.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    doc.body.classList.add('is-locked');
    var closeBtn = $('.modal__close', modal);
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-close-modal]')) closeModal();
    });
  }

  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modal && modal.classList.contains('is-open')) closeModal();
    if (mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu();
  });

  /* --- Маска телефона ---------------------------------------------------- */

  function formatPhone(raw) {
    var digits = raw.replace(/\D/g, '');

    if (digits[0] === '8') digits = '7' + digits.slice(1);
    if (digits[0] !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    var rest = digits.slice(1);
    var out = '+7';
    if (rest.length) out += ' (' + rest.slice(0, 3);
    if (rest.length >= 3) out += ') ' + rest.slice(3, 6);
    if (rest.length >= 6) out += '-' + rest.slice(6, 8);
    if (rest.length >= 8) out += '-' + rest.slice(8, 10);
    return out;
  }

  $$('input[type="tel"]').forEach(function (input) {
    input.addEventListener('focus', function () {
      if (!input.value) input.value = '+7 ';
    });

    input.addEventListener('input', function () {
      input.value = formatPhone(input.value);
      setFieldValidity(input, true);
    });

    input.addEventListener('blur', function () {
      if (input.value.replace(/\D/g, '').length <= 1) input.value = '';
    });
  });

  /* --- Валидация и отправка --------------------------------------------- */

  function setFieldValidity(input, valid) {
    var field = input.closest('.field');
    if (field) field.classList.toggle('field--invalid', !valid);
  }

  function validate(form) {
    var ok = true;
    $$('[required]', form).forEach(function (input) {
      var value = (input.value || '').trim();
      var valid = value !== '';

      if (valid && input.type === 'tel') {
        valid = value.replace(/\D/g, '').length === 11;
      }

      setFieldValidity(input, valid);
      if (!valid && ok) {
        input.focus();
        ok = false;
      } else if (!valid) {
        ok = false;
      }
    });
    return ok;
  }

  function submitLead(form) {
    var payload = { form: form.dataset.form || 'lead', page: location.pathname };
    new FormData(form).forEach(function (value, key) {
      payload[key] = typeof value === 'string' ? value.trim() : value;
    });

    // Заглушка: здесь подключается отправка на бэкенд или в CRM.
    console.log('[Атом] Заявка отправлена:', payload);

    var button = $('button[type="submit"]', form);
    if (button) {
      var label = button.textContent;
      button.disabled = true;
      button.textContent = 'Отправляем…';
      window.setTimeout(function () {
        button.disabled = false;
        button.textContent = label;
        form.reset();
        openModal();
      }, 500);
    } else {
      form.reset();
      openModal();
    }
  }

  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validate(form)) submitLead(form);
    });

    $$('input, select, textarea', form).forEach(function (input) {
      input.addEventListener('change', function () {
        if ((input.value || '').trim()) setFieldValidity(input, true);
      });
    });
  });

  /* --- Карусель отзывов -------------------------------------------------- */

  $$('[data-carousel]').forEach(function (carousel) {
    var track = $('[data-carousel-track]', carousel);
    var prev = $('[data-carousel-prev]', carousel);
    var next = $('[data-carousel-next]', carousel);
    if (!track) return;

    function stepSize() {
      var first = track.firstElementChild;
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap || '24') || 24;
      return first.getBoundingClientRect().width + gap;
    }

    function sync() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }

    if (prev) {
      prev.addEventListener('click', function () {
        track.scrollBy({ left: -stepSize(), behavior: 'smooth' });
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        track.scrollBy({ left: stepSize(), behavior: 'smooth' });
      });
    }

    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* --- Фильтр отзывов ---------------------------------------------------- */

  var filterBar = $('[data-filters]');
  if (filterBar) {
    var cards = $$('[data-review]');
    var counter = $('[data-filter-count]');

    filterBar.addEventListener('click', function (e) {
      var button = e.target.closest('.filter');
      if (!button) return;

      $$('.filter', filterBar).forEach(function (b) {
        b.classList.toggle('is-active', b === button);
        b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
      });

      var value = button.dataset.filter;
      var shown = 0;
      cards.forEach(function (card) {
        var match = value === 'all' || card.dataset.review === value;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });

      if (counter) counter.textContent = shown;
    });
  }

  /* --- FAQ --------------------------------------------------------------- */

  $$('.faq__q').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.faq__item');
      var open = item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* --- Отложенная загрузка карты ----------------------------------------- */

  $$('[data-map]').forEach(function (map) {
    var trigger = $('[data-map-load]', map);
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      var frame = doc.createElement('iframe');
      frame.src = map.dataset.map;
      frame.title = 'Карта: Атом, Магнитогорск, проспект Карла Маркса, 56';
      frame.loading = 'lazy';
      frame.setAttribute('allowfullscreen', '');
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      map.appendChild(frame);
      var placeholder = $('.map__placeholder', map);
      if (placeholder) placeholder.remove();
    });
  });

  /* --- Появление секций при прокрутке ------------------------------------ */

  var revealables = $$('[data-reveal]');
  if (revealables.length) {
    if (!('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

      revealables.forEach(function (el) { observer.observe(el); });
    }
  }

  /* --- Прокрутка к форме по якорю ---------------------------------------- */

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = doc.getElementById(id.slice(1));
      if (!target) return;

      e.preventDefault();
      closeMenu();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      var first = target.querySelector('input, select, textarea');
      if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 500);
    });
  });
})();
