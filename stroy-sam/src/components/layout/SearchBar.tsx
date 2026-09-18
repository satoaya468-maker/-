'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { searchProducts, type Product } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import { UNIT_LABELS } from '@/lib/units';

/**
 * Поиск по материалам. В маркетплейсе строймата поиск — это и есть
 * главный CTA: снабженец приходит со списком, а не гулять по разделам.
 *
 * Подсказки — обычный список с клавиатурной навигацией (↑ ↓ Enter Esc),
 * combobox по WAI-ARIA, чтобы это работало и в скринридере.
 */

const QUICK = ['Щебень 20-40', 'Песок', 'Цемент М500', 'Газоблок', 'ПГС'];

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchProducts(query));
    setActive(-1);
  }, [query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const showPanel = open && (results.length > 0 || query.trim().length === 0);

  function go(product: Product) {
    setOpen(false);
    setQuery('');
    document.getElementById(`product-${product.id}`)?.scrollIntoView({ block: 'center' });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="relative">
        <svg
          viewBox="0 0 20 20"
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.9" />
          <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>

        <label htmlFor={id} className="sr-only">
          Поиск материалов по названию или артикулу
        </label>
        <input
          id={id}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Щебень, песок, цемент, газоблок…"
          className={`w-full rounded-[10px] border border-line-strong bg-surface pl-11 pr-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-graphite-950 ${
            compact ? 'h-11' : 'h-12'
          }`}
        />
      </div>

      {showPanel && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-dropdown overflow-hidden rounded-[12px] border border-line bg-surface shadow-e3"
          id={`${id}-list`}
          role="listbox"
        >
          {results.length > 0 ? (
            results.map((p, i) => (
              <button
                key={p.id}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                  i === active ? 'bg-surface-sunk' : ''
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-ink">
                    {p.title}
                  </span>
                  <span className="block truncate text-[12px] text-ink-muted">
                    {p.spec} · арт. {p.sku}
                  </span>
                </span>
                <span className="tnum shrink-0 text-[14px] font-bold text-ink">
                  {formatPrice(p.basePrice)}
                  <span className="text-[12px] font-medium text-ink-muted">
                    /{UNIT_LABELS[p.baseUnit].short}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3">
              <p className="mb-2 text-[12px] font-semibold text-ink-muted">Что чаще всего берут</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuery(q)}
                    className="rounded-full border border-line px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-graphite-950"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
