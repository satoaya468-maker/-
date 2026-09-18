'use client';

import { useId } from 'react';
import type { UnitDef } from '@/lib/units';
import { clampQty } from '@/lib/units';

/**
 * Ввод количества. Кнопки 44×44 — рабочая перчатка не попадает меньше.
 * Поле остаётся редактируемым: «мне надо 37 тонн» быстрее набрать,
 * чем натыкать плюсом.
 */

interface QtyStepperProps {
  value: number;
  unit: UnitDef;
  onChange: (value: number) => void;
  compact?: boolean;
}

export function QtyStepper({ value, unit, onChange, compact = false }: QtyStepperProps) {
  const id = useId();
  const h = compact ? 'h-10' : 'h-11';

  return (
    <div className={`flex items-stretch overflow-hidden rounded-[10px] border border-line-strong ${h}`}>
      <button
        type="button"
        onClick={() => onChange(clampQty(value - unit.step, unit))}
        disabled={value <= unit.min}
        aria-label={`Убавить на ${unit.step} ${unit.short}`}
        className="grid w-11 shrink-0 place-items-center text-ink transition-colors hover:bg-surface-sunk disabled:opacity-35"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <label htmlFor={id} className="sr-only">
        Количество, {unit.short}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={unit.min}
        step={unit.step}
        value={value}
        onChange={(e) => onChange(clampQty(Number(e.target.value), unit))}
        className="tnum w-full min-w-0 border-x border-line bg-surface text-center text-[15px] font-bold text-ink outline-none focus:bg-surface-sunk"
      />

      <button
        type="button"
        onClick={() => onChange(clampQty(value + unit.step, unit))}
        aria-label={`Добавить ${unit.step} ${unit.short}`}
        className="grid w-11 shrink-0 place-items-center text-ink transition-colors hover:bg-surface-sunk"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
