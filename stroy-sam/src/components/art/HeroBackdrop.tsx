/**
 * Фон главного экрана: база на рассвете.
 *
 * Слои от дальнего к ближнему — небо, комбинатский силуэт, краны,
 * ангар, конусы отсыпки, самосвал под погрузкой. Каждый следующий слой
 * темнее и контрастнее предыдущего: воздушная перспектива держит глубину
 * без единой фотографии.
 */

export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 760"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role="img"
      aria-label="Отгрузка щебня на базе «Строй Сам» на Западном шоссе ранним утром"
    >
      <defs>
        <linearGradient id="hb-sky" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#14161a" />
          <stop offset="48%" stopColor="#1b1f25" />
          <stop offset="100%" stopColor="#2a2f37" />
        </linearGradient>

        {/* Рассвет над комбинатом — единственный тёплый источник в кадре */}
        <radialGradient id="hb-dawn" cx="0.74" cy="0.82" r="0.62">
          <stop offset="0%" stopColor="#ffc400" stopOpacity="0.34" />
          <stop offset="42%" stopColor="#c98a24" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#14161a" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="hb-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e343d" />
          <stop offset="100%" stopColor="#232830" />
        </linearGradient>
        <linearGradient id="hb-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232830" />
          <stop offset="100%" stopColor="#1a1e24" />
        </linearGradient>
        <linearGradient id="hb-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#171a1f" />
          <stop offset="100%" stopColor="#101216" />
        </linearGradient>
        <linearGradient id="hb-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14171b" />
          <stop offset="100%" stopColor="#0c0e11" />
        </linearGradient>

        <filter id="hb-haze" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="7" />
        </filter>

        <filter id="hb-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="4" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.09" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width="1600" height="760" fill="url(#hb-sky)" />
      <rect width="1600" height="760" fill="url(#hb-dawn)" />

      {/* Дальний план: труба и градирни комбината, размыты дымкой */}
      <g fill="url(#hb-far)" opacity="0.5" filter="url(#hb-haze)">
        <path d="M980 420 h26 l10 -196 h-16 l-8 -58 h-14 Z" />
        <path d="M1064 420 h22 l8 -160 h-12 l-6 -42 h-10 Z" />
        <path d="M1150 420 q14 -78 46 -78 q32 0 46 78 Z" />
        <path d="M1258 420 q12 -62 38 -62 q26 0 38 62 Z" />
        <rect x="1330" y="330" width="150" height="90" />
        <rect x="1352" y="296" width="12" height="36" />
        <rect x="1418" y="288" width="12" height="44" />
      </g>

      {/* Дым из трубы — вертикаль, которая оживляет силуэт */}
      <g fill="#6b737f" opacity="0.14" filter="url(#hb-haze)">
        <ellipse cx="1000" cy="180" rx="54" ry="30" />
        <ellipse cx="1040" cy="132" rx="72" ry="36" />
        <ellipse cx="1096" cy="92" rx="94" ry="42" />
      </g>

      {/* Средний план: башенные краны */}
      <g stroke="#3a414b" strokeWidth="4" fill="none" opacity="0.85">
        <path d="M250 430 V150" />
        <path d="M150 158 H430" />
        <path d="M250 150 L210 190 M250 150 L290 190" />
        <path d="M356 158 V206" />
        <path d="M180 158 L250 116 L330 158" />
      </g>
      <g stroke="#3a414b" strokeWidth="3" fill="none" opacity="0.6">
        <path d="M640 430 V214" />
        <path d="M566 220 H752" />
        <path d="M712 220 V252" />
        <path d="M586 220 L640 190 L700 220" />
      </g>

      {/* Ангар базы */}
      <g fill="url(#hb-mid)">
        <path d="M60 430 V300 h360 v130 Z" />
        <path d="M46 302 L240 236 L434 302 Z" />
      </g>
      <g fill="#ffc400" opacity="0.5">
        {/* Освещённые ворота — единственное живое окно в ангаре */}
        <rect x="150" y="352" width="54" height="78" rx="2" />
      </g>
      <g stroke="#454d58" strokeWidth="2" opacity="0.5">
        <path d="M100 300 V430 M160 300 V430 M220 300 V430 M280 300 V430 M340 300 V430 M400 300 V430" />
      </g>

      {/* Конусы отсыпки — то, за чем сюда и приезжают */}
      <g>
        <path d="M470 430 L588 316 Q616 296 644 316 L762 430 Z" fill="#2a2f36" />
        <path d="M588 316 Q616 296 644 316 L616 330 Z" fill="#3b424b" opacity="0.7" />
        <path d="M742 430 L846 334 Q870 316 894 334 L998 430 Z" fill="#242930" />
        <path d="M980 430 L1064 352 Q1084 338 1104 352 L1188 430 Z" fill="#1f242a" />
      </g>

      <rect y="428" width="1600" height="14" fill="#0f1114" opacity="0.7" />

      {/* Ближний план: самосвал под погрузкой */}
      <g fill="url(#hb-near)">
        <path d="M1140 700 V556 h268 l18 46 v98 Z" />
        <path d="M1408 602 h108 l52 54 v44 h-160 Z" />
      </g>
      <g fill="#ffc400" opacity="0.85">
        {/* Габаритные огни и проблесковый — техника в работе */}
        <rect x="1556" y="640" width="14" height="18" rx="3" />
        <rect x="1470" y="592" width="26" height="8" rx="4" />
      </g>
      <g fill="#0a0c0e">
        <circle cx="1214" cy="704" r="46" />
        <circle cx="1348" cy="704" r="46" />
        <circle cx="1512" cy="704" r="42" />
      </g>
      <g fill="#2b3139">
        <circle cx="1214" cy="704" r="20" />
        <circle cx="1348" cy="704" r="20" />
        <circle cx="1512" cy="704" r="18" />
      </g>
      {/* Борт кузова с насыпанным щебнем */}
      <path d="M1152 560 q60 -22 132 -22 q72 0 116 22 Z" fill="#3d444d" />

      <rect y="690" width="1600" height="70" fill="url(#hb-ground)" />

      {/* Зерно поверх всего — кадр перестаёт выглядеть вектором */}
      <rect width="1600" height="760" filter="url(#hb-grain)" opacity="0.5" />
    </svg>
  );
}
