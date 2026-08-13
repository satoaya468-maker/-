/* ==========================================================================
   Мастер Макс — фильтр отзывов и форма обратной связи (otzyvy.html)
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var bar = document.querySelector('[data-review-filter]');
    if (!bar) return;

    var buttons = bar.querySelectorAll('.filter-btn');
    var list = document.getElementById('reviews-list');
    var feedback = document.getElementById('feedback');
    var ratingField = document.getElementById('feedback-rating');
    var form = document.getElementById('feedback-form');

    function apply(value) {
      var isPublic = value === 'all' || value === '5';

      list.hidden = !isPublic;
      feedback.hidden = isPublic;

      if (!isPublic && ratingField) {
        ratingField.value = value;
      }

      Array.prototype.forEach.call(buttons, function (btn) {
        var active = btn.getAttribute('data-stars') === value;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (!isPublic) {
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        apply(btn.getAttribute('data-stars'));
      });
    });

    apply('5');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var data = new FormData(form);

        console.log('[Обратная связь директору]', {
          rating: data.get('rating'),
          name: data.get('name'),
          phone: data.get('phone'),
          date: data.get('date'),
          message: data.get('message'),
          contact: data.get('contact')
        });

        if (window.mxToast) {
          window.mxToast([
            'МАСТЕР МАКС · ОБРАЩЕНИЕ',
            'Спасибо, свяжемся с вами в течение суток',
            'Сообщение передано директору мастерской'
          ]);
        }

        form.reset();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
