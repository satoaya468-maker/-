'use client';

import { useMemo, useState } from 'react';
import {
  BULK_DENSITY,
  slabVolume,
  tripsFor,
  volumeToTons,
  withCompaction,
} from '@/lib/units';
import { PRODUCTS } from '@/lib/catalog';
import { TRUCKS } from '@/lib/warehouse';
import { formatPrice, formatQty, plural } from '@/lib/format';
import { PhoneField } from '@/components/ui/PhoneField';
import { Button } from '@/components/ui/Button';
import { isValidPhone } from '@/lib/phone';

/**
 * Калькулятор сметы на главной.
 *
 * Считает то, на чём чаще всего ошибаются: сколько тонн сыпучки нужно
 * на конкретную площадку и во сколько рейсов это уедет. Результат
 * сразу превращается в заявку — расчёт без кнопки заказа не конвертирует.
 */

const PRESETS = [
  { id: 'parking', title: 'Стоянка', length: 12, width: 6, thickness: 20, material: 'gravel-20-40' },
  { id: 'foundation', title: 'Подушка под фундамент', length: 10, width: 8, thickness: 30, material: 'sand-quarry' },
  { id: 'track', title: 'Подъездная дорога', length: 40, width: 3.5, thickness: 25, material: 'gravel-20-40' },
  { id: 'backfill', title: 'Обратная засыпка', length: 20, width: 2, thickness: 60, material: 'pgs' },
] as const;

