/* =========================================================
   Фисташка: интерактив лендинга
   ========================================================= */

/* Автопрокрутка карусели акций, миллисекунды. 0 выключает её совсем,
   это значение по умолчанию: баннеры листаются вручную.
   Меньше 7000 не бывает, короткие значения поднимаются до 7000:
   быстрая карусель уводит внимание и мешает дочитать слайд.
   При prefers-reduced-motion автопрокрутка не запускается вообще. */
const PROMO_AUTOPLAY_MS = 0;

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
    // .ph покажет подпись с описанием нужного кадра,
    // .hero__media просто скроет битую картинку: там ждём боевое фото
    const box = img.closest('.ph, .hero__media');
    if (box) box.classList.add('is-empty');
  }

  document.querySelectorAll('.ph img, .hero__media img').forEach(function (img) {
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
     4. Карусель акций.
         Прокрутку и свайп делает сам браузер через scroll-snap,
         скрипт лишь синхронизирует точки и двигает контейнер.
     --------------------------------------------------------- */
  (function initPromo() {
    const track = document.getElementById('promo-track');
    const dotsBox = document.getElementById('promo-dots');
    if (!track || !dotsBox) return;

    const slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;

    const status = document.getElementById('promo-status');
    const prev = document.querySelector('.promo__arrow--prev');
    const next = document.querySelector('.promo__arrow--next');
    let index = 0;

    // точки строим по числу слайдов, чтобы разметку не правили дважды
    const dots = slides.map(function (slide, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'promo__dot';
      dot.setAttribute('aria-label', 'Акция ' + (i + 1) + ' из ' + slides.length);
      dot.addEventListener('click', function () { goTo(i); });
      dotsBox.appendChild(dot);
      return dot;
    });

    function render() {
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
      if (status) status.textContent = 'Акция ' + (index + 1) + ' из ' + slides.length;
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.scrollTo({
        left: index * track.clientWidth,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      render();
    }

    if (prev) prev.addEventListener('click', function () { stopAuto(); goTo(index - 1); });
    if (next) next.addEventListener('click', function () { stopAuto(); goTo(index + 1); });

    track.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      stopAuto();
      goTo(e.key === 'ArrowLeft' ? index - 1 : index + 1);
    });

    // свайп и прокрутка колесом меняют позицию мимо goTo, поэтому
    // активный слайд определяем наблюдением, а не слушателем скролла
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const i = slides.indexOf(entry.target);
          if (i !== -1 && i !== index) { index = i; render(); }
        });
      }, { root: track, threshold: 0.6 });
      slides.forEach(function (slide) { spy.observe(slide); });
    }

    // при смене ширины окна пиксельная позиция слайда уезжает
    let resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        track.scrollTo({ left: index * track.clientWidth, behavior: 'auto' });
      }, 150);
    });

    /* ---- автопрокрутка ----
       Выключена, пока PROMO_AUTOPLAY_MS равен нулю. Ниже 7 секунд не
       опускается, останавливается при наведении, фокусе, ручном
       переключении и когда секция ушла с экрана. */
    let timer = null;
    const delay = Math.max(7000, PROMO_AUTOPLAY_MS);
    const autoAllowed = PROMO_AUTOPLAY_MS > 0 && !prefersReducedMotion;

    function startAuto() {
      if (!autoAllowed || timer) return;
      timer = window.setInterval(function () { goTo(index + 1); }, delay);
    }
    function pauseAuto() {
      window.clearInterval(timer);
      timer = null;
    }
    function stopAuto() {
      pauseAuto();
    }

    if (autoAllowed) {
      const promo = document.getElementById('promo');
      promo.addEventListener('pointerenter', pauseAuto);
      promo.addEventListener('pointerleave', startAuto);
      promo.addEventListener('focusin', pauseAuto);
      promo.addEventListener('focusout', startAuto);
      document.addEventListener('visibilitychange', function () {
        document.hidden ? pauseAuto() : startAuto();
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries[0].isIntersecting ? startAuto() : pauseAuto();
        }, { threshold: 0.3 }).observe(promo);
      } else {
        startAuto();
      }
    }

    render();
  })();

})();
