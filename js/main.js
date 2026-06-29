/* ============================================================
   Балкон для души — interactions
   nav · mobile menu · reveal · hero media · gallery lightbox
   parallax · lead form → WhatsApp/VK
   ============================================================ */
(function () {
  "use strict";

  var WA = "79823283857";           // WhatsApp / phone (digits only)
  var VK = "https://vk.com/balcondlyadushi";

  /* ---- sticky nav ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobile menu ---- */
  var burger = document.getElementById("burger");
  if (burger) {
    burger.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", document.body.classList.contains("menu-open"));
    });
    document.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });
  }

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- hero video: try to play, gracefully fall back to poster ---- */
  var heroVideo = document.getElementById("hero-video");
  if (heroVideo) {
    var killVideo = function () {
      heroVideo.style.display = "none";
    };
    heroVideo.addEventListener("error", killVideo);
    heroVideo.querySelectorAll("source").forEach(function (s) {
      s.addEventListener("error", killVideo);
    });
    var p = heroVideo.play();
    if (p && p.catch) { p.catch(function () { /* autoplay blocked — poster stays */ }); }
  }

  /* ---- broken images reveal their fallback gradient ---- */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () { img.style.opacity = "0"; });
  });

  /* ---- parallax on showcase ---- */
  var pmedia = document.getElementById("showcase-media");
  if (pmedia && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var rafLock = false;
    window.addEventListener("scroll", function () {
      if (rafLock) return;
      rafLock = true;
      requestAnimationFrame(function () {
        var r = pmedia.parentElement.getBoundingClientRect();
        var v = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        pmedia.style.transform = "translateY(" + (v * 9).toFixed(2) + "%)";
        rafLock = false;
      });
    }, { passive: true });
  }

  /* ---- gallery lightbox ---- */
  var box = document.getElementById("lightbox");
  if (box) {
    var bImg = box.querySelector("img");
    var works = Array.prototype.slice.call(document.querySelectorAll(".work[data-full]"));
    var idx = 0;
    var show = function (i) {
      idx = (i + works.length) % works.length;
      bImg.src = works[idx].getAttribute("data-full");
      bImg.alt = works[idx].getAttribute("data-alt") || "Работа компании Балкон для души";
    };
    var open = function (i) { show(i); box.classList.add("is-open"); document.body.style.overflow = "hidden"; };
    var close = function () { box.classList.remove("is-open"); document.body.style.overflow = ""; };
    works.forEach(function (w, i) {
      w.addEventListener("click", function () { open(i); });
    });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__nav--prev").addEventListener("click", function () { show(idx - 1); });
    box.querySelector(".lightbox__nav--next").addEventListener("click", function () { show(idx + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }

  /* ---- lead form → WhatsApp ---- */
  var form = document.getElementById("lead-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("[name=name]").value || "").trim();
      var phone = (form.querySelector("[name=phone]").value || "").trim();
      var note = (form.querySelector("[name=note]").value || "").trim();
      var text =
        "Здравствуйте! Хочу рассчитать балкон.%0A" +
        "Имя: " + encodeURIComponent(name || "—") + "%0A" +
        "Телефон: " + encodeURIComponent(phone || "—") +
        (note ? "%0AЗадача: " + encodeURIComponent(note) : "");
      window.open("https://wa.me/" + WA + "?text=" + text, "_blank", "noopener");
      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.textContent = "Открываем чат…"; setTimeout(function () { btn.textContent = "Отправить заявку"; }, 2500); }
    });
  }

  /* ---- footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
