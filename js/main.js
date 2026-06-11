/* ============================================================
   Спектр — scroll-cinematic engine
   - canvas frame scrubbing driven by scroll position
   - chapter captions tied to scrub progress
   - nav state, reveal-on-scroll, parallax showcase
   ============================================================ */

(() => {
  "use strict";

  const FRAME_COUNT = 120;
  const FRAME_PATH = i => `assets/frames/hero/frame_${String(i).padStart(3, "0")}.webp`;
  // progress ranges for the three caption chapters (hero + 2)
  const CHAPTERS = [
    { from: 0.0, to: 0.34 },
    { from: 0.4, to: 0.66 },
    { from: 0.72, to: 1.01 },
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav ---------- */
  const nav = document.getElementById("nav");
  const onNavScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  window.addEventListener("scroll", onNavScroll, { passive: true });
  onNavScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealObserver.unobserve(e.target);
      }
    }),
    { threshold: 0.18 }
  );
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  /* ---------- Showcase parallax ---------- */
  const showcase = document.getElementById("showcase-media");
  if (showcase && !reducedMotion) {
    const img = showcase.querySelector("img");
    const parallax = () => {
      const rect = showcase.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      img.style.transform = `translateY(${(progress - 0.5) * -14}%)`;
    };
    window.addEventListener("scroll", () => requestAnimationFrame(parallax), { passive: true });
    parallax();
  }

  /* ---------- Cinematic frame scrub ---------- */
  const cinema = document.getElementById("cinema");
  const canvas = document.getElementById("cinema-canvas");
  const fallback = document.getElementById("cinema-fallback");
  const chapters = Array.from(document.querySelectorAll(".cinema__chapter"));
  if (!cinema || !canvas) return;

  const updateChapters = progress => {
    chapters.forEach((el, i) => {
      const { from, to } = CHAPTERS[i] || {};
      el.classList.toggle("is-active", progress >= from && progress < to);
    });
  };

  if (reducedMotion) {
    canvas.remove();
    updateChapters(0);
    return;
  }

  const ctx = canvas.getContext("2d");
  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentIndex = -1;
  let canvasReady = false;

  const sizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    currentIndex = -1; // force redraw at new size
    render();
  };

  // draw image with cover fit
  const drawFrame = img => {
    const cw = canvas.width, ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  // nearest loaded frame to the requested index
  const nearestLoaded = index => {
    if (frames[index] && frames[index].complete) return index;
    for (let d = 1; d < FRAME_COUNT; d++) {
      const lo = index - d, hi = index + d;
      if (lo >= 0 && frames[lo] && frames[lo].complete) return lo;
      if (hi < FRAME_COUNT && frames[hi] && frames[hi].complete) return hi;
    }
    return -1;
  };

  const getProgress = () => {
    const rect = cinema.getBoundingClientRect();
    const runway = cinema.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -rect.top / runway));
  };

  const render = () => {
    const progress = getProgress();
    updateChapters(progress);
    const target = Math.round(progress * (FRAME_COUNT - 1));
    const index = nearestLoaded(target);
    if (index === -1 || index === currentIndex) return;
    currentIndex = index;
    drawFrame(frames[index]);
    if (!canvasReady) {
      canvasReady = true;
      fallback.classList.add("is-hidden");
    }
  };

  const loadFrame = i => new Promise(resolve => {
    if (frames[i]) return resolve();
    const img = new Image();
    img.decoding = "async";
    img.onload = () => { loadedCount++; resolve(); };
    img.onerror = () => resolve();
    img.src = FRAME_PATH(i + 1);
    frames[i] = img;
  });

  // progressive preload: coarse pass first so scrubbing works early,
  // then fill in the remaining frames
  const preload = async () => {
    const coarse = [];
    for (let i = 0; i < FRAME_COUNT; i += 8) coarse.push(loadFrame(i));
    coarse.push(loadFrame(FRAME_COUNT - 1));
    await Promise.all(coarse);
    render();
    const rest = [];
    for (let i = 0; i < FRAME_COUNT; i++) rest.push(loadFrame(i));
    await Promise.all(rest);
    render();
  };

  window.addEventListener("scroll", () => requestAnimationFrame(render), { passive: true });
  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();
  preload();
})();
