/**
 * Онлайн-оплата. ЮKassa для физлиц, безнал со счётом — для юрлиц.
 *
 * Оба сценария обязательны: частник платит картой сразу, снабженец
 * ООО просит счёт с НДС и платит по нему через банк. Один и тот же
 * заказ должен уметь и то, и другое.
 *
 * Включение:
 *   YOOKASSA_SHOP_ID=...
 *   YOOKASSA_SECRET_KEY=...
 *   NEXT_PUBLIC_SITE_URL=https://stroy-sam.ru
 */

const API = 'https://api.yookassa.ru/v3';

export type PayerType = 'individual' | 'company';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  description: string;
  payerType: PayerType;
  phone: string;
  email?: string;
  /** Для юрлица — реквизиты под счёт */
  company?: { inn: string; name: string };
}

export interface PaymentResult {
  id: string;
  status: 'pending' | 'succeeded' | 'invoice' | 'stub';
  /** Куда отправить пользователя: оплата картой или скачивание счёта */
  confirmationUrl?: string;
  /** Для юрлиц — номер счёта на оплату */
  invoiceNumber?: string;
  live: boolean;
}

export function isYookassaConfigured(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function authHeader(): string {
  const raw = `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`;
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

/**
 * Юрлицо не платит картой на 400 тысяч — ему нужен счёт.
 * Счёт формирует бухгалтерия из заказа в МоёмСкладе; здесь только
 * фиксируем намерение и отдаём номер.
 */
function createInvoice(req: PaymentRequest): PaymentResult {
  return {
    id: `inv-${req.orderId}`,
    status: 'invoice',
    invoiceNumber: `СЧ-${String(Date.now()).slice(-6)}`,
    live: false,
  };
}

export async function createPayment(req: PaymentRequest): Promise<PaymentResult> {
  if (req.payerType === 'company') {
    return createInvoice(req);
  }

  if (!isYookassaConfigured()) {
    // Заглушка: витрина и оформление работают до подключения эквайринга
    return { id: `stub-${req.orderId}`, status: 'stub', live: false };
  }

  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      // Идемпотентность: повторный тап по кнопке не создаёт второй платёж
      'Idempotence-Key': req.orderId,
    },
    body: JSON.stringify({
      amount: { value: req.amount.toFixed(2), currency: 'RUB' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/order/${req.orderId}`,
      },
      description: req.description,
      receipt: {
        customer: { phone: req.phone, email: req.email },
        items: [
          {
            description: req.description.slice(0, 128),
            quantity: '1',
            amount: { value: req.amount.toFixed(2), currency: 'RUB' },
            vat_code: 1,
            payment_subject: 'commodity',
            payment_mode: 'full_prepayment',
          },
        ],
      },
    }),
  });

  if (!res.ok) throw new Error(`ЮKassa: платёж не создан (${res.status})`);

  const data = (await res.json()) as {
    id: string;
    status: string;
    confirmation?: { confirmation_url?: string };
  };

  return {
    id: data.id,
    status: data.status === 'succeeded' ? 'succeeded' : 'pending',
    confirmationUrl: data.confirmation?.confirmation_url,
    live: true,
  };
}
