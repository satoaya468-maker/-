import { useId, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

export interface AccordionEntry {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: readonly AccordionEntry[];
  className?: string;
}

/**
 * Аккордеон на grid-rows: высота анимируется через grid-template-rows,
 * переход прерываемый (transition, не keyframes), полная клавиатурная
 * доступность из коробки — это обычные <button>.
 */
export function Accordion({ items, className }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className={cn('border-t border-line', className)}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const buttonId = `${baseId}-q-${index}`;
        const panelId = `${baseId}-a-${index}`;
        return (
          <div key={item.question} className="border-b border-line">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-baseline justify-between gap-6 py-5 text-left transition-colors duration-150 sm:py-6"
              >
                <span
                  className={cn(
                    'heading-card transition-colors duration-200',
                    isOpen ? 'text-ink' : 'text-ink-soft',
                  )}
                >
                  {item.question}
                </span>
                <CaretDown
                  size={18}
                  weight="bold"
                  aria-hidden="true"
                  className={cn(
                    'mt-1 shrink-0 self-center text-sage-600 transition-transform duration-300 [transition-timing-function:var(--ease-out-strong)]',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-300 [transition-timing-function:var(--ease-out-strong)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="min-h-0 overflow-hidden">
                <p
                  className={cn(
                    'max-w-[62ch] pb-6 text-muted transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
