'use client';

import { useEffect, useRef, useState } from 'react';
import { SearchBar } from './SearchBar';
import { CATEGORIES } from '@/lib/catalog';
import { WAREHOUSE, warehouseStatus, type WarehouseStatus } from '@/lib/warehouse';
import { phoneHref } from '@/lib/phone';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/format';

/**
 * Шапка. Всё, что нужно для заказа, — в одной полосе: каталог, поиск,
 * прямой телефон, статус базы и корзина. Ниже 1024 px поиск уезжает
 * на отдельную строку: на телефоне он важнее логотипа.
 */

function Logo() {
  return (
    <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="Строй Сам — на главную">
      <span className="relative grid h-9 w-9 place-items-center rounded-[9px] bg-hv">
        {/* Мастерок — знак, а не абстрактная плашка */}
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-hv-ink" aria-hidden="true">
          <path
            d="M3.2 4.4 L12.6 11.4 L8.6 15.4 Z"
            fill="currentColor"
          />
          <path
            d="M13.4 10.6 L16.4 13.6 L14.2 15.8 L11.2 12.8 Z"
            fill="currentColor"
            opacity="0.75"
          />
          <path d="M15.2 15.2 L20 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="display block text-[19px] text-white">Строй Сам</span>
        <span className="block text-[10.5px] font-medium tracking-wide text-white/55">
          Магнитогорск
        </span>
      </span>
    </a>
  );
}

function StatusPill({ status }: { status: WarehouseStatus }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className={`h-2 w-2 rounded-full ${status.open ? 'bg-stock' : 'bg-hv'}`}
        />
        {status.open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-stock opacity-60" />
        )}
      </span>
      <span className="leading-tight">
        <span className="block text-[13px] font-semibold text-white">{status.label}</span>
        <span className="block text-[11px] text-white/55">{status.detail}</span>
      </span>
    </div>
  );
}

function CatalogButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex h-11 items-center gap-2.5 rounded-[10px] bg-hv px-4 text-[14px] font-bold text-hv-ink transition-colors hover:bg-hv-deep"
      >
        <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
          <rect y="2" width="18" height="2.4" rx="1.2" />
          <rect y="7.8" width="18" height="2.4" rx="1.2" />
          <rect y="13.6" width="18" height="2.4" rx="1.2" />
        </svg>
        Каталог
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-dropdown w-[340px] overflow-hidden rounded-[12px] border border-line bg-surface shadow-e4">
          {CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0 transition-colors hover:bg-surface-sunk"
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-ink">{c.title}</span>
                <span className="block truncate text-[12px] text-ink-muted">{c.examples}</span>
              </span>
              <span className="tnum shrink-0 text-[12px] font-semibold text-ink-muted">
                от {c.fromPrice.toLocaleString('ru-RU')} ₽
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function CartButton() {
  const { count, total, setOpen, pulse } = useCart();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (pulse === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 420);
    return () => clearTimeout(t);
  }, [pulse]);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`relative flex h-11 shrink-0 items-center gap-2.5 rounded-[10px] border border-white/20 px-3.5 text-white transition-[background-color,transform] duration-200 ease-out-quart hover:bg-white/10 ${
        bump ? 'scale-[1.06]' : ''
      }`}
    >
      <span className="relative">
        <svg viewBox="0 0 22 22" className="h-[19px] w-[19px]" aria-hidden="true" fill="none">
          <path
            d="M2 3h3l2.6 11.2a1.6 1.6 0 001.56 1.24h7.9a1.6 1.6 0 001.56-1.22L20.4 7H6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="19" r="1.6" fill="currentColor" />
          <circle cx="17.5" cy="19" r="1.6" fill="currentColor" />
        </svg>
        {count > 0 && (
          <span className="tnum absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-hv px-1 text-[11px] font-bold text-hv-ink">
            {count}
          </span>
        )}
      </span>
      <span className="tnum hidden text-[13px] font-semibold lg:block">
        {count > 0 ? formatPrice(total) : 'Заявка'}
      </span>
      <span className="sr-only">
        {count > 0 ? `Заявка: ${count} позиций на ${formatPrice(total)}` : 'Заявка пуста'}
      </span>
    </button>
  );
}

export function SiteHeader() {
  // Статус считаем на клиенте: на сервере время сборки, а не время прораба
  const [status, setStatus] = useState<WarehouseStatus | null>(null);

  useEffect(() => {
    setStatus(warehouseStatus());
    const t = setInterval(() => setStatus(warehouseStatus()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="on-dark sticky top-0 z-sticky bg-graphite-950/95 backdrop-blur-sm">
      <div className="shell">
        <div className="flex h-[68px] items-center gap-3 lg:gap-5">
          <Logo />

          <div className="hidden lg:block">
            <CatalogButton />
          </div>

          <div className="hidden min-w-0 flex-1 lg:block">
            <SearchBar compact />
          </div>

          <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:gap-5">
            <div className="hidden xl:block">
              {status && <StatusPill status={status} />}
            </div>

            <a
              href={phoneHref(WAREHOUSE.phone)}
              className="hidden shrink-0 leading-tight md:block"
            >
              <span className="tnum block text-[15px] font-bold text-white">{WAREHOUSE.phone}</span>
              <span className="block text-[11px] text-hv">Прямой номер диспетчера</span>
            </a>

            <CartButton />
          </div>
        </div>

        {/* Мобильная строка: поиск + каталог. Поиск здесь главнее всего. */}
        <div className="flex items-center gap-2 pb-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <SearchBar compact />
          </div>
          <a
            href={phoneHref(WAREHOUSE.phone)}
            aria-label={`Позвонить ${WAREHOUSE.phone}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-hv text-hv-ink md:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true" fill="currentColor">
              <path d="M5.2 2.5c.7 0 1.3.4 1.5 1l.9 2.4c.2.6 0 1.3-.5 1.7l-1 .8a10 10 0 004.5 4.5l.8-1c.4-.5 1.1-.7 1.7-.5l2.4.9c.6.2 1 .8 1 1.5v2.1c0 .9-.7 1.6-1.6 1.6A14.5 14.5 0 012.5 4.1c0-.9.7-1.6 1.6-1.6z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
