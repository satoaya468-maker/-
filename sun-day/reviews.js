/* ===========================================================
   Sun Day — фильтр отзывов и форма обратной связи (otzyvy.html)
   =========================================================== */

(function () {
  'use strict';

  var GIS_URL = 'https://2gis.ru/magnitogorsk/search/sun%20day/firm/70000001055383199/tab/reviews';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-rating]'));
    if (!buttons.length) return;

    var grid = document.querySelector('[data-reviews-grid]');
    var empty = document.querySelector('[data-reviews-empty]');
    var emptyRating = document.querySelector('[data-empty-rating]');

    var gisModal = document.querySelector('[data-modal="gis"]');
    var feedbackModal = document.querySelector('[data-modal="feedback"]');
    var feedbackForm = document.querySelector('[data-feedback-form]');

    function openModal(modal) {
      if (!modal) return;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      var focusable = modal.querySelector('input, button, textarea, select');
      if (focusable) setTimeout(function () { focusable.focus(); }, 120);
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function closeAll() {
      closeModal(gisModal);
      closeModal(feedbackModal);
    }

    /* Закрытие модалок: крестик, кнопка «Остаться», фон, Escape */
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal-close]')) {
        e.preventDefault();
        closeAll();
        return;
      }
      if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
        closeAll();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });

    /* Переключение фильтра */
    function setActive(button) {
      buttons.forEach(function (b) {
        var active = b === button;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function showReviews(show, rating) {
      if (!grid || !empty) return;
      grid.hidden = !show;
      empty.hidden = show;
      if (!show && emptyRating) emptyRating.textContent = rating;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var rating = button.getAttribute('data-rating');
        setActive(button);

        if (rating === 'all' || rating === '5') {
          showReviews(true);
          if (rating === '5') openModal(gisModal);
          return;
        }

        // 4★ и ниже — обращение уходит директору, а не в публичные отзывы
        showReviews(false, rating);
        openModal(feedbackModal);
      });
    });

    /* Форма обратной связи */
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var name = feedbackForm.querySelector('[name="name"]');
        var phone = feedbackForm.querySelector('[name="phone"]');
        var message = feedbackForm.querySelector('[name="message"]');
        var contact = feedbackForm.querySelector('[name="contact"]');
        var error = feedbackForm.querySelector('[data-form-error]');
        var button = feedbackForm.querySelector('button[type="submit"]');

        if (!name.value.trim()) {
          error.textContent = 'Пожалуйста, укажите имя.';
          name.focus();
          return;
        }
        if (!window.SunDay.isPhone(phone.value)) {
          error.textContent = 'Проверьте номер телефона — нужно не меньше 10 цифр.';
          phone.focus();
          return;
        }
        if (!message.value.trim()) {
          error.textContent = 'Напишите пару слов — так директор сможет разобраться.';
          message.focus();
          return;
        }
        error.textContent = '';

        var label = button.textContent;
        button.disabled = true;
        button.textContent = 'Отправляем…';

        var active = document.querySelector('[data-rating].is-active');

        window.SunDay.sendLead({
          type: 'Обращение к директору (' + (active ? active.getAttribute('data-rating') + '★' : '—') + ')',
          name: name.value.trim(),
          phone: phone.value.trim(),
          audience: 'Связаться: ' + contact.value,
          level: message.value.trim(),
          source: 'Отзывы — форма обратной связи'
        });

        setTimeout(function () {
          button.disabled = false;
          button.textContent = label;
          feedbackForm.reset();
          closeAll();
          window.SunDay.toast({
            kicker: 'SUN DAY · ОБРАЩЕНИЕ',
            title: 'Спасибо, мы свяжемся с вами в течение суток',
            sub: 'Обращение получил директор школы · публиковаться оно не будет',
            duration: 7000
          });
        }, 700);
      });
    }

    /* Переходы в 2ГИС */
    document.querySelectorAll('[data-gis-link]').forEach(function (link) {
      link.setAttribute('href', GIS_URL);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
  });
})();
