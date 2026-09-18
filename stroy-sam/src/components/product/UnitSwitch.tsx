'use client';

import type { UnitDef } from '@/lib/units';

/**
 * Переключатель единиц — тонны / кубы / мешки.
 *
 * Сделан как radiogroup, а не как select: вариантов два-три, и выбор
 * должен занимать один тап. Стрелки клавиатуры работают штатно
 * благодаря roving tabindex.
 */

interface UnitSwitchProps {
  units: UnitDef[];
  value: UnitDef;
  onChange: (unit: UnitDef) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function UnitSwitch({ units, value, onChange, label = 'Единица измерения', size = 'md' }: UnitSwitchProps) {
  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (index + dir + units.length) % units.length;
    onChange(units[next]);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`inline-flex rounded-[9px] bg-surface-sunk p-1 ${
        size === 'sm' ? 'gap-0.5' : 'gap-1'
      }`}
    >
      {units.map((u, i) => {
        const active = u.id === value.id;
        return (
          <button
            key={u.id}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(u)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`rounded-[7px] font-semibold transition-[background-color,color,box-shadow] duration-150 ${
              size === 'sm' ? 'h-8 px-2.5 text-[12.5px]' : 'h-9 px-3.5 text-[13.5px]'
            } ${
              active
                ? 'bg-surface text-ink shadow-e1'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {u.label}
          </button>
        );
      })}
    </div>
  );
}
