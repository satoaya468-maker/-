/**
 * Маскот ИИ-менеджера. Зовут Семёныч — прораб в каске, который считает
 * материалы. Улыбка и каска делают всю работу: виджет должен читаться
 * как «спроси человека», а не как «чат-бот поддержки».
 */

interface MascotProps {
  className?: string;
  /** Глаза прикрыты, улыбка шире — когда Семёныч «думает» над расчётом */
  thinking?: boolean;
}

export function Mascot({ className, thinking = false }: MascotProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Семёныч, ИИ-менеджер базы"
    >
      <defs>
        <linearGradient id="ms-helmet" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffd84d" />
          <stop offset="60%" stopColor="#ffc400" />
          <stop offset="100%" stopColor="#e0a600" />
        </linearGradient>
        <linearGradient id="ms-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6d8bd" />
          <stop offset="100%" stopColor="#e8c0a0" />
        </linearGradient>
      </defs>

      {/* Плечи в жилете */}
      <path d="M12 64 q0 -13 20 -13 q20 0 20 13 Z" fill="#2b3139" />
      <path d="M24 52 q8 8 16 0 l3 12 h-22 Z" fill="#ffc400" opacity="0.92" />
      {/* Светоотражающая полоса */}
      <path d="M22 58 h20" stroke="#f4f6f8" strokeWidth="2.4" opacity="0.85" />

      {/* Лицо */}
      <ellipse cx="32" cy="34" rx="15" ry="15.5" fill="url(#ms-face)" />
      {/* Уши */}
      <ellipse cx="17.5" cy="35" rx="2.6" ry="3.4" fill="#e8c0a0" />
      <ellipse cx="46.5" cy="35" rx="2.6" ry="3.4" fill="#e8c0a0" />

      {/* Каска */}
      <path d="M15 27 q1 -18 17 -18 q16 0 17 18 Z" fill="url(#ms-helmet)" />
      <path d="M12 27 q20 -5 40 0 q0 3 -3 3 h-34 q-3 0 -3 -3 Z" fill="#e8ae00" />
      {/* Гребень каски */}
      <path d="M32 9.4 q3 6 3 17 h-6 q0 -11 3 -17 Z" fill="#ffe27a" opacity="0.75" />

      {/* Глаза */}
      {thinking ? (
        <g stroke="#2f2a24" strokeWidth="2.2" strokeLinecap="round">
          <path d="M23.5 35.5 q3 -2.6 6 0" />
          <path d="M34.5 35.5 q3 -2.6 6 0" />
        </g>
      ) : (
        <g fill="#2f2a24">
          <circle cx="26.4" cy="35" r="2.5" />
          <circle cx="37.6" cy="35" r="2.5" />
          <circle cx="27.2" cy="34.2" r="0.9" fill="#fff" />
          <circle cx="38.4" cy="34.2" r="0.9" fill="#fff" />
        </g>
      )}

      {/* Брови — без них лицо пустое */}
      <g stroke="#6b4f35" strokeWidth="1.8" strokeLinecap="round">
        <path d="M23 30.4 q3.4 -1.6 6.6 -0.4" />
        <path d="M34.4 30 q3.2 -1.2 6.6 0.4" />
      </g>

      {/* Улыбка */}
      <path
        d="M26 41.5 q6 5.4 12 0"
        stroke="#8a4f3d"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Щёки */}
      <ellipse cx="22.5" cy="40" rx="2.6" ry="1.7" fill="#e79a86" opacity="0.5" />
      <ellipse cx="41.5" cy="40" rx="2.6" ry="1.7" fill="#e79a86" opacity="0.5" />
    </svg>
  );
}
