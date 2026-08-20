/* ГБО-АВТО — общий скрипт. Ванильный JS, без зависимостей. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Появление секций: один раз, fade + 10px ------------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* --- Мобильное меню -------------------------------------------------- */
  var menu = document.getElementById('menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.hidden = !open;
    document.body.classList.toggle('is-locked', open);
    if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
    if (open) { var f = menu.querySelector('a, button'); if (f) f.focus(); }
    else if (openBtn) openBtn.focus();
  }

  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) setMenu(false);
  });
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  /* --- Цели Яндекс.Метрики --------------------------------------------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-goal]');
    if (el) window.gboGoal(el.getAttribute('data-goal'));
  });
})();

/* Общая точка входа для целей. Работает и без подключённой Метрики. */
window.gboGoal = function (name, params) {
  var id = window.GBO_METRIKA_ID;
  if (id && typeof window.ym === 'function') window.ym(id, 'reachGoal', name, params || {});
};
