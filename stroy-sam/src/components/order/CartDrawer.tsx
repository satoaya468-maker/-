'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart';
import { formatPrice, formatQty, plural } from '@/lib/format';
import { lineTotal } from '@/lib/units';
import { PhoneField } from '@/components/ui/PhoneField';
import { Button } from '@/components/ui/Button';
import { QtyStepper } from '@/components/product/QtyStepper';
import { isValidPhone } from '@/lib/phone';

/**
 * Заявка (корзина) — шторка справа.
 *
 * Оформление в один экран: позиции, тип плательщика и телефон.
 * Юрлицу нужен счёт с НДС, физлицу — карта или наличные водителю;
 * это единственная развилка, всё остальное одинаково.
 */

type Payer = 'individual' | 'company';

export function CartDrawer() {
  const { items, total, open, setOpen, setQty, remove, clear } = useCart();
  const [payer, setPayer] = useState<Payer>('individual');
  const [phone, setPhone] = useState('');
  const [inn, setInn] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ number?: string; invoice?: string }>({});

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError('Проверьте номер — нужно 10 цифр после +7');
      return;
    }
    if (payer === 'company' && inn.replace(/\D/g, '').length < 10) {
      setError('Для счёта нужен ИНН — 10 цифр для ООО, 12 для ИП');
      return;
    }
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          source: 'cart',
          payerType: payer,
          inn: payer === 'company' ? inn : undefined,
          positions: items.map((i) => ({
            sku: i.sku,
            title: i.title,
            qty: i.qty,
            unit: i.unit.short,
            total: lineTotal(i.basePrice, i.qty, i.unit),
          })),
        }),
      });
      if (!res.ok) throw new Error('bad status');
      const data = (await res.json()) as { number?: string; payment?: { invoiceNumber?: string } };
      setResult({ number: data.number, invoice: data.payment?.invoiceNumber });
      setState('done');
      clear();
    } catch {
      setState('error');
      setError('Не отправилось. Позвоните: +7 (3519) 55-04-04');
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-drawer" role="dialog" aria-modal="true" aria-label="Ваша заявка">
      <button
        type="button"
        aria-label="Закрыть заявку"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-graphite-950/60"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-bg shadow-e4">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-5 py-4">
          <h2 className="text-[17px] font-bold text-ink">
            {state === 'done' ? 'Заявка отправлена' : 'Ваша заявка'}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunk hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {state === 'done' ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-stock/10">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-stock" aria-hidden="true">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {result.number && (
              <p className="tnum text-[15px] font-bold text-ink">Заявка {result.number}</p>
            )}
            {result.invoice && (
              <p className="tnum mt-1 text-[14px] text-ink-muted">
                Счёт {result.invoice} вышлем на почту после подтверждения
              </p>
            )}
            <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-ink-muted">
              Диспетчер перезвонит в течение 15 минут, согласует время подачи
              машины и адрес выгрузки.
            </p>
            <Button variant="outline" onClick={() => setOpen(false)} className="mt-6 w-full max-w-[280px]">
              Вернуться к каталогу
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-[16px] font-bold text-ink">Заявка пока пуста</p>
            <p className="mt-2 max-w-[32ch] text-[14px] leading-relaxed text-ink-muted">
              Добавьте материалы из каталога — или позвоните диспетчеру,
              он соберёт заявку сам.
            </p>
            <Button variant="outline" onClick={() => setOpen(false)} className="mt-6">
              Перейти в каталог
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-3">
                {items.map((i) => (
                  <li
                    key={`${i.productId}-${i.unit.id}`}
                    className="rounded-[12px] bg-surface p-3.5 shadow-e1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold leading-tight text-ink">{i.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-ink-muted">
                          {i.spec} · арт. {i.sku}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(i.productId, i.unit.id)}
                        aria-label={`Убрать ${i.title} из заявки`}
                        className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-sunk hover:text-danger"
                      >
                        <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
                          <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="w-[146px] shrink-0">
                        <QtyStepper
                          value={i.qty}
                          unit={i.unit}
                          onChange={(q) => setQty(i.productId, i.unit.id, q)}
                          compact
                        />
                      </div>
                      <div className="text-right">
                        <span className="tnum block text-[12px] text-ink-muted">
                          {formatQty(i.qty, i.unit.precision)} {i.unit.short}
                        </span>
                        <span className="tnum block text-[16px] font-bold text-ink">
                          {formatPrice(lineTotal(i.basePrice, i.qty, i.unit))}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={submit}
              noValidate
              className="shrink-0 border-t border-line bg-surface px-5 py-4"
            >
              <div className="tnum mb-4 flex items-baseline justify-between gap-3">
                <span className="text-[14px] text-ink-muted">
                  {items.length} {plural(items.length, ['позиция', 'позиции', 'позиций'])}
                </span>
                <span className="text-[22px] font-bold text-ink">{formatPrice(total)}</span>
              </div>

              <fieldset className="mb-3 min-w-0">
                <legend className="sr-only">Тип плательщика</legend>
                <div className="grid grid-cols-2 gap-1 rounded-[9px] bg-surface-sunk p-1">
                  {(
                    [
                      { id: 'individual', title: 'Физлицо' },
                      { id: 'company', title: 'Юрлицо / ИП' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPayer(p.id)}
                      aria-pressed={payer === p.id}
                      className={`h-9 rounded-[7px] text-[13.5px] font-semibold transition-colors ${
                        payer === p.id ? 'bg-surface text-ink shadow-e1' : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </fieldset>

              {payer === 'company' && (
                <div className="mb-3">
                  <label htmlFor="cart-inn" className="mb-1.5 block text-[12px] font-semibold text-ink-muted">
                    ИНН для счёта <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="cart-inn"
                    inputMode="numeric"
                    value={inn}
                    onChange={(e) => setInn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="7445012345"
                    className="tnum h-11 w-full rounded-[10px] border border-line-strong bg-surface px-3.5 text-[15px] font-semibold text-ink outline-none placeholder:text-ink-faint focus:border-graphite-950"
                  />
                </div>
              )}

              <PhoneField value={phone} onChange={setPhone} compact label="Телефон" />

              {error && state !== 'sending' && (
                <p role="alert" className="mt-2 text-[13px] font-medium text-danger">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" disabled={state === 'sending'} className="mt-3 w-full">
                {state === 'sending'
                  ? 'Отправляем…'
                  : payer === 'company'
                    ? 'Запросить счёт'
                    : 'Оформить заявку'}
              </Button>

              <p className="mt-2.5 text-center text-[12px] leading-relaxed text-ink-faint">
                {payer === 'company'
                  ? 'Счёт с НДС пришлём на почту, отгрузка по оплате или по договору.'
                  : 'Оплата картой онлайн или наличными водителю при выгрузке.'}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
