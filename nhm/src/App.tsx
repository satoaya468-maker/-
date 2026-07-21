import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, usePresence } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bone,
  Dna,
  Gem,
  Leaf,
  Plus,
} from "lucide-react";

const chaptersData = [
  {
    name: "Age of Dinosaurs",
    image:
      "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624247/01_udnber.png",
  },
  {
    name: "Fossils of Ancient Life",
    image:
      "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624374/02_pmvxxl.png",
  },
  {
    name: "Reptiles of the Mesozoic",
    image:
      "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624236/03_hcp3jc.png",
  },
  {
    name: "Marine Fossil Gallery",
    image:
      "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624256/04_get63z.png",
  },
  {
    name: "Prehistoric Giants",
    image:
      "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624251/05_kz1tyu.png",
  },
];

const VIDEO_URL =
  "https://res.cloudinary.com/dsdxaxkiz/video/upload/v1779624998/magnific_use-img-2-as-the-exact-ba_Piu3X0W42C_wnrc8f.mp4";

const PTERODACTYL_URL =
  "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779625001/ChatGPT_Image_May_23_2026_12_24_44_PM_1_lv1dne.png";

const navLinks = ["Visit", "Exhibitions", "Discover", "Learn", "About"];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function SandTransitionImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const filterId = useRef(
    `sand-${Math.random().toString(36).slice(2, 10)}`
  ).current;

  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const offsetRef = useRef<SVGFEOffsetElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const colorMatrixRef = useRef<SVGFEColorMatrixElement>(null);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // entering: quartic ease-out toward 0 distortion; exiting: cubic ramp toward full distortion
      const progress = isPresent ? 1 - (1 - Math.pow(1 - t, 4)) : Math.pow(t, 3);

      if (displacementRef.current) {
        displacementRef.current.setAttribute("scale", `${progress * 150}`);
      }
      if (offsetRef.current) {
        offsetRef.current.setAttribute(
          "dy",
          `${progress * (isPresent ? -80 : 120)}`
        );
        offsetRef.current.setAttribute(
          "dx",
          `${progress * (isPresent ? -30 : 30)}`
        );
      }
      if (blurRef.current) {
        blurRef.current.setAttribute("stdDeviation", `${progress * 6}`);
      }
      if (colorMatrixRef.current) {
        const opacity = Math.max(0, 1 - progress * 1.2);
        colorMatrixRef.current.setAttribute(
          "values",
          `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0`
        );
      }

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!isPresent) {
        safeToRemove?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPresent, safeToRemove]);

  return (
    <>
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.8"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="noise"
              scale="150"
              result="displaced"
            />
            <feOffset ref={offsetRef} in="displaced" dx="0" dy="0" result="offset" />
            <feGaussianBlur ref={blurRef} in="offset" stdDeviation="0" result="blurred" />
            <feColorMatrix
              ref={colorMatrixRef}
              in="blurred"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 0"
            />
          </filter>
        </defs>
      </svg>
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className={className}
        style={{ filter: `url(#${filterId})` }}
      />
    </>
  );
}

