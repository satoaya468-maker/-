/**
 * Иллюстрации материалов.
 *
 * Фотостоки недоступны из среды сборки, поэтому материал рисуется вектором:
 * щебень — угловатыми гранями, песок — мелким зерном через feTurbulence,
 * цемент — штабелем мешков. Размещение зёрен детерминировано (seeded PRNG),
 * иначе сервер и клиент нарисуют разные картинки и React сорвёт гидратацию.
 */

export type ArtKind =
  | 'gravel'
  | 'sand'
  | 'screening'
  | 'pgs'
  | 'cement'
  | 'block'
  | 'rebar'
  | 'insulation';

/*
 * preserveAspectRatio="slice" на каждой сцене — обязателен: карточка шире,
 * чем viewBox 200×130, и при значении по умолчанию иллюстрация вписывается
 * с пустыми полями по бокам вместо того, чтобы заполнить плашку.
 */

/** mulberry32 — короткий и стабильный, этого достаточно для раскладки зёрен */
function seeded(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface ArtProps {
  kind: ArtKind;
  /** Уникальный ключ — разводит id градиентов и раскладку зёрен */
  seed: string;
  className?: string;
}

/** Угловатый камень: 5–7 граней, как у дроблёного гранита */
function stone(rand: () => number, cx: number, cy: number, r: number): string {
  const points: string[] = [];
  const faces = 5 + Math.floor(rand() * 3);
  for (let i = 0; i < faces; i += 1) {
    const angle = (i / faces) * Math.PI * 2 + rand() * 0.45;
    const radius = r * (0.62 + rand() * 0.38);
    points.push(
      `${(cx + Math.cos(angle) * radius).toFixed(1)},${(cy + Math.sin(angle) * radius * 0.82).toFixed(1)}`,
    );
  }
  return points.join(' ');
}

function GravelArt({ seed, tint }: { seed: string; tint: 'granite' | 'screening' | 'pgs' }) {
  const rand = seeded(hashString(seed));
  const id = `gr-${hashString(seed).toString(36)}`;

  const palette =
    tint === 'granite'
      ? ['#8d8f95', '#a2a4ab', '#767a82', '#b3b5bb', '#63666d']
      : tint === 'screening'
        ? ['#9a958c', '#aca69b', '#857f76', '#bcb6ab', '#6f6a62']
        : ['#a39683', '#b5a894', '#8e8271', '#c3b7a5', '#776c5d'];

  const stones = Array.from({ length: 46 }, (_, i) => {
    // Куча: плотнее к низу и к центру — так лежит отсыпанный конус
    const t = i / 46;
    const cx = 20 + rand() * 160;
    const spread = 1 - Math.abs(cx - 100) / 110;
    const cy = 112 - rand() * 52 * spread;
    const r = 7 + rand() * 13 * (0.55 + t * 0.6);
    return { pts: stone(rand, cx, cy, r), fill: palette[Math.floor(rand() * palette.length)], r };
  });

  return (
    <svg viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9eaec" />
          <stop offset="100%" stopColor="#cfd2d6" />
        </linearGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed={hashString(seed) % 100} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.16" />
          </feComponentTransfer>
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>

      <rect width="200" height="130" fill={`url(#${id}-bg)`} />

      {/* Конус кучи — общий силуэт под россыпью */}
      <path d="M8 130 L72 58 Q100 40 128 58 L192 130 Z" fill={palette[2]} opacity="0.55" />

      {stones.map((s, i) => (
        <polygon key={i} points={s.pts} fill={s.fill} stroke="#5c5f66" strokeOpacity="0.28" strokeWidth="0.6" />
      ))}

      {/* Блик сверху — куча читается объёмной, а не плоской россыпью */}
      <path d="M62 66 Q100 44 138 66 L128 74 Q100 58 72 74 Z" fill="#ffffff" opacity="0.22" />

      <rect width="200" height="130" filter={`url(#${id}-grain)`} fill="#000" opacity="0.5" />
    </svg>
  );
}

function SandArt({ seed }: { seed: string }) {
  const id = `sd-${hashString(seed).toString(36)}`;
  return (
    <svg viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ece5d7" />
          <stop offset="100%" stopColor="#d6cbb4" />
        </linearGradient>
        <linearGradient id={`${id}-heap`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#e3d3ae" />
          <stop offset="55%" stopColor="#cbb68b" />
          <stop offset="100%" stopColor="#a98f63" />
        </linearGradient>
        <filter id={`${id}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="4" seed={hashString(seed) % 100} />
          <feColorMatrix type="saturate" values="0.15" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>

      <rect width="200" height="130" fill={`url(#${id}-bg)`} />
      {/* Две кучи: свежая отсыпка всегда ложится гребнями */}
      <path d="M0 130 L48 74 Q66 62 84 74 L134 130 Z" fill={`url(#${id}-heap)`} />
      <path d="M78 130 L134 62 Q156 48 176 64 L200 130 Z" fill={`url(#${id}-heap)`} opacity="0.94" />
      {/* Гребень — линия схода песка */}
      <path d="M134 62 L176 64" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" fill="none" />
      <path d="M48 74 L84 74" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
      <path d="M155 56 L186 104" stroke="#8a7350" strokeOpacity="0.25" strokeWidth="1" fill="none" />
      <rect width="200" height="130" filter={`url(#${id}-grain)`} fill="#6b5a3c" opacity="0.55" />
    </svg>
  );
}

function CementArt({ seed }: { seed: string }) {
  const id = `cm-${hashString(seed).toString(36)}`;
  // Штабель мешков: три ряда со смещением, как кладут на поддон
  const rows = [
    { y: 92, count: 3, w: 54 },
    { y: 66, count: 3, w: 54 },
    { y: 40, count: 2, w: 54 },
  ];
  return (
    <svg viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e7e9ec" />
          <stop offset="100%" stopColor="#ccd0d6" />
        </linearGradient>
        <linearGradient id={`${id}-bag`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#f2ede2" />
          <stop offset="60%" stopColor="#ddd6c6" />
          <stop offset="100%" stopColor="#bfb7a4" />
        </linearGradient>
        <filter id={`${id}-paper`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.12" />
          </feComponentTransfer>
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>

      <rect width="200" height="130" fill={`url(#${id}-bg)`} />

      {rows.map((row, ri) => {
        const totalW = row.count * row.w + (row.count - 1) * 4;
        const startX = (200 - totalW) / 2;
        return row.count > 0
          ? Array.from({ length: row.count }, (_, i) => {
              const x = startX + i * (row.w + 4);
              return (
                <g key={`${ri}-${i}`}>
                  <rect x={x} y={row.y} width={row.w} height={24} rx="4" fill={`url(#${id}-bag)`} />
                  <rect x={x} y={row.y} width={row.w} height={24} rx="4" fill="none" stroke="#9a9484" strokeWidth="0.8" />
                  {/* Клапаны мешка */}
                  <rect x={x + 3} y={row.y + 3} width={row.w - 6} height="3" rx="1.5" fill="#a8a190" opacity="0.5" />
                  {/* Полоса маркировки — узнаваемый цементный мешок */}
                  <rect x={x + 8} y={row.y + 11} width={row.w - 16} height="6" rx="1" fill="#5d6570" opacity="0.8" />
                  <rect x={x + 11} y={row.y + 13} width={row.w - 30} height="2" rx="1" fill="#f2ede2" opacity="0.85" />
                </g>
              );
            })
          : null;
      })}

      {/* Поддон */}
      <g fill="#8a6b4a">
        <rect x="16" y="116" width="168" height="6" rx="1" />
        <rect x="16" y="123" width="168" height="5" rx="1" opacity="0.8" />
        <rect x="26" y="116" width="10" height="12" />
        <rect x="95" y="116" width="10" height="12" />
        <rect x="164" y="116" width="10" height="12" />
      </g>

      <rect width="200" height="130" filter={`url(#${id}-paper)`} fill="#000" opacity="0.4" />
    </svg>
  );
}

function BlockArt({ seed }: { seed: string }) {
  const id = `bl-${hashString(seed).toString(36)}`;
  const rand = seeded(hashString(seed));
  // Поры газоблока — то, по чему его узнают на глаз
  const pores = Array.from({ length: 70 }, () => ({
    cx: 10 + rand() * 180,
    cy: 24 + rand() * 96,
    r: 0.8 + rand() * 1.9,
  }));

  return (
    <svg viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8eaed" />
          <stop offset="100%" stopColor="#ccd1d7" />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef0f0" />
          <stop offset="100%" stopColor="#d3d7d7" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f7f8f8" />
          <stop offset="100%" stopColor="#dfe3e3" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="8" y="22" width="184" height="100" />
        </clipPath>
      </defs>

      <rect width="200" height="130" fill={`url(#${id}-bg)`} />

      {/* Кладка в перевязку: два ряда со смещением */}
      <g>
        <path d="M18 52 L18 86 L96 100 L96 66 Z" fill={`url(#${id}-face)`} />
        <path d="M18 52 L42 38 L120 52 L96 66 Z" fill={`url(#${id}-top)`} />
        <path d="M96 66 L120 52 L120 86 L96 100 Z" fill="#b9bfbf" />

        <path d="M104 62 L104 96 L182 110 L182 76 Z" fill={`url(#${id}-face)`} opacity="0.96" />
        <path d="M104 62 L128 48 L206 62 L182 76 Z" fill={`url(#${id}-top)`} opacity="0.96" />

        <path d="M60 28 L60 56 L138 70 L138 42 Z" fill={`url(#${id}-face)`} opacity="0.92" />
        <path d="M60 28 L84 16 L162 30 L138 42 Z" fill={`url(#${id}-top)`} opacity="0.92" />
        <path d="M138 42 L162 30 L162 58 L138 70 Z" fill="#b9bfbf" opacity="0.92" />
      </g>

      <g clipPath={`url(#${id}-clip)`} fill="#9aa1a1" opacity="0.5">
        {pores.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
    </svg>
  );
}

function RebarArt({ seed }: { seed: string }) {
  const id = `rb-${hashString(seed).toString(36)}`;
  return (
    <svg viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6e8eb" />
          <stop offset="100%" stopColor="#c9ced4" />
        </linearGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fa6ae" />
          <stop offset="40%" stopColor="#6e767f" />
          <stop offset="100%" stopColor="#4a5158" />
        </linearGradient>
      </defs>
      <rect width="200" height="130" fill={`url(#${id}-bg)`} />
      {/* Пачка прутка в перспективе + характерный винтовой профиль А500С */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const x = 24 + col * 32 + row * 6;
          const y = 100 - row * 19;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width="26" height="15" rx="7.5" fill={`url(#${id}-steel)`} />
              {[0, 1, 2].map((n) => (
                <path
                  key={n}
                  d={`M${x + 5 + n * 7} ${y + 1} l4 13`}
                  stroke="#2f353b"
                  strokeOpacity="0.45"
                  strokeWidth="1.4"
                />
              ))}
              <rect x={x} y={y} width="26" height="4" rx="2" fill="#ffffff" opacity="0.2" />
            </g>
          );
        }),
      )}
    </svg>
  );
}

function InsulationArt({ seed }: { seed: string }) {
  const id = `in-${hashString(seed).toString(36)}`;
  return (
    <svg viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9ebee" />
          <stop offset="100%" stopColor="#cfd4da" />
        </linearGradient>
        <filter id={`${id}-fib`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.8" numOctaves="3" seed="11" />
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
      </defs>
      <rect width="200" height="130" fill={`url(#${id}-bg)`} />
      {/* Плиты минваты стопкой, волокно даёт рваную кромку */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={22 + i * 4}
            y={96 - i * 21}
            width="156"
            height="19"
            rx="2"
            fill={i % 2 ? '#d9b45f' : '#e2c274'}
            filter={`url(#${id}-fib)`}
          />
          <rect x={22 + i * 4} y={96 - i * 21} width="156" height="4" rx="2" fill="#fff" opacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

export function MaterialArt({ kind, seed, className }: ArtProps) {
  const body = (() => {
    switch (kind) {
      case 'gravel':
        return <GravelArt seed={seed} tint="granite" />;
      case 'screening':
        return <GravelArt seed={seed} tint="screening" />;
      case 'pgs':
        return <GravelArt seed={seed} tint="pgs" />;
      case 'sand':
        return <SandArt seed={seed} />;
      case 'cement':
        return <CementArt seed={seed} />;
      case 'block':
        return <BlockArt seed={seed} />;
      case 'rebar':
        return <RebarArt seed={seed} />;
      case 'insulation':
        return <InsulationArt seed={seed} />;
      default:
        return <GravelArt seed={seed} tint="granite" />;
    }
  })();

  return <div className={className}>{body}</div>;
}
