/* СПЕКТР — интерактив: шапка, меню, hero-видео, reveal-анимации */
(function () {
  'use strict';

  var head = document.querySelector('[data-header]');
  var burger = document.querySelector('[data-burger]');
  var menu = document.getElementById('menu');

  /* --- шапка: фон после прокрутки --- */
  function onScroll() {
    if (!head) return;
    head.classList.toggle('is-solid', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- мобильное меню --- */
  if (burger && menu) {
    var closeMenu = function () {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-locked');
    };
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-locked', open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* --- hero-видео: мобильный файл на узких экранах, пауза при reduced-motion --- */
  var video = document.querySelector('[data-hero-video]');
  if (video) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      var mobileSrc = video.getAttribute('data-src-mobile');
      if (mobileSrc && window.matchMedia('(max-width: 700px)').matches) {
        video.src = mobileSrc;
      }
      var tryPlay = video.play();
      if (tryPlay && tryPlay.catch) tryPlay.catch(function () { /* остаётся постер */ });
    }
  }

  /* --- появление блоков --- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }
})();
