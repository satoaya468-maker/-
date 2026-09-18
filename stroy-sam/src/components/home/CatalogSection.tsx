'use client';

import { useState } from 'react';
import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from '@/lib/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { OneClickDialog, type QuickOrderPayload } from '@/components/order/OneClickDialog';

/**
 * Фокусированный каталог на главной.
 *
 * Не весь ассортимент, а ходовые позиции: фильтр по трём категориям,
 * из которых идёт основная выручка. Полный каталог — отдельный раздел,
 * главная должна давать заказать за минуту, а не листать.
 */

const TABS: Array<{ id: CategoryId | 'all'; title: string }> = [
  { id: 'all', title: 'Всё ходовое' },
  ...CATEGORIES.filter((c) => c.featured).map((c) => ({ id: c.id, title: c.title })),
];

export function CatalogSection() {
  const [tab, setTab] = useState<CategoryId | 'all'>('all');
  const [quickOrder, setQuickOrder] = useState<QuickOrderPayload | null>(null);

  const visible: Product[] = tab === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === tab);

  return (
    <section id="catalog" className="shell scroll-mt-24 py-14 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title text-ink">Цены и наличие на базе</h2>
          <p className="mt-2.5 max-w-[56ch] text-[15px] leading-relaxed text-ink-muted">
            Переключите единицы — цена и итог пересчитаются сразу. Остатки
            указаны по складу на Западном шоссе.
          </p>
        </div>
        <p className="tnum rounded-[10px] bg-surface-sunk px-3.5 py-2.5 text-[13px] font-semibold text-ink">
          Цены на {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Категории каталога"
        className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`h-10 shrink-0 rounded-[9px] px-4 text-[14px] font-semibold transition-colors ${
              tab === t.id
                ? 'bg-graphite-950 text-white'
                : 'border border-line-strong bg-surface text-ink hover:border-graphite-950'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} onQuickOrder={setQuickOrder} />
        ))}
      </div>

      {/* Якоря для меню каталога — ведут в соответствующую вкладку */}
      {CATEGORIES.map((c) => (
        <span key={c.id} id={`cat-${c.id}`} className="sr-only" aria-hidden="true" />
      ))}

      <OneClickDialog order={quickOrder} onClose={() => setQuickOrder(null)} />
    </section>
  );
}
