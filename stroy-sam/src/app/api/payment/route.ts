import { NextResponse } from 'next/server';
import { createPayment, isYookassaConfigured, type PayerType } from '@/lib/payments/yookassa';

/**
 * Онлайн-оплата по уже созданному заказу.
 *
 * Вынесено отдельно от `/api/order`: счёт часто оплачивают позже,
 * по ссылке из СМС, а не в момент оформления.
 */

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const orderId = typeof body.orderId === 'string' ? body.orderId : '';
  const amount = typeof body.amount === 'number' ? body.amount : 0;

  if (!orderId || amount <= 0) {
    return NextResponse.json({ error: 'Нужны номер заказа и сумма' }, { status: 400 });
  }

  try {
    const payment = await createPayment({
      orderId,
      amount,
      description: typeof body.description === 'string' ? body.description : `Заказ ${orderId}`,
      payerType: (body.payerType === 'company' ? 'company' : 'individual') as PayerType,
      phone: typeof body.phone === 'string' ? body.phone : '',
      email: typeof body.email === 'string' ? body.email : undefined,
    });
    return NextResponse.json({ ...payment, configured: isYookassaConfigured() });
  } catch (error) {
    console.error('[payment] не удалось создать платёж', error);
    return NextResponse.json(
      { error: 'Оплата временно недоступна, менеджер выставит счёт вручную' },
      { status: 502 },
    );
  }
}
