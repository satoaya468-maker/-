import { cn } from '@/lib/cn';

/** Фирменный знак — лапа. Рисуется currentColor, размер задаётся классом. */
export function PawMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn('fill-current', className)}
      focusable="false"
    >
      <ellipse cx="15.5" cy="26" rx="6.4" ry="7.6" transform="rotate(-18 15.5 26)" />
      <ellipse cx="32" cy="20.5" rx="6.6" ry="7.8" />
      <ellipse cx="48.5" cy="26" rx="6.4" ry="7.6" transform="rotate(18 48.5 26)" />
      <path d="M32 32.5c7.8 0 14.6 5.4 14.6 12.2 0 4.6-3.5 7.3-7.6 7.3-2.7 0-4.9-1.1-7-1.1s-4.3 1.1-7 1.1c-4.1 0-7.6-2.7-7.6-7.3 0-6.8 6.8-12.2 14.6-12.2z" />
    </svg>
  );
}
