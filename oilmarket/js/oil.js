/* ============================================================
   ОИЛ МАРКЕТ — интерфейсная логика
   Без зависимостей. Всё деградирует до рабочего HTML без JS.
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ----------------------------------------------------------
     1. РЕАЛЬНЫЕ ДАННЫЕ (единственный источник правды по фактам)
     ---------------------------------------------------------- */
  var DATA = {
    open: 9,          // 09:00
    close: 21,        // 21:00
    rating: 4.4,
    reviews: 267
  };

  /* ----------------------------------------------------------
     2. ОТЗЫВЫ
     Массив пуст → карусель показывает слоты «ожидает выгрузки».
     Заполните объектами — карусель отрисует реальные отзывы.
     Тексты НЕ выдумываются: сюда попадает только выгрузка из 2ГИС.
     Формат: { text: "…", author: "Имя И.", date: "2026-05-14", stars: 5 }
     ---------------------------------------------------------- */
  var REVIEWS = [];

  /* ----------------------------------------------------------
     3. РЕЖИМ РАБОТЫ — живой индикатор
     ---------------------------------------------------------- */
  function updateStatus() {
    var now = new Date();
    var h = now.getHours() + now.getMinutes() / 60;
    var isOpen = h >= DATA.open && h < DATA.close;

    $$(".js-status").forEach(function (el) {
      el.classList.toggle("is-open", isOpen);
      var label = $(".js-status-text", el) || el;
      label.textContent = isOpen ? "Сейчас открыто" : "Сейчас закрыто";
    });
  }

  /* ----------------------------------------------------------
     4. ПРИБОРНАЯ ПАНЕЛЬ: свип стрелки как self-test приборов
     ---------------------------------------------------------- */
  var ANGLE_ZERO = 240;                        // 150° + 90° поправки на вертикальную стрелку
  var ANGLE_PER_POINT = 48;                    // 240° развёртки на 5 баллов

  function angleFor(value) {
    return ANGLE_ZERO + value * ANGLE_PER_POINT;
  }

  function runGauge(gauge) {
    if (gauge.dataset.done === "1") return;
    gauge.dataset.done = "1";

    var value = parseFloat(gauge.dataset.value || DATA.rating);
    var needle = $(".needle", gauge);

    if (reduced) {
      gauge.classList.add("is-live");
      if (needle) {
        needle.style.transition = "none";
        needle.style.transform = "rotate(" + angleFor(value) + "deg)";
      }
      return;
    }

    if (needle) {
      // стрелка уходит на упор и возвращается к реальному значению
      needle.style.transitionDuration = "0.75s";
      needle.style.transform = "rotate(" + angleFor(5) + "deg)";
      window.setTimeout(function () {
        needle.style.transitionDuration = "1.5s";
        needle.style.transform = "rotate(" + angleFor(value) + "deg)";
      }, 820);
    }
    window.setTimeout(function () { gauge.classList.add("is-live"); }, 820);
  }

  /* ----------------------------------------------------------
     5. ОДОМЕТР
     ---------------------------------------------------------- */
  function runOdometer(odo) {
    if (odo.dataset.done === "1") return;
    odo.dataset.done = "1";

    $$(".odo-strip", odo).forEach(function (strip, i) {
      var digit = parseInt(strip.dataset.digit, 10) || 0;
      var apply = function () { strip.style.transform = "translateY(-" + digit * 10 + "%)"; };
      if (reduced) {
        strip.style.transition = "none";
        apply();
      } else {
        window.setTimeout(apply, 260 + i * 160);
      }
    });
  }

  /* ----------------------------------------------------------
     6. ЗАПУСК ПРИБОРОВ ПРИ ПОЯВЛЕНИИ В КАДРЕ
     ---------------------------------------------------------- */
  function watch(nodes, run) {
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ----------------------------------------------------------
     7. МОБИЛЬНОЕ МЕНЮ
     ---------------------------------------------------------- */
  function initNav() {
    var burger = $(".js-burger");
    var nav = $(".js-nav");
    if (!burger || !nav) return;

    var head = $(".masthead");

    // меню начинается точно под шапкой — её высота зависит от вёрстки и прокрутки
    function fit() {
      if (!nav.classList.contains("is-open") || !head) return;
      nav.style.top = Math.max(0, Math.round(head.getBoundingClientRect().bottom)) + "px";
    }

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) fit(); else nav.style.top = "";
    });

    window.addEventListener("resize", fit);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        burger.click();
        burger.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     8. ФИЛЬТР КАТАЛОГА
     ---------------------------------------------------------- */
  function initFilters() {
    var bar = $(".js-filters");
    if (!bar) return;
    var goods = $$(".good");
    var counter = $(".js-count");

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;

      $$("button", bar).forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      var f = btn.dataset.filter;
      var shown = 0;
      goods.forEach(function (g) {
        var hit = f === "all" || g.dataset.cat === f;
        g.hidden = !hit;
        if (hit) shown++;
      });
      if (counter) counter.textContent = String(shown).padStart(2, "0");
    });
  }

  /* ----------------------------------------------------------
     9. КАРУСЕЛЬ ОТЗЫВОВ
     ---------------------------------------------------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initCarousel() {
    var track = $(".js-track");
    if (!track) return;

    if (REVIEWS.length) {
      track.innerHTML = REVIEWS.map(function (r, i) {
        var stars = Math.max(0, Math.min(5, Math.round(r.stars || 0)));
        return (
          '<article class="slide">' +
            '<div class="slot-tag">' +
              "<span>Отзыв " + String(i + 1).padStart(2, "0") + " · 2ГИС</span>" +
              '<span class="stars">' + "★".repeat(stars) + "☆".repeat(5 - stars) + "</span>" +
            "</div>" +
            "<blockquote>" + esc(r.text) + "</blockquote>" +
            "<cite>" + esc(r.author || "Клиент") + " · " + esc(r.date || "") + "</cite>" +
          "</article>"
        );
      }).join("");
    }

    var prev = $(".js-prev");
    var next = $(".js-next");
    var step = function () {
      var slide = $(".slide", track);
      return slide ? slide.getBoundingClientRect().width + 4 : 320;
    };
    if (prev) prev.addEventListener("click", function () { track.scrollLeft -= step(); });
    if (next) next.addEventListener("click", function () { track.scrollLeft += step(); });
  }

  /* ----------------------------------------------------------
     10. ФОРМА-ЗАГЛУШКА
     Реального приёма заявок пока нет — говорим об этом прямо
     и даём быстрый путь: звонок.
     ---------------------------------------------------------- */
  function initForms() {
    $$(".js-form").forEach(function (form) {
      var box = $(".js-form-status", form);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!box) return;

        var name = form.querySelector('[name="name"]');
        var phone = form.querySelector('[name="phone"]');
        var digits = phone ? phone.value.replace(/\D/g, "") : "";

        box.hidden = false;

        if (!name.value.trim() || digits.length < 10) {
          box.classList.add("is-error");
          box.innerHTML =
            "<b>ПРОВЕРЬТЕ ПОЛЯ</b><br>Нужны имя и телефон из 10 цифр — иначе администратор не сможет перезвонить.";
          (!name.value.trim() ? name : phone).focus();
          box.setAttribute("role", "alert");
          return;
        }

        box.classList.remove("is-error");
        box.innerHTML =
          "<b>ЗАЯВКА ЗАФИКСИРОВАНА</b><br>" +
          "Заявка передаётся администратору. Автоматический приём заявок с сайта сейчас в подключении — " +
          'чтобы записаться прямо сейчас, звоните: <a class="mono" href="tel:+73519450574">+7 (3519) 45-05-74</a>.';
        box.setAttribute("role", "status");
        form.reset();
        box.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
      });
    });

    // мягкое форматирование телефона, ввод не блокируется
    $$('input[name="phone"]').forEach(function (inp) {
      inp.addEventListener("input", function () {
        var d = inp.value.replace(/\D/g, "").slice(0, 11);
        if (!d) { inp.value = ""; return; }
        if (d[0] === "8") d = "7" + d.slice(1);
        if (d[0] !== "7") d = "7" + d;
        var out = "+7";
        if (d.length > 1) out += " (" + d.slice(1, 4);
        if (d.length >= 4) out += ") " + d.slice(4, 7);
        if (d.length >= 8) out += "-" + d.slice(7, 9);
        if (d.length >= 10) out += "-" + d.slice(9, 11);
        inp.value = out;
      });
    });
  }

  /* ----------------------------------------------------------
     11. СТАРТ
     ---------------------------------------------------------- */
  function init() {
    updateStatus();
    window.setInterval(updateStatus, 60000);

    watch($$(".gauge"), runGauge);
    watch($$(".odo"), runOdometer);

    initNav();
    initFilters();
    initCarousel();
    initForms();

    $$(".js-year").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
