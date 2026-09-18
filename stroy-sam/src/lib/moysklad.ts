/**
 * Адаптер МойСклад — остатки и цены.
 *
 * Пока переменные окружения не заданы, адаптер отдаёт локальный каталог:
 * витрина работает всегда, интеграция включается без правок компонентов.
 *
 * Включение:
 *   MOYSKLAD_TOKEN=...            токен доступа (Bearer)
 *   MOYSKLAD_STORE_ID=...         id склада «Западное шоссе»
 *   MOYSKLAD_PRICE_TYPE=Розница   тип цены для витрины
 */

import { PRODUCTS, type Product } from './catalog';

const API = 'https://api.moysklad.ru/api/remap/1.2';

export interface StockRow {
  /** Артикул — ключ связи с локальным каталогом */
  sku: string;
  stock: number;
  price: number;
}

export function isMoyskladConfigured(): boolean {
  return Boolean(process.env.MOYSKLAD_TOKEN && process.env.MOYSKLAD_STORE_ID);
}

interface MoyskladStockRow {
  article?: string;
  code?: string;
  stock?: number;
  price?: number;
}

/**
 * Отчёт «Остатки» по складу. Цена в МоёмСкладе хранится в копейках.
 */
async function fetchStock(): Promise<StockRow[]> {
  const url = new URL(`${API}/report/stock/all`);
  url.searchParams.set('filter', `store=${API}/entity/store/${process.env.MOYSKLAD_STORE_ID}`);
  url.searchParams.set('limit', '1000');

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.MOYSKLAD_TOKEN}`,
      'Accept-Encoding': 'gzip',
    },
    // Остатки живут минуту: чаще дёргать API нет смысла, реже — обманем прораба
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`МойСклад ответил ${res.status}`);
  }

  const data = (await res.json()) as { rows?: MoyskladStockRow[] };
  return (data.rows ?? []).map((row) => ({
    sku: row.article ?? row.code ?? '',
    stock: Number(row.stock ?? 0),
    price: Number(row.price ?? 0) / 100,
  }));
}

/**
 * Каталог с наложенными остатками. Ошибка интеграции не должна ронять
 * главную: падаем на локальные данные и пишем в лог.
 */
export async function getCatalog(): Promise<{ products: Product[]; live: boolean }> {
  if (!isMoyskladConfigured()) {
    return { products: PRODUCTS, live: false };
  }

  try {
    const rows = await fetchStock();
    const bySku = new Map(rows.map((r) => [r.sku, r]));
    const products = PRODUCTS.map((p) => {
      const row = bySku.get(p.sku);
      if (!row) return p;
      return {
        ...p,
        stock: row.stock > 0 ? row.stock : p.stock,
        basePrice: row.price > 0 ? row.price : p.basePrice,
      };
    });
    return { products, live: true };
  } catch (error) {
    console.error('[moysklad] остатки недоступны, витрина на локальных данных', error);
    return { products: PRODUCTS, live: false };
  }
}

/**
 * Резерв под заказ. Создаёт «Заказ покупателя» в МоёмСкладе.
 * Заглушка возвращает синтетический номер — фронт уже умеет его показывать.
 */
export async function createCustomerOrder(payload: {
  phone: string;
  name?: string;
  comment?: string;
  positions: Array<{ sku: string; qty: number; unit: string }>;
}): Promise<{ id: string; number: string; live: boolean }> {
  if (!isMoyskladConfigured()) {
    return {
      id: `local-${Date.now()}`,
      number: `СС-${String(Date.now()).slice(-6)}`,
      live: false,
    };
  }

  const res = await fetch(`${API}/entity/customerorder`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MOYSKLAD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: [payload.name, payload.phone, payload.comment].filter(Boolean).join(' · '),
      // Позиции подставляются после сопоставления артикулов с id товаров
      attributes: payload.positions.map((p) => ({
        name: p.sku,
        value: `${p.qty} ${p.unit}`,
      })),
    }),
  });

  if (!res.ok) throw new Error(`МойСклад: заказ не создан (${res.status})`);

  const data = (await res.json()) as { id: string; name: string };
  return { id: data.id, number: data.name, live: true };
}
