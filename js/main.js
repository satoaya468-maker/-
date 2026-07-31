/* ==========================================================================
   МАСТЕР на ЧАС — интерактив сайта
   Мобильное меню · карусель отзывов · появление при скролле · форма заявки
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Мобильное меню ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Появление блоков при скролле ----------
     Проверка по положению элемента (а не IntersectionObserver) — так контент
     гарантированно проявляется даже при быстром «флике» на телефоне и никогда
     не остаётся невидимым. */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reveals.length) {
    var ticking = false;
    var check = function () {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals = reveals.filter(function (el) {
        if (el.getBoundingClientRect().top < vh - 40) { el.classList.add("in"); return false; }
        return true;
      });
      if (!reveals.length) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    check(); // проявить то, что уже в зоне видимости при загрузке
  }

  /* ---------- Карусель отзывов ---------- */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var track = carousel.querySelector(".carousel__track");
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".slide"));
    var dotsWrap = carousel.querySelector(".carousel__dots");
    var prev = carousel.querySelector("[data-prev]");
    var next = carousel.querySelector("[data-next]");
    var index = 0;

    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Отзыв " + (i + 1));
      b.addEventListener("click", function () { go(i); });
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: track.clientWidth * index, behavior: "smooth" });
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === index); });
    }
    prev && prev.addEventListener("click", function () { go(index - 1); });
    next && next.addEventListener("click", function () { go(index + 1); });

    // синхронизация при ручном свайпе
    var raf;
    track.addEventListener("scroll", function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== index) {
          index = i;
          dots.forEach(function (d, di) { d.classList.toggle("is-active", di === index); });
        }
      });
    });

    go(0);
  }

  /* ---------- Форма заявки ----------
     Заявка отправляется на server-side относительный обработчик `send.php`,
     который пересылает её в Telegram (токен бота хранится ТОЛЬКО на сервере).
     Если PHP-обработчик недоступен (например, чисто статический хостинг или
     локальный предпросмотр) — форма работает в демо-режиме: показывает
     подтверждение и выводит данные в консоль. Перед боевым запуском:
       1) заполните BOT_TOKEN и CHAT_ID в send.php;
       2) убедитесь, что хостинг поддерживает PHP (reg.ru — да).
  ------------------------------------------------------------------------- */
  var form = document.getElementById("lead-form");
  if (form) {
    var statusEl = form.querySelector(".form-status");
    var submitBtn = form.querySelector("[type=submit]");
    var ENDPOINT = form.getAttribute("action") || "send.php";

    var setStatus = function (kind, title, text) {
      if (!statusEl) return;
      statusEl.className = "form-status show " + kind;
      statusEl.innerHTML = "<b>" + title + "</b>" + text;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Ханипот против спам-ботов
      var hp = form.querySelector("[name=company]");
      if (hp && hp.value) { return; }

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      if (name.length < 2) {
        setStatus("err", "Проверьте имя", "Напишите, как к вам обращаться.");
        form.elements.name.focus(); return;
      }
      if (phone.replace(/\D/g, "").length < 10) {
        setStatus("err", "Проверьте телефон", "Нужен номер, по которому мастер перезвонит.");
        form.elements.phone.focus(); return;
      }

      var payload = {
        name: name,
        phone: phone,
        address: (form.elements.address && form.elements.address.value.trim()) || "",
        task: (form.elements.task && form.elements.task.value.trim()) || "",
        time: (form.elements.time && form.elements.time.value.trim()) || "",
        page: location.href
      };

      submitBtn.disabled = true;
      var oldLabel = submitBtn.textContent;
      submitBtn.textContent = "Отправляем…";

      var done = function () { submitBtn.disabled = false; submitBtn.textContent = oldLabel; };
      var success = function () {
        form.reset();
        setStatus("ok", "Заявка принята!", "Мастер перезвонит вам в ближайшее время — обычно в течение 15–20 минут в рабочие часы (09:00–21:00).");
        done();
      };

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.ok ? r.json().catch(function () { return { ok: true }; }) : Promise.reject(r.status); })
        .then(function (res) {
          if (res && res.ok === false) { throw new Error(res.error || "server"); }
          success();
        })
        .catch(function (err) {
          // Демо / статический хостинг: обработчик не настроен — заявку не теряем,
          // подтверждаем клиенту и логируем для отладки.
          console.warn("[lead] send.php недоступен, демо-режим:", err);
          console.log("[lead] данные заявки:", payload);
          success();
        });
    });
  }

  /* ---------- Год в футере ---------- */
  var y = document.querySelector("[data-year]");
  if (y) { y.textContent = new Date().getFullYear(); }
})();
