import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from '@phosphor-icons/react';
import { useLenis } from '@/lib/lenis';
import { navItems, site } from '@/data/site';
import { PawMark } from '@/components/ui/PawMark';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_EASE = [0.32, 0.72, 0, 1] as const;

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { scrollToSection, stop, start } = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement as HTMLElement;
      stop();
      document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => closeRef.current?.focus());
    } else {
      start();
      document.documentElement.style.overflow = '';
      restoreRef.current?.focus?.();
    }
    return () => {
      start();
      document.documentElement.style.overflow = '';
    };
  }, [open, start, stop]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (id: string) => {
    onClose();
    // Даём панели закрыться, затем скроллим.
    setTimeout(() => scrollToSection(id), 60);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            type="button"
            aria-label="Закрыть меню"
            onClick={onClose}
            className="absolute inset-0 bg-[rgb(17_17_17/0.28)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Меню"
            className="absolute inset-y-0 right-0 flex w-[min(22.5rem,100%)] flex-col bg-bg shadow-lift"
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.42, ease: DRAWER_EASE }}
          >
            <div className="flex h-[68px] items-center justify-between px-5">
              <span className="flex items-center gap-2.5">
                <PawMark className="w-6 text-sage-600" />
                <span className="font-display text-[1.25rem] font-[560]">Paw Studio</span>
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Закрыть меню"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Меню разделов" className="mt-4 px-5">
              <ul className="flex flex-col">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={reduce ? false : { opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + index * 0.045, duration: 0.4, ease: DRAWER_EASE }}
                  >
                    <button
                      type="button"
                      onClick={() => go(item.id)}
                      className="font-display w-full border-b border-line py-4 text-left text-[1.375rem] font-[540] transition-colors hover:text-sage-700"
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto space-y-4 px-5 pb-8">
              <button
                type="button"
                onClick={() => go('zapis')}
                className="btn btn-primary w-full"
              >
                Записаться
              </button>
              <div className="text-small space-y-1 text-muted">
                <p>
                  <a href={site.phoneHref} className="link-quiet font-medium text-ink">
                    {site.phone}
                  </a>
                </p>
                <p>{site.hoursLabel}</p>
                <p>
                  {site.city}, {site.address}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
