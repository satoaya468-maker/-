import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/lib/reveal';

interface SectionHeadingProps {
  title: string;
  intro?: ReactNode;
  className?: string;
  /** Тёмная секция — светлый текст. */
  onDark?: boolean;
}

/** Заголовок секции: вертикальный стек, без «бровок» и боковых колонок. */
export function SectionHeading({ title, intro, className, onDark }: SectionHeadingProps) {
  return (
    <Reveal className={cn('max-w-[40rem]', className)}>
      <h2 className={cn('heading-section', onDark ? 'text-beige-50' : 'text-ink')}>{title}</h2>
      {intro && (
        <p className={cn('text-lead mt-4', onDark ? 'text-sage-100' : 'text-muted')}>{intro}</p>
      )}
    </Reveal>
  );
}
