/* ============================================================
   Спектр — scroll-cinematic engine
   Rendering modes, best first:
     1. frame scrub  — webp sequence drawn on canvas (assets/frames/hero)
     2. video scrub  — <video>.currentTime driven by scroll
     3. static       — poster / gradient fallback
   Plus: nav state, reveal-on-scroll, parallax showcase.
   ============================================================ */

(() => {
  "use strict";

  const FRAME_COUNT = 120;
  const FRAME_PATH = i => `assets/frames/hero/frame_${String(i).padStart(3, "0")}.webp`;
  const VIDEO_SOURCES = [
    "assets/video/hero.mp4",
    "https://d8j0ntlcm91z4.cloudfront.net/user_3EzgRoleznDLKIBHlEgNJvYcZmT/hf_20260611_195052_5467234a-1807-41f5-bf9d-ff1c7e40bdd4.mp4",
  ];
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
    const layer = showcase.firstElementChild;
    const parallax = () => {
      const rect = showcase.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      layer.style.transform = `translateY(${(progress - 0.5) * -14}%)`;
    };
    window.addEventListener("scroll", () => requestAnimationFrame(parallax), { passive: true });
    parallax();
  }

  /* ---------- Cinematic scrub ---------- */
  const cinema = document.getElementById("cinema");
  const canvas = document.getElementById("cinema-canvas");
  const fallback = document.getElementById("cinema-fallback");
  const chapters = Array.from(document.querySelectorAll(".cinema__chapter"));
  if (!cinema || !canvas) return;

  const getProgress = () => {
    const rect = cinema.getBoundingClientRect();
    const runway = cinema.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -rect.top / runway));
  };

  const updateChapters = progress => {
    chapters.forEach((el, i) => {
      const { from, to } = CHAPTERS[i] || {};
      el.classList.toggle("is-active", progress >= from && progress < to);
    });
  };

  // chapters always follow scroll, whatever the rendering mode
  window.addEventListener("scroll", () => updateChapters(getProgress()), { passive: true });
  updateChapters(0);

  if (reducedMotion) {
    canvas.remove();
    return;
  }

  /* --- mode 1: canvas frame scrub --- */
  const startFrameMode = () => {
    const ctx = canvas.getContext("2d");
    const frames = new Array(FRAME_COUNT);
    let currentIndex = -1;
    let revealed = false;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      currentIndex = -1;
      render();
    };

    const drawFrame = img => {
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const nearestLoaded = index => {
      if (frames[index] && frames[index].complete && frames[index].naturalWidth) return index;
      for (let d = 1; d < FRAME_COUNT; d++) {
        const lo = index - d, hi = index + d;
        if (lo >= 0 && frames[lo] && frames[lo].complete && frames[lo].naturalWidth) return lo;
        if (hi < FRAME_COUNT && frames[hi] && frames[hi].complete && frames[hi].naturalWidth) return hi;
      }
      return -1;
    };

    const render = () => {
      const progress = getProgress();
      const target = Math.round(progress * (FRAME_COUNT - 1));
      const index = nearestLoaded(target);
      if (index === -1 || index === currentIndex) return;
      currentIndex = index;
      drawFrame(frames[index]);
      if (!revealed) {
        revealed = true;
        fallback.classList.add("is-hidden");
      }
    };

    const loadFrame = i => new Promise(resolve => {
      if (frames[i]) return resolve();
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => resolve();
      img.src = FRAME_PATH(i + 1);
      frames[i] = img;
    });

    // coarse pass first so scrubbing works early, then fill in the rest
    (async () => {
      const coarse = [];
      for (let i = 0; i < FRAME_COUNT; i += 8) coarse.push(loadFrame(i));
      coarse.push(loadFrame(FRAME_COUNT - 1));
      await Promise.all(coarse);
      render();
      const rest = [];
      for (let i = 0; i < FRAME_COUNT; i++) rest.push(loadFrame(i));
      await Promise.all(rest);
      render();
    })();

    window.addEventListener("scroll", () => requestAnimationFrame(render), { passive: true });
    window.addEventListener("resize", sizeCanvas);
    sizeCanvas();
  };

  /* --- mode 2: <video> currentTime scrub --- */
  const startVideoMode = sourceIndex => {
    if (sourceIndex >= VIDEO_SOURCES.length) return; // mode 3: keep static fallback
    canvas.remove();
    const video = document.createElement("video");
    video.className = "cinema__video";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = VIDEO_SOURCES[sourceIndex];

    video.addEventListener("error", () => {
      video.remove();
      startVideoMode(sourceIndex + 1);
    });

    video.addEventListener("loadeddata", () => {
      fallback.classList.add("is-hidden");
      let target = 0;
      const tick = () => {
        target = getProgress() * Math.max(0, video.duration - 0.05);
        // ease toward the target time for smooth scrubbing
        const diff = target - video.currentTime;
        if (Math.abs(diff) > 0.01) video.currentTime += diff * 0.25;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    cinema.querySelector(".cinema__sticky").insertBefore(video, fallback);
  };

  // pick a mode: probe the first frame of the webp sequence
  const probe = new Image();
  probe.onload = startFrameMode;
  probe.onerror = () => startVideoMode(0);
  probe.src = FRAME_PATH(1);
})();
