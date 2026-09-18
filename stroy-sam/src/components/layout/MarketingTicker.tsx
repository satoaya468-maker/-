'use client';

import { useState } from 'react';

/**
 * Лента офферов над шапкой.
 *
 * Движение останавливается по наведению, по фокусу и кнопкой — читать
 * бегущий текст с телефона в перчатке невозможно, а офферы здесь несут
 * реальные цифры. При prefers-reduced-motion лента замирает сама
 * (см. globals.css) и остаётся полностью читаемой, а не пустой.
 */

const OFFERS = [
  { text: 'Доставка по Магнитогорску от 30 минут', accent: true },
  { text: 'Скидка на объём от 5 тонн' },
  { text: 'База на Западном шоссе, 16/2' },
  { text: 'Отгрузка с 7:00 до 20:00 без выходных', accent: true },
  { text: 'Безнал с НДС для юрлиц' },
  { text: 'Свой парк: самосвалы 10, 20 и 30 тонн' },
];

function Row({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      {OFFERS.map((offer, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span
            className={`px-5 text-[13px] font-semibold tracking-tight ${
              offer.accent ? 'text-hv' : 'text-white/80'
            }`}
          >
            {offer.text}
          </span>
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

export function MarketingTicker() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="on-dark ticker-host relative overflow-hidden border-b border-white/10 bg-graphite-950"
      onMouseEnter={() => undefined}
    >
      <div className="flex items-center">
        {/* min-w-0 обязателен: у flex-элемента min-width по умолчанию auto,
            и без него лента шириной w-max растягивает страницу — на 360 px
            это давало горизонтальную прокрутку всего документа. */}
        <div className="relative min-w-0 flex-1 overflow-hidden py-2">
          <div
            className="ticker-track flex w-max"
            data-paused={paused ? 'true' : 'false'}
            style={{ ['--ticker-duration' as string]: '46s' }}
          >
            <Row />
            {/* Дубль ленты — шов при -50% незаметен */}
            <Row ariaHidden />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="mr-2 hidden h-7 w-7 shrink-0 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/10 hover:text-white sm:flex"
        >
          <span className="sr-only">
            {paused ? 'Возобновить прокрутку офферов' : 'Остановить прокрутку офферов'}
          </span>
          {paused ? (
            <svg viewBox="0 0 14 14" className="h-3 w-3" aria-hidden="true" fill="currentColor">
              <path d="M3 2l9 5-9 5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 14 14" className="h-3 w-3" aria-hidden="true" fill="currentColor">
              <rect x="3" y="2" width="3" height="10" rx="1" />
              <rect x="8" y="2" width="3" height="10" rx="1" />
            </svg>
          )}
        </button>
      </div>

      {/* Затемнение по краям — текст не обрывается резко */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-graphite-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-graphite-950 to-transparent" />
    </div>
  );
}
