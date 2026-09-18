'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/catalog';
import type { UnitDef } from '@/lib/units';
import { convertQty, lineTotal, unitPrice } from '@/lib/units';
import { formatPrice, formatQty, formatMinutes, plural } from '@/lib/format';
import { MaterialArt } from '@/components/art/MaterialArt';
import { UnitSwitch } from './UnitSwitch';
import { QtyStepper } from './QtyStepper';
import { MiniCalculator } from './MiniCalculator';
import { useCart } from '@/store/cart';

/**
 * Карточка товара.
 *
 * Весь заказ помещается в карточку: выбрать единицу, набрать количество,
 * увидеть итог и нажать одну из двух кнопок. Переход на отдельную
 * страницу товара — лишний шаг, а заявка собирается на объекте, стоя.
 */

interface ProductCardProps {
  product: Product;
  onQuickOrder: (payload: {
    product: Product;
    qty: number;
    unit: UnitDef;
    effectiveBasePrice: number;
    bulk: boolean;
  }) => void;
}

export function ProductCard({ product, onQuickOrder }: ProductCardProps) {
  const [unit, setUnit] = useState<UnitDef>(product.units[0]);
  const [qty, setQty] = useState<number>(product.units[0].min * 5);
  const [calcOpen, setCalcOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [added, setAdded] = useState(false);
  const firstRender = useRef(true);
  const { add } = useCart();

  // Цена по объёму: порог всегда считаем в базовых единицах
  const baseQty = qty * unit.factor;
  const bulkThresholdBase = product.bulkFrom
    ? product.bulkFrom.qty * (product.units.find((u) => u.id === product.bulkFrom!.unit)?.factor ?? 1)
    : Infinity;
  const bulkActive = baseQty >= bulkThresholdBase;
  const effectiveBase = bulkActive && product.bulkFrom ? product.bulkFrom.price : product.basePrice;

  const perUnit = unitPrice(effectiveBase, unit);
  const total = lineTotal(effectiveBase, qty, unit);
  const saving = bulkActive && product.bulkFrom ? lineTotal(product.basePrice - product.bulkFrom.price, qty, unit) : 0;

  // Подсветка итога при пересчёте — глазу нужно за что зацепиться
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(t);
  }, [total]);

  function switchUnit(next: UnitDef) {
    // Держим физический объём: 10 т щебня — это те же 7,2 м³
    setQty(convertQty(qty, unit, next));
    setUnit(next);
  }

  function addToCart() {
    add({
      productId: product.id,
      sku: product.sku,
      title: product.title,
      spec: product.spec,
      basePrice: effectiveBase,
      qty,
      unit,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const stockInUnit = product.stock / unit.factor;
  const enough = stockInUnit >= qty;

  return (
    <article
      id={`product-${product.id}`}
      className="flex flex-col overflow-hidden rounded-[14px] bg-surface shadow-e2 transition-shadow duration-200 hover:shadow-e3"
    >
      <div className="relative h-[136px] shrink-0 overflow-hidden border-b border-line">
        <MaterialArt kind={product.art} seed={product.id} className="h-full w-full" />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-hv px-2 py-1 text-[11.5px] font-bold text-hv-ink">
            {product.badge}
          </span>
        )}
        <span
          className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-surface/95 px-2 py-1 text-[11.5px] font-bold ${
            enough ? 'text-stock' : 'text-danger'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${enough ? 'bg-stock' : 'bg-danger'}`} />
          {enough ? 'В наличии' : 'Под заказ'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <header>
          <h3 className="text-[17px] font-bold leading-tight text-ink">{product.title}</h3>
          <p className="mt-1 text-[13px] text-ink-muted">{product.spec}</p>
        </header>

        <div className="mt-3.5">
          <UnitSwitch units={product.units} value={unit} onChange={switchUnit} size="sm" />
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="tnum text-[22px] font-bold leading-none text-ink">
            {formatPrice(perUnit)}
          </span>
          <span className="text-[13px] font-medium text-ink-muted">за {unit.short}</span>
          {bulkActive && (
            <span className="ml-auto rounded bg-stock/10 px-1.5 py-0.5 text-[11.5px] font-bold text-stock">
              цена по объёму
            </span>
          )}
        </div>

        {product.bulkFrom && !bulkActive && (
          <p className="tnum mt-1.5 text-[12.5px] text-ink-muted">
            От {product.bulkFrom.qty}{' '}
            {product.units.find((u) => u.id === product.bulkFrom!.unit)?.short} —{' '}
            <strong className="font-bold text-ink">{formatPrice(product.bulkFrom.price)}</strong> за базовую единицу
          </p>
        )}

        <div className="mt-3.5 flex items-center gap-2.5">
          <div className="w-[152px] shrink-0">
            <QtyStepper value={qty} unit={unit} onChange={setQty} compact />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <span className="block text-[11.5px] font-semibold text-ink-muted">Итого</span>
            <span
              className={`tnum block truncate text-[19px] font-bold leading-tight text-ink ${
                flash ? 'flash-value' : ''
              }`}
              aria-live="polite"
            >
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {saving > 0 && (
          <p className="tnum mt-1.5 text-right text-[12.5px] font-semibold text-stock">
            Экономия {formatPrice(saving)}
          </p>
        )}

        {product.densityKey && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setCalcOpen((o) => !o)}
              aria-expanded={calcOpen}
              className="flex w-full items-center justify-between gap-2 rounded-[9px] border border-dashed border-line-strong px-3 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-graphite-950"
            >
              Не знаю, сколько тонн — посчитать по размерам
              <svg
                viewBox="0 0 16 16"
                className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ${
                  calcOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
            </button>
            {calcOpen && (
              <div className="mt-2">
                <MiniCalculator
                  densityKey={product.densityKey}
                  onApply={(tons) => {
                    const tonUnit = product.units.find((u) => u.id === 'ton');
                    if (tonUnit) {
                      setUnit(tonUnit);
                      setQty(Math.max(tonUnit.min, tons));
                    }
                    setCalcOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        )}

        <p className="tnum mt-3 text-[12.5px] text-ink-muted">
          На базе {formatQty(stockInUnit, unit.precision)} {unit.short} · доставка от{' '}
          {formatMinutes(product.deliveryMin)}
        </p>

        {/* Кнопки внизу карточки — выровнены по всей ленте */}
        <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={() =>
              onQuickOrder({ product, qty, unit, effectiveBasePrice: effectiveBase, bulk: bulkActive })
            }
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-hv px-4 text-[14px] font-bold text-hv-ink transition-colors hover:bg-hv-deep"
          >
            Заказать в 1 клик
          </button>
          <button
            type="button"
            onClick={addToCart}
            aria-label={`Добавить ${product.title} в заявку`}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border px-4 text-[14px] font-semibold transition-colors ${
              added
                ? 'border-stock bg-stock/10 text-stock'
                : 'border-line-strong text-ink hover:border-graphite-950'
            }`}
          >
            {added ? (
              <>
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M3 8.4l3.2 3.2L13 4.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                В заявке
              </>
            ) : (
              'В заявку'
            )}
          </button>
        </div>

        <p className="sr-only">
          Артикул {product.sku}. {qty} {plural(qty, [unit.short, unit.short, unit.short])} на сумму{' '}
          {formatPrice(total)}.
        </p>
      </div>
    </article>
  );
}
