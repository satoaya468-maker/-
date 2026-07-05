/* Автостекло24 — Магнитогорск */
(function () {
  "use strict";

  /* ---------- шапка: фон при скролле ---------- */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- мобильное меню ---------- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- появление блоков ---------- */
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealed.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    revealed.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealed.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- живая линия отзывов: бесшовный цикл ----------
     Дублируем набор карточек, пока трек не заполнит два экрана,
     затем CSS-анимация сдвигает его ровно на половину ширины. */
  document.querySelectorAll(".ticker-track").forEach(function (track) {
    var original = Array.prototype.slice.call(track.children);
    if (!original.length) return;
    var need = Math.max(window.innerWidth * 2, 2400);
    while (track.scrollWidth < need) {
      original.forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });
      if (track.children.length > 60) break;
    }
    /* итоговое количество должно быть чётным повтором набора —
       уже так, потому что добавляем только целыми наборами */
  });

  /* ---------- «сейчас открыто» (Магнитогорск, UTC+5) ---------- */
  document.querySelectorAll("[data-open-status]").forEach(function (el) {
    var now;
    try {
      now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Yekaterinburg" })
      );
    } catch (e) {
      now = new Date();
    }
    var minutes = now.getHours() * 60 + now.getMinutes();
    var isOpen = minutes >= 8 * 60 + 30 && minutes < 22 * 60;
    var dot = el.querySelector(".dot");
    var text = el.querySelector("[data-open-text]");
    if (dot) dot.classList.toggle("is-closed", !isOpen);
    if (text) {
      text.textContent = isOpen
        ? "Сейчас открыто — до 22:00"
        : "Сейчас закрыто — откроемся в 8:30";
    }
  });

  /* ---------- запасные изображения ----------
     Пока GitHub Actions не закоммитил локальные файлы (или если
     файл потерялся), картинка подгружается напрямую с CDN Pexels. */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function handle() {
      img.removeEventListener("error", handle);
      img.src = img.getAttribute("data-fallback");
    });
    if (img.complete && img.naturalWidth === 0) {
      img.src = img.getAttribute("data-fallback");
    }
  });

  /* ---------- hero-видео: постер, если файла нет ---------- */
  var heroVideo = document.querySelector(".hero-media video");
  if (heroVideo) {
    heroVideo.addEventListener("error", function () {
      heroVideo.remove();
    });
    var source = heroVideo.querySelector("source");
    if (source) {
      source.addEventListener("error", function () {
        heroVideo.remove();
      });
    }
  }
})();