export function VolumeCalculator() {
  const [material, setMaterial] = useState<string>('gravel-20-40');
  const [length, setLength] = useState(12);
  const [width, setWidth] = useState(6);
  const [thickness, setThickness] = useState(20);
  const [compaction, setCompaction] = useState(true);
  const [truck, setTruck] = useState<number>(20);

  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const density = BULK_DENSITY[material]?.density ?? 1.4;
  const product = PRODUCTS.find((p) => p.densityKey === material);

  const calc = useMemo(() => {
    const volume = slabVolume(length, width, thickness);
    const raw = volumeToTons(volume, density);
    const tons = compaction ? withCompaction(raw, 20) : raw;
    const trips = tripsFor(tons, truck);

    let price = 0;
    if (product) {
      const bulk = product.bulkFrom && tons >= product.bulkFrom.qty ? product.bulkFrom.price : product.basePrice;
      price = Math.round(bulk * tons);
    }
    return { volume, tons, trips, price };
  }, [length, width, thickness, density, compaction, truck, product]);

  function applyPreset(p: (typeof PRESETS)[number]) {
    setLength(p.length);
    setWidth(p.width);
    setThickness(p.thickness);
    setMaterial(p.material);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError('Проверьте номер — нужно 10 цифр после +7');
      return;
    }
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          source: 'calculator',
          comment: `${BULK_DENSITY[material]?.label}: ${length}×${width} м, ${thickness} см → ${calc.tons.toFixed(1)} т`,
          context: { material, length, width, thickness, tons: calc.tons, trips: calc.trips },
        }),
      });
      if (!res.ok) throw new Error('bad status');
      setState('done');
    } catch {
      setState('error');
      setError('Не отправилось. Позвоните: +7 (3519) 55-04-04');
    }
  }

  const dims: Array<{ label: string; value: number; set: (n: number) => void; suffix: string; step: number }> = [
    { label: 'Длина', value: length, set: setLength, suffix: 'м', step: 0.5 },
    { label: 'Ширина', value: width, set: setWidth, suffix: 'м', step: 0.5 },
    { label: 'Толщина слоя', value: thickness, set: setThickness, suffix: 'см', step: 5 },
  ];

  return (
    <section id="calculator" className="scroll-mt-24 bg-graphite-950 py-14 text-white md:py-20">
      <div className="on-dark shell">
        <div className="max-w-[60ch]">
          <h2 className="section-title text-white">Калькулятор сыпучки</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-white/70 md:text-[16px]">
            Введите размеры площадки — посчитаем объём, вес и сколько рейсов
            понадобится. Расчёт по насыпной плотности материала, с запасом
            на уплотнение.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          {/* min-w-0 обязателен: у grid-элемента min-width по умолчанию auto,
              а <select> получает min-content ширину по самой длинной опции
              («Щебень гранитный 20–40 — 1.38 т/м³») и распирает всю секцию
              за край экрана на узких устройствах. */}
          <div className="min-w-0 rounded-2xl bg-white/[0.06] p-5 md:p-6">
            {/* min-w-0 снимает UA-стиль min-inline-size: min-content,
                из-за которого fieldset не сжимается даже вокруг
                прокручиваемого ряда и растягивает страницу. */}
            <fieldset className="min-w-0">
              <legend className="mb-2.5 text-[13px] font-semibold text-white/70">
                Типовая задача
              </legend>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="h-9 shrink-0 rounded-[8px] border border-white/20 px-3 text-[13px] font-medium text-white/85 transition-colors hover:border-hv hover:text-hv"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5">
              <label htmlFor="calc-material" className="mb-1.5 block text-[13px] font-semibold text-white/70">
                Материал
              </label>
              <select
                id="calc-material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="h-12 w-full min-w-0 truncate rounded-[10px] border border-white/20 bg-graphite-900 px-3.5 text-[15px] font-semibold text-white outline-none focus:border-hv"
              >
                {Object.entries(BULK_DENSITY).map(([key, v]) => (
                  <option key={key} value={key}>
                    {v.label} — {v.density} т/м³
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {dims.map((d) => (
                <div key={d.label}>
                  <label
                    htmlFor={`calc-${d.label}`}
                    className="mb-1.5 block text-[13px] font-semibold text-white/70"
                  >
                    {d.label}, {d.suffix}
                  </label>
                  <input
                    id={`calc-${d.label}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={d.step}
                    value={d.value}
                    onChange={(e) => d.set(Math.max(0, Number(e.target.value)))}
                    className="tnum h-12 w-full rounded-[10px] border border-white/20 bg-graphite-900 px-2 text-center text-[17px] font-bold text-white outline-none focus:border-hv"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={compaction}
                  onChange={(e) => setCompaction(e.target.checked)}
                  className="h-4 w-4 accent-hv"
                />
                <span className="text-[13.5px] text-white/75">Запас на уплотнение +20 %</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[13.5px] text-white/60">Машина</span>
                <div className="flex gap-1 rounded-[9px] bg-white/10 p-1">
                  {TRUCKS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTruck(t.capacity)}
                      aria-pressed={truck === t.capacity}
                      className={`h-8 rounded-[7px] px-2.5 text-[12.5px] font-semibold transition-colors ${
                        truck === t.capacity ? 'bg-hv text-hv-ink' : 'text-white/75 hover:text-white'
                      }`}
                    >
                      {t.capacity} т
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Результат + заявка */}
          <div className="min-w-0 rounded-2xl bg-surface p-5 text-ink shadow-e4 md:p-6">
            <div aria-live="polite">
              <p className="text-[13px] font-semibold text-ink-muted">Нужно материала</p>
              <p className="tnum mt-1 flex items-baseline gap-2">
                <span className="display text-[44px] leading-none text-ink">
                  {formatQty(calc.tons, 1)}
                </span>
                <span className="text-[16px] font-bold text-ink-muted">тонн</span>
              </p>

              <dl className="tnum mt-4 space-y-2 border-t border-line pt-4 text-[14px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Объём</dt>
                  <dd className="font-bold text-ink">{formatQty(calc.volume, 1)} м³</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Рейсов по {truck} т</dt>
                  <dd className="font-bold text-ink">
                    {calc.trips} {plural(calc.trips, ['рейс', 'рейса', 'рейсов'])}
                  </dd>
                </div>
                {calc.price > 0 && (
                  <div className="flex justify-between gap-3 border-t border-line pt-2">
                    <dt className="text-ink-muted">Материал</dt>
                    <dd className="text-[17px] font-bold text-ink">{formatPrice(calc.price)}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
                Без доставки. Точную стоимость с подачей машины назовёт диспетчер —
                она зависит от адреса и времени.
              </p>
            </div>

            {state === 'done' ? (
              <div className="mt-5 rounded-[10px] bg-stock/10 p-4 text-center">
                <p className="text-[15px] font-bold text-ink">Расчёт отправлен</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  Диспетчер перезвонит за 15 минут и подтвердит объём и цену
                  с доставкой.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-5 border-t border-line pt-5">
                <PhoneField
                  value={phone}
                  onChange={setPhone}
                  compact
                  label="Отправить расчёт менеджеру"
                />
                {error && state !== 'sending' && (
                  <p role="alert" className="mt-2 text-[13px] font-medium text-danger">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={state === 'sending'} className="mt-3 w-full">
                  {state === 'sending' ? 'Отправляем…' : 'Получить цену с доставкой'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
