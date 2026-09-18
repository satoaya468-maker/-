'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { PhoneField } from '@/components/ui/PhoneField';
import { Button } from '@/components/ui/Button';
import { isValidPhone } from '@/lib/phone';
import { formatPrice, formatQty } from '@/lib/format';
import type { Product } from '@/lib/catalog';
import type { UnitDef } from '@/lib/units';
import { lineTotal } from '@/lib/units';

/**
 * Заказ в 1 клик.
 *
 * Одно поле — телефон. Всё остальное (что, сколько, почём) уже выбрано
 * в карточке и просто показывается для подтверждения. Имя и адрес
 * менеджер уточнит в звонке: каждое поле в этой модалке стоит заказов.
 */

export interface QuickOrderPayload {
  product: Product;
  qty: number;
  unit: UnitDef;
  /** Цена за базовую единицу с уже применённой скидкой за объём.
   *  Берём её из карточки, а не пересчитываем: иначе в модалке
   *  всплывёт сумма выше той, что человек только что видел. */
  effectiveBasePrice: number;
  /** Сработал ли порог опта — показываем это в подтверждении */
  bulk: boolean;
}

interface OneClickDialogProps {
  order: QuickOrderPayload | null;
  onClose: () => void;
}

export function OneClickDialog({ order, onClose }: OneClickDialogProps) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (order) {
      setState('idle');
      setError('');
    }
  }, [order]);

  // Модалка живёт только пока есть заказ — иначе в DOM висит пустой <dialog>
  if (!order) return null;

  const total = lineTotal(order.effectiveBasePrice, order.qty, order.unit);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    if (!isValidPhone(phone)) {
      setError('Проверьте номер — нужно 10 цифр после +7');
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
          source: 'one-click',
          positions: [
            {
              sku: order.product.sku,
              title: order.product.title,
              qty: order.qty,
              unit: order.unit.short,
              total,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error('bad status');
      const data = (await res.json()) as { number?: string };
      setOrderNumber(data.number ?? '');
      setState('done');
    } catch {
      setState('error');
      setError('Не отправилось. Позвоните напрямую: +7 (3519) 55-04-04');
    }
  }

  return (
    <Dialog
      open={Boolean(order)}
      onClose={onClose}
      title={state === 'done' ? 'Заказ принят' : 'Заказ в 1 клик'}
      subtitle={
        state === 'done'
          ? undefined
          : 'Оставьте номер — перезвоним за 15 минут и согласуем время подачи машины'
      }
    >
      {state === 'done' ? (
        <div className="py-2 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-stock/10">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-stock" aria-hidden="true">
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
          {orderNumber && (
            <p className="tnum mb-2 text-[14px] font-bold text-ink">Заказ {orderNumber}</p>
          )}
          <p className="mx-auto max-w-[36ch] text-[14px] leading-relaxed text-ink-muted">
            Диспетчер перезвонит в течение 15 минут. Материал зарезервирован
            на базе на Западном шоссе.
          </p>
          <Button variant="outline" size="md" onClick={onClose} className="mt-5 w-full">
            Закрыть
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="rounded-[10px] bg-surface-sunk p-3.5">
            <p className="text-[15px] font-bold leading-tight text-ink">{order.product.title}</p>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">{order.product.spec}</p>
            <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-line pt-2.5">
              <span className="tnum text-[13.5px] text-ink-muted">
                {formatQty(order.qty, order.unit.precision)} {order.unit.short}
                {order.bulk && (
                  <span className="ml-2 font-semibold text-stock">цена по объёму</span>
                )}
              </span>
              <span className="tnum text-[18px] font-bold text-ink">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-4">
            <PhoneField value={phone} onChange={setPhone} autoFocus label="Телефон для связи" />
          </div>

          {error && state !== 'sending' && (
            <p role="alert" className="mt-2 text-[13px] font-medium text-danger">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={state === 'sending'} className="mt-4 w-full">
            {state === 'sending' ? 'Отправляем…' : 'Оформить заказ'}
          </Button>

          <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-faint">
            Оплата после согласования: картой, наличными водителю
            или по счёту с НДС.
          </p>
        </form>
      )}
    </Dialog>
  );
}
