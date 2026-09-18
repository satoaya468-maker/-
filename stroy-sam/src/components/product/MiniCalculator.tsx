'use client';

import { useMemo, useState } from 'react';
import { BULK_DENSITY, slabVolume, volumeToTons, withCompaction } from '@/lib/units';
import { formatQty } from '@/lib/format';

/**
 * Калькулятор внутри карточки: размеры засыпки → тонны.
 *
 * Прораб знает площадь и толщину подушки, а не вес. Здесь он вводит
 * то, что у него в голове, и получает количество, которое сразу
 * подставляется в заказ.
 */

interface MiniCalculatorProps {
  densityKey: string;
  /** Подставить посчитанный тоннаж в поле количества карточки */
  onApply: (tons: number) => void;
}

export function MiniCalculator({ densityKey, onApply }: MiniCalculatorProps) {
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(6);
  const [thickness, setThickness] = useState(20);
  const [compaction, setCompaction] = useState(true);

  const density = BULK_DENSITY[densityKey]?.density ?? 1.4;

  const result = useMemo(() => {
    const volume = slabVolume(length, width, thickness);
    const raw = volumeToTons(volume, density);
    const tons = compaction ? withCompaction(raw, 20) : raw;
    return { volume, tons };
  }, [length, width, thickness, density, compaction]);

  const fields: Array<{ label: string; value: number; set: (n: number) => void; suffix: string; step: number }> = [
    { label: 'Длина', value: length, set: setLength, suffix: 'м', step: 0.5 },
    { label: 'Ширина', value: width, set: setWidth, suffix: 'м', step: 0.5 },
    { label: 'Толщина', value: thickness, set: setThickness, suffix: 'см', step: 5 },
  ];

  return (
    <div className="rounded-[10px] bg-surface-sunk p-3">
      <div className="grid grid-cols-3 gap-2">
        {fields.map((f) => (
          <label key={f.label} className="block">
            <span className="mb-1 block text-[11.5px] font-semibold text-ink-muted">
              {f.label}, {f.suffix}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={f.step}
              value={f.value}
              onChange={(e) => f.set(Math.max(0, Number(e.target.value)))}
              className="tnum h-10 w-full rounded-lg border border-line-strong bg-surface px-2 text-center text-[15px] font-bold text-ink outline-none focus:border-graphite-950"
            />
          </label>
        ))}
      </div>

      <label className="mt-2.5 flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={compaction}
          onChange={(e) => setCompaction(e.target.checked)}
          className="h-4 w-4 accent-hv-deep"
        />
        <span className="text-[12.5px] text-ink-muted">
          Запас на уплотнение +20 % — иначе после виброплиты будет недосып
        </span>
      </label>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
        <div className="tnum text-[13px] text-ink-muted">
          {formatQty(result.volume, 1)} м³ ·{' '}
          <strong className="text-[15px] font-bold text-ink">{formatQty(result.tons, 1)} т</strong>
        </div>
        <button
          type="button"
          onClick={() => onApply(Number(result.tons.toFixed(1)))}
          className="h-9 shrink-0 rounded-[8px] bg-graphite-950 px-3.5 text-[13px] font-bold text-white transition-colors hover:bg-graphite-800"
        >
          Подставить в заказ
        </button>
      </div>
    </div>
  );
}
