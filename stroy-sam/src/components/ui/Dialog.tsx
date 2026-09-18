'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Модалка на нативном <dialog>: фокус-ловушка, Esc и верхний слой
 * достаются от платформы, а не имитируются — и её не обрежет
 * ни один overflow:hidden у родителя.
 */

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Подпись под заголовком — контекст, ради которого модалку открыли */
  subtitle?: ReactNode;
  children: ReactNode;
  /** На мобильном шторка снизу читается естественнее окна по центру */
  sheetOnMobile?: boolean;
}

export function Dialog({ open, onClose, title, subtitle, children, sheetOnMobile = true }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // Фон не должен уезжать под модалкой
      document.body.style.overflow = 'hidden';
    } else if (!open && el.open) {
      el.close();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dlg-title"
      onClick={(e) => {
        // Клик мимо карточки закрывает — попадание считаем по самому <dialog>
        if (e.target === ref.current) onClose();
      }}
      className={`z-modal w-full bg-transparent p-0 backdrop:bg-graphite-950/70 backdrop:backdrop-blur-[2px] ${
        sheetOnMobile
          ? 'mb-0 mt-auto max-w-[520px] sm:my-auto'
          : 'my-auto max-w-[520px]'
      }`}
    >
      <div
        className={`relative w-full bg-surface shadow-e4 ${
          sheetOnMobile ? 'rounded-t-2xl sm:rounded-2xl' : 'rounded-2xl'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id="dlg-title" className="text-[17px] font-bold leading-tight text-ink">
              {title}
            </h2>
            {subtitle && <div className="mt-1 text-[13px] text-ink-muted">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunk hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </dialog>
  );
}
