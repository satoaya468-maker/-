import { NextResponse } from 'next/server';
import { submitLead } from '@/lib/leads';
import { createCustomerOrder } from '@/lib/moysklad';
import { createPayment, type PayerType } from '@/lib/payments/yookassa';
import { isValidPhone, normalizePhone } from '@/lib/phone';

/**
 * Оформление заказа: заказ в 1 клик и заявка из корзины.
 *
 * Порядок шагов выбран так, чтобы заявка не терялась: сначала лид,
 * потом склад, потом оплата. Падение любого следующего шага не отменяет
 * предыдущий — менеджер всё равно получит контакт и перезвонит.
 */

export const runtime = 'nodejs';

interface Position {
  sku: string;
  title: string;
  qty: number;
  unit: string;
  total: number;
}

function parsePositions(raw: unknown): Position[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is Position => {
      if (typeof p !== 'object' || p === null) return false;
      const o = p as Record<string, unknown>;
      return typeof o.sku === 'string' && typeof o.qty === 'number';
    })
    .slice(0, 50)
    .map((p) => ({
      sku: p.sku,
      title: typeof p.title === 'string' ? p.title : p.sku,
      qty: p.qty,
      unit: typeof p.unit === 'string' ? p.unit : 'шт',
      total: typeof p.total === 'number' ? p.total : 0,
    }));
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const rawPhone = typeof body.phone === 'string' ? body.phone : '';
  if (!isValidPhone(rawPhone)) {
    return NextResponse.json({ error: 'Проверьте номер телефона' }, { status: 400 });
  }
  const phone = normalizePhone(rawPhone);

  const positions = parsePositions(body.positions);
  if (positions.length === 0) {
    return NextResponse.json({ error: 'В заявке нет позиций' }, { status: 400 });
  }

  const payerType: PayerType = body.payerType === 'company' ? 'company' : 'individual';
  const amount = positions.reduce((sum, p) => sum + p.total, 0);
  const description = positions.map((p) => `${p.title} ${p.qty} ${p.unit}`).join('; ');

  // 1. Лид — то, без чего заказ не имеет смысла
  const lead = await submitLead({
    phone,
    source: body.source === 'one-click' ? 'one-click' : 'cart',
    comment: description.slice(0, 600),
    context: { positions, payerType, inn: body.inn, amount },
    createdAt: new Date().toISOString(),
  });

  // 2. Резерв на складе
  let order = { number: `СС-${String(Date.now()).slice(-6)}`, live: false };
  try {
    const created = await createCustomerOrder({
      phone,
      comment: description,
      positions: positions.map((p) => ({ sku: p.sku, qty: p.qty, unit: p.unit })),
    });
    order = { number: created.number, live: created.live };
  } catch (error) {
    console.error('[order] резерв в МоёмСкладе не создан', error);
  }

  // 3. Оплата: карта для физлица, счёт для юрлица
  let payment = null;
  try {
    payment = await createPayment({
      orderId: order.number,
      amount,
      description: description.slice(0, 128),
      payerType,
      phone,
      company:
        payerType === 'company' && typeof body.inn === 'string'
          ? { inn: body.inn, name: typeof body.name === 'string' ? body.name : '' }
          : undefined,
    });
  } catch (error) {
    console.error('[order] платёж не создан', error);
  }

  return NextResponse.json({
    ok: true,
    leadId: lead.id,
    number: order.number,
    callbackMin: lead.callbackMin,
    payment,
  });
}
