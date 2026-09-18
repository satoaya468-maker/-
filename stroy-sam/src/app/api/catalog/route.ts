import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/moysklad';

/**
 * Каталог с остатками. Витрина рендерится статикой, а этот маршрут
 * нужен для обновления цен и наличия без пересборки — и для внешних
 * потребителей (мобильное приложение, прайс для 1С).
 */

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET() {
  const { products, live } = await getCatalog();
  return NextResponse.json({
    live,
    updatedAt: new Date().toISOString(),
    products: products.map((p) => ({
      id: p.id,
      sku: p.sku,
      title: p.title,
      spec: p.spec,
      category: p.category,
      price: p.basePrice,
      unit: p.baseUnit,
      stock: p.stock,
      bulkFrom: p.bulkFrom ?? null,
    })),
  });
}