function NavLinksList({ className = "" }: { className?: string }) {
  return (
    <ul className={className}>
      {navLinks.map((link) => (
        <li key={link}>
          <a
            href="#"
            className="text-gray-800 hover:text-black hover:underline transition-colors"
          >
            {link}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [showVideo, setShowVideo] = useState(false);
  const [activeChapter, setActiveChapter] = useState(2);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowVideo(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setActiveChapter((prev) => (prev + 1) % chaptersData.length),
      3500
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#fcfcfc] text-[#111] font-sans">
      {/* ============ SECTION 1: HERO ============ */}
      <section className="relative w-full min-h-screen flex flex-col overflow-hidden">
        {/* 1D. Background video */}
        <AnimatePresence>
          {showVideo && (
            <motion.div
              key="hero-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                src={VIDEO_URL}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1A. Header */}
        <motion.header
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
          className="relative pt-6 px-6 md:px-16 z-20"
        >
          <motion.h1
            variants={{
              initial: { scale: 1.03 },
              animate: {
                scale: 1,
                transition: { staggerChildren: 0.06, delayChildren: 0.1 },
              },
            }}
            className="w-full overflow-hidden"
          >
            <span className="sr-only">NHM — Natural History Museum</span>
            <svg
              viewBox="0 0 840 100"
              className="w-full fill-[#111]"
              aria-hidden="true"
            >
              {/* N */}
              <g transform="translate(0,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="200,0 214,0 214,100 200,100" />
                <motion.polygon variants={letterBlock} points="0,0 33,0 214,100 181,100" />
              </g>
              {/* H */}
              <g transform="translate(280,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="200,0 214,0 214,100 200,100" />
                <motion.polygon variants={letterBlock} points="14,43 200,43 200,57 14,57" />
              </g>
              {/* M */}
              <g transform="translate(560,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="266,0 280,0 280,100 266,100" />
                <motion.polygon variants={letterBlock} points="0,0 26,0 153,100 127,100" />
                <motion.polygon variants={letterBlock} points="254,0 280,0 153,100 127,100" />
              </g>
            </svg>
          </motion.h1>

          {/* 1B. Sub-nav bar */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-between items-start mt-8 text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase"
          >
            <div className="w-[15%]">
              <p>Natura</p>
              <p>History</p>
              <p>Museum</p>
            </div>

            <div className="hidden md:flex w-[5%] justify-center">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            <div className="flex-1 md:flex-none md:w-[30%] text-gray-800 leading-relaxed font-mono">
              <span className="hidden md:block">
                <p>Exploring the story of life on</p>
                <p>earth through science,</p>
                <p>discovery and wonder.</p>
              </span>
              <span className="block md:hidden">
                <p>Exploring the story</p>
                <p>of life on earth</p>
                <p>through science,</p>
                <p>discovery and wonder.</p>
              </span>
            </div>

            <div className="hidden md:flex w-[5%] justify-center">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            <NavLinksList className="hidden md:block w-[15%] space-y-1" />

            {/* Hamburger */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="group relative z-60 flex flex-col items-end gap-[6px] pt-1"
            >
              <span
                className={`h-[1.5px] bg-black transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "w-8 rotate-45 translate-y-[4px]"
                    : "w-8 group-hover:w-6"
                }`}
              />
              <span
                className={`h-[1.5px] bg-black transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "w-8 -rotate-45 -translate-y-[3.5px]"
                    : "w-8 group-hover:w-10"
                }`}
              />
            </button>
          </motion.div>

          {/* 1C. Mobile menu overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="md:hidden absolute left-0 right-0 top-full bg-[#fcfcfc] border-b border-gray-200 shadow-xl px-6 py-10 z-50"
              >
                <NavLinksList className="space-y-6 text-sm font-mono tracking-[0.2em] uppercase" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* 1E / 1F. Sidebars */}
        <div className="relative z-10 flex justify-between">
          {/* Left sidebar */}
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.15, delayChildren: 0.6 }}
            className="px-10 md:px-16 mt-20 sm:mt-28 md:mt-32 w-[320px] flex flex-col gap-6"
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 text-xs font-mono"
            >
              <span>01</span>
              <span className="w-16 h-[1.5px] bg-black/20" />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-[3.5rem] md:text-[5rem] font-normal tracking-tight leading-[1]"
            >
              TIMELESS
              <br />
              WONDERS
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-[13px] md:text-[14px] text-gray-700 w-[240px] leading-[1.6]"
            >
              Step into the natural world and discover the stories written
              millions of years ago.
            </motion.p>

            <motion.div variants={fadeUp}>
              <button
                type="button"
                className="group relative overflow-hidden bg-[#1a1a1a] px-6 py-3.5 border border-[#1a1a1a] rounded-md shadow-sm transition-all duration-300 hover:-translate-y-[0.5px] hover:shadow-[3px_3px_0px_rgba(17,17,17,0.5)] active:translate-y-0 active:shadow-sm"
              >
                <span className="absolute inset-0 bg-[#fcfcfc] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-white group-hover:fill-[#111] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-y-1"
                    aria-hidden="true"
                  >
                    <path d="M12 2C9 6 7 9 7 12c0 3 2 5 5 5s5-2 5-5c0-3-2-6-5-10z" />
                    <path d="M12 17v5" />
                    <path d="M12 8c-1.5 1.5-2.5 3-2.5 4.5" fill="none" />
                    <path d="M12 8c1.5 1.5 2.5 3 2.5 4.5" fill="none" />
                  </svg>
                  <span className="text-[15px] font-medium text-white group-hover:text-[#111] transition-colors duration-500">
                    Explore Now
                  </span>
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right sidebar */}
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.15, delayChildren: 0.9 }}
            className="hidden md:flex flex-col gap-8 w-[200px] mt-12 md:mt-20 px-6 md:pr-16"
          >
            <motion.div variants={fadeUp}>
              <h3 className="text-[10px] font-bold font-mono tracking-widest uppercase mb-2">
                Tyrannosaurus Rex
              </h3>
              <p className="text-[12px] text-gray-600 leading-[1.6]">
                Late Cretaceous period
                <br />
                68-66 million years ago
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500">
                  Length
                </p>
                <p className="text-[13px] font-medium">12.3 m</p>
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500">
                  Height
                </p>
                <p className="text-[13px] font-medium">4.0 m</p>
              </div>
            </motion.div>

            <motion.button
              variants={fadeUp}
              type="button"
              className="group flex items-center gap-4"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400 transition-colors duration-300 group-hover:border-black group-hover:bg-[#111]">
                <Plus
                  size={16}
                  strokeWidth={1.5}
                  className="transition-colors duration-300 group-hover:text-white"
                />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                View Details
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* 1G. Scroll to explore */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
          className="hidden md:flex absolute bottom-10 left-[2.5rem] md:left-[4rem] items-center gap-4 z-10"
        >
          <span className="flex items-center justify-center gap-[4px] w-12 h-12 rounded-full border border-gray-300">
            <span className="w-[1px] h-[12px] bg-gray-600" />
            <span className="w-[1px] h-[12px] bg-gray-600" />
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold">
            Scroll to explore
          </span>
        </motion.div>
      </section>

      {/* ============ SECTION 2: EXPLORE OUR WORLD ============ */}
      <section className="relative w-full min-h-[75vh] md:min-h-screen bg-[#fcfcfc] flex flex-col items-center pt-24 md:pt-32 pb-0 z-20">
        {/* 2A. Section label */}
        <p className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] mb-12">
          <span className="text-gray-500">[ 02 ]</span>{" "}
          <span className="text-gray-900 font-bold uppercase">
            Explore Our World
          </span>
        </p>

        {/* 2B. Main heading */}
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[2.2rem] md:text-[3.5rem] lg:text-[4.2rem] leading-[1.1] font-medium tracking-tight text-[#111] max-w-[1000px] text-center px-6 mb-12"
        >
          Unearth the stories of our planet's past{" "}
          <br className="hidden md:block" />
          through fossils, minerals, and ancient wonders.
        </motion.h2>

        {/* 2C. Action pills */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-24 px-6"
        >
          {[
            { icon: Bone, label: "Dinosaurs" },
            { icon: Dna, label: "Ancient Life" },
            { icon: Gem, label: "Minerals" },
            { icon: Leaf, label: "Fossils" },
            { icon: BookOpen, label: "Learn More" },
          ].map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-[11px] font-medium uppercase tracking-wider bg-white/50 backdrop-blur-sm text-gray-800 transition-colors duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* 2D. Spacer for pterodactyl overlap */}
        <div className="min-h-[220px] md:min-h-[450px] w-full" />

        {/* 2E. Bottom text */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 md:px-16 pb-8 md:pb-12 pointer-events-none">
          <p className="hidden md:block text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            WE DON'T JUST TELL STORIES.
          </p>
          <p className="hidden md:block text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            PALEONTOLOGY (C) 2026
          </p>
        </div>
      </section>

      {/* ============ SECTION 3: ANCIENT COLLECTION ============ */}
      <section className="relative w-full bg-[#0a0a0a] text-white flex flex-col z-30">
        {/* 3A. Pterodactyl image */}
        <motion.img
          src={PTERODACTYL_URL}
          alt="Pterodactyl skeleton"
          initial={{ y: "-65%", opacity: 0 }}
          whileInView={{ y: "-78%", opacity: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[160vw] md:w-[1100px] max-w-none pointer-events-none z-0"
        />

        {/* 3B. Heading area */}
        <div className="relative z-10 px-8 md:px-16 pt-32 md:pt-48 mb-16 flex flex-col xl:flex-row justify-between gap-12">
          <h2 className="text-[1.8rem] md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem] leading-[1.15] font-medium tracking-tight text-white max-w-[900px]">
            Curated from millions of years of wonder
            <span className="inline-flex gap-2 md:gap-3 align-middle mx-2 md:mx-4 translate-y-[-4px]">
              {[Bone, Dna, Leaf].map((Icon, i) => (
                <span
                  key={i}
                  className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-600 bg-black text-gray-400 transition-colors duration-300 hover:bg-white hover:text-black hover:border-white"
                >
                  <Icon size={22} />
                </span>
              ))}
            </span>
            &amp; discovery.
          </h2>

          <div className="shrink-0">
            <p className="text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-6 leading-relaxed">
              WE DON'T JUST DISPLAY FOSSILS
              <br />
              WE SHARE EARTH'S STORY
            </p>
            <div className="flex gap-3">
              {["Educational", "Authentic", "Inspiring"].map((pill) => (
                <span
                  key={pill}
                  className="px-5 py-2 rounded-full border border-gray-600 text-[9px] font-mono tracking-widest uppercase text-gray-300 transition-colors duration-300 hover:bg-white hover:text-black hover:border-white"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-800" />

        {/* 3C. Two-column panel */}
        <div className="relative z-10 flex flex-col md:flex-row">
          {/* Left panel */}
          <div className="w-full md:w-[35%] border-b md:border-b-0 md:border-r border-gray-800 min-h-[400px] md:min-h-[500px] relative flex flex-col justify-between p-8">
            <p className="text-gray-500 text-xl tracking-[0.3em]">***</p>

            <AnimatePresence mode="wait">
              <SandTransitionImage
                key={activeChapter}
                src={chaptersData[activeChapter].image}
                alt={chaptersData[activeChapter].name}
                className="absolute inset-0 w-[80%] h-[80%] m-auto object-contain mix-blend-lighten"
              />
            </AnimatePresence>

            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#888] uppercase">
              <span className="relative h-[14px] w-[18px] overflow-hidden inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeChapter}
                    initial={{ y: 14 }}
                    animate={{ y: 0 }}
                    exit={{ y: -14 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 text-[#888]"
                  >
                    {String(activeChapter + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-[#333]">/</span>
              <span>05</span>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-full md:w-[65%]">
            <div className="flex justify-between items-center border-b border-gray-800 p-8 text-[10px] font-mono text-gray-400 tracking-widest uppercase">
              <span>Explore the past. Understand the present.</span>
              <span className="relative h-[14px] w-[80px] overflow-hidden inline-block text-right">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeChapter}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    Chapter 0{activeChapter + 1}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>

            <ul>
              {chaptersData.map((chapter, index) => {
                const isActive = index === activeChapter;
                return (
                  <li
                    key={chapter.name}
                    className="border-b border-gray-800/80"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveChapter(index)}
                      className={`w-full flex items-center justify-between px-8 py-8 text-left transition-colors duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-[#444] hover:text-[#999]"
                      }`}
                    >
                      <span className="text-2xl md:text-[2rem] font-medium tracking-tight">
                        {chapter.name}
                      </span>
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowUpRight
                              size={22}
                              strokeWidth={1}
                              className="text-gray-400"
                            />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 3D. Bottom footer */}
        <div className="h-[1px] bg-gray-800" />
        <p className="px-8 py-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase bg-[#0a0a0a]">
          DIGGING INTO OUR PLANET'S PAST
        </p>
      </section>
    </div>
  );
}
