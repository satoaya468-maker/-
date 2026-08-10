/* ===========================================================
   Sun Day — оценка школы, фильтр отзывов и форма обращения
   Подключается на index.html и otzyvy.html
   =========================================================== */

(function () {
  'use strict';

  var GIS_URL = 'https://2gis.ru/magnitogorsk/search/sun%20day/firm/70000001055383199/tab/reviews';

  var MODALS_HTML = [
    '<div class="modal-backdrop" data-modal="gis" role="dialog" aria-modal="true" aria-labelledby="gis-title">',
    '  <div class="modal">',
    '    <button class="modal-close" type="button" data-modal-close aria-label="Закрыть">✕</button>',
    '    <h3 id="gis-title">Спасибо, что доверяете Sun Day</h3>',
    '    <p class="modal-sub">Все наши отзывы также доступны на 2ГИС →</p>',
    '    <div class="modal-actions">',
    '      <a class="btn btn-primary" href="' + GIS_URL + '" target="_blank" rel="noopener">Перейти в 2ГИС</a>',
    '      <button class="btn btn-secondary" type="button" data-modal-close>Остаться</button>',
    '    </div>',
    '  </div>',
    '</div>',
    '<div class="modal-backdrop" data-modal="feedback" role="dialog" aria-modal="true" aria-labelledby="feedback-title">',
    '  <div class="modal">',
    '    <button class="modal-close" type="button" data-modal-close aria-label="Закрыть">✕</button>',
    '    <h3 id="feedback-title">Расскажите, что можно улучшить</h3>',
    '    <p class="modal-sub">Ваше мнение важно для нас. Директор школы лично рассмотрит обращение.</p>',
    '    <form class="modal-form" data-feedback-form novalidate>',
    '      <div class="field">',
    '        <label class="field-label" for="fb-name">Имя</label>',
    '        <input class="input" id="fb-name" name="name" type="text" autocomplete="name" placeholder="Как к вам обращаться">',
    '      </div>',
    '      <div class="field">',
    '        <label class="field-label" for="fb-phone">Телефон</label>',
    '        <input class="input" id="fb-phone" name="phone" type="tel" autocomplete="tel" placeholder="+7 900 000 00 00">',
    '      </div>',
    '      <div class="field">',
    '        <label class="field-label" for="fb-message">Что не понравилось</label>',
    '        <textarea class="textarea" id="fb-message" name="message" placeholder="Опишите ситуацию — так директору будет проще разобраться"></textarea>',
    '      </div>',
    '      <div class="field">',
    '        <label class="field-label" for="fb-contact">Как связаться</label>',
    '        <select class="select" id="fb-contact" name="contact">',
    '          <option value="WhatsApp">WhatsApp</option>',
    '          <option value="Звонок">Звонок</option>',
    '        </select>',
    '      </div>',
    '      <p class="field-error" data-form-error role="alert"></p>',
    '      <button class="btn btn-primary btn-block" type="submit">Отправить</button>',
    '      <p class="form-hint">Обращение не публикуется на сайте и не попадает в отзывы — оно уходит напрямую руководителю школы.</p>',
    '    </form>',
    '  </div>',
    '</div>'
  ].join('');

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var holder = document.createElement('div');
    holder.innerHTML = MODALS_HTML;
    while (holder.firstChild) document.body.appendChild(holder.firstChild);

    var gisModal = document.querySelector('[data-modal="gis"]');
    var feedbackModal = document.querySelector('[data-modal="feedback"]');
    var feedbackForm = document.querySelector('[data-feedback-form]');
    var lastRating = null;

    function openModal(modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      var focusable = modal.querySelector('input, button, textarea, select');
      if (focusable) setTimeout(function () { focusable.focus(); }, 120);
    }

    function closeAll() {
      gisModal.classList.remove('is-open');
      feedbackModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal-close]')) {
        e.preventDefault();
        closeAll();
        return;
      }
      if (e.target.classList && e.target.classList.contains('modal-backdrop')) closeAll();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });

    /* --- Единое правило: 5★ ведут в 2ГИС, ниже — к директору --- */
    function handleRating(rating) {
      lastRating = rating;
      if (rating === 5) {
        openModal(gisModal);
      } else {
        openModal(feedbackModal);
      }
    }

    /* --- Виджет оценки: пять звёзд --- */
    document.querySelectorAll('[data-star-rate]').forEach(function (widget) {
      var stars = Array.prototype.slice.call(widget.querySelectorAll('button'));

      function light(upTo) {
        stars.forEach(function (s, i) { s.classList.toggle('is-lit', i < upTo); });
      }

      stars.forEach(function (star, i) {
        var value = i + 1;
        star.addEventListener('mouseenter', function () { light(value); });
        star.addEventListener('focus', function () { light(value); });
        star.addEventListener('click', function () {
          light(value);
          handleRating(value);
        });
      });

      widget.addEventListener('mouseleave', function () { light(0); });
    });

    /* --- Фильтр отзывов на странице отзывов --- */
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-rating]'));
    if (buttons.length) {
      var grid = document.querySelector('[data-reviews-grid]');
      var empty = document.querySelector('[data-reviews-empty]');
      var emptyRating = document.querySelector('[data-empty-rating]');

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-rating');

          buttons.forEach(function (b) {
            var active = b === button;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });

          if (value === 'all' || value === '5') {
            if (grid) grid.hidden = false;
            if (empty) empty.hidden = true;
            if (value === '5') handleRating(5);
            return;
          }

          if (grid) grid.hidden = true;
          if (empty) empty.hidden = false;
          if (emptyRating) emptyRating.textContent = value;
          handleRating(Number(value));
        });
      });
    }

    /* --- Форма обращения --- */
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

        window.SunDay.sendLead({
          type: 'Обращение к директору' + (lastRating ? ' (' + lastRating + '★)' : ''),
          name: name.value.trim(),
          phone: phone.value.trim(),
          audience: 'Связаться: ' + contact.value,
          level: message.value.trim(),
          source: document.title
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

    /* --- Ссылки на 2ГИС --- */
    document.querySelectorAll('[data-gis-link]').forEach(function (link) {
      link.setAttribute('href', GIS_URL);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
  });
})();
