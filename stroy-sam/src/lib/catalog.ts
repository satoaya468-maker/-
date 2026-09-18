import type { UnitDef, UnitId } from './units';

/**
 * Каталог. Сейчас — статический снимок номенклатуры базы на Западном шоссе.
 * В проде источником становится МойСклад: см. `lib/moysklad.ts`, форма
 * объекта Product совпадает с тем, что отдаёт адаптер.
 */

export type CategoryId = 'bulk' | 'dry-mix' | 'blocks' | 'reinforcement' | 'insulation';

export interface Category {
  id: CategoryId;
  title: string;
  /** Что именно везём — прораб ищет по материалу, не по разделу */
  examples: string;
  /** Крупная плашка в сетке быстрых категорий */
  featured?: boolean;
  fromPrice: number;
  fromUnit: string;
  art: 'gravel' | 'cement' | 'block' | 'rebar' | 'insulation';
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  /** Уточнение: фракция, марка, размер */
  spec: string;
  category: CategoryId;
  /** Цена за одну базовую единицу */
  basePrice: number;
  baseUnit: UnitId;
  units: UnitDef[];
  /** Остаток на базе в базовых единицах */
  stock: number;
  /** Порог опта — от какого объёма включается цена по объёму */
  bulkFrom?: { qty: number; unit: UnitId; price: number };
  /** Ключ в BULK_DENSITY, если материал сыпучий */
  densityKey?: string;
  badge?: string;
  art: 'gravel' | 'sand' | 'cement' | 'block' | 'screening' | 'pgs';
  /** Доставка от, минут — считается от базы на Западном шоссе */
  deliveryMin: number;
}

const TON: UnitDef = { id: 'ton', label: 'Тонны', short: 'т', factor: 1, step: 1, min: 1, precision: 1 };

/** Куб сыпучки в тоннах — фактор равен насыпной плотности материала */
const m3 = (density: number): UnitDef => ({
  id: 'm3',
  label: 'Кубы',
  short: 'м³',
  factor: density,
  step: 1,
  min: 1,
  precision: 1,
});

/** Мешок — сама базовая единица сухих смесей, поэтому фактор всегда 1.
 *  Вес мешка живёт в `spec` товара: он влияет на логистику, не на цену. */
const BAG: UnitDef = { id: 'bag', label: 'Мешки', short: 'мешок', factor: 1, step: 1, min: 1, precision: 0 };

export const CATEGORIES: Category[] = [
  {
    id: 'bulk',
    title: 'Сыпучие материалы',
    examples: 'Щебень, песок, отсев, ПГС, грунт',
    featured: true,
    fromPrice: 780,
    fromUnit: 'т',
    art: 'gravel',
  },
  {
    id: 'dry-mix',
    title: 'Сухие смеси',
    examples: 'Цемент, пескобетон, штукатурка, наливной пол',
    featured: true,
    fromPrice: 219,
    fromUnit: 'мешок',
    art: 'cement',
  },
  {
    id: 'blocks',
    title: 'Блоки и кирпич',
    examples: 'Газоблок, керамзитоблок, кирпич рядовой',
    featured: true,
    fromPrice: 3450,
    fromUnit: 'м³',
    art: 'block',
  },
  {
    id: 'reinforcement',
    title: 'Арматура и сетка',
    examples: 'Арматура А500С, кладочная сетка, проволока',
    fromPrice: 47500,
    fromUnit: 'т',
    art: 'rebar',
  },
  {
    id: 'insulation',
    title: 'Утеплитель и плёнка',
    examples: 'Минвата, ЭППС, пароизоляция, геотекстиль',
    fromPrice: 1290,
    fromUnit: 'упак',
    art: 'insulation',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'gravel-20-40',
    sku: 'ЩГ-2040',
    title: 'Щебень гранитный',
    spec: 'фракция 20–40 мм, М1200',
    category: 'bulk',
    basePrice: 1850,
    baseUnit: 'ton',
    units: [TON, m3(1.38)],
    stock: 940,
    bulkFrom: { qty: 5, unit: 'ton', price: 1690 },
    densityKey: 'gravel-20-40',
    badge: 'Хит объекта',
    art: 'gravel',
    deliveryMin: 30,
  },
  {
    id: 'gravel-5-20',
    sku: 'ЩГ-0520',
    title: 'Щебень гранитный',
    spec: 'фракция 5–20 мм, под бетон',
    category: 'bulk',
    basePrice: 1980,
    baseUnit: 'ton',
    units: [TON, m3(1.42)],
    stock: 610,
    bulkFrom: { qty: 5, unit: 'ton', price: 1830 },
    densityKey: 'gravel-5-20',
    art: 'gravel',
    deliveryMin: 30,
  },
  {
    id: 'sand-quarry',
    sku: 'ПК-001',
    title: 'Песок карьерный',
    spec: 'мытый, модуль крупности 2,0',
    category: 'bulk',
    basePrice: 780,
    baseUnit: 'ton',
    units: [TON, m3(1.5)],
    stock: 1480,
    bulkFrom: { qty: 5, unit: 'ton', price: 690 },
    densityKey: 'sand-quarry',
    art: 'sand',
    deliveryMin: 40,
  },
  {
    id: 'screening',
    sku: 'ОТС-005',
    title: 'Отсев дробления',
    spec: 'фракция 0–5 мм, гранит',
    category: 'bulk',
    basePrice: 890,
    baseUnit: 'ton',
    units: [TON, m3(1.45)],
    stock: 520,
    bulkFrom: { qty: 5, unit: 'ton', price: 810 },
    densityKey: 'screening',
    art: 'screening',
    deliveryMin: 35,
  },
  {
    id: 'pgs',
    sku: 'ПГС-100',
    title: 'ПГС природная',
    spec: 'для обратной засыпки',
    category: 'bulk',
    basePrice: 720,
    baseUnit: 'ton',
    units: [TON, m3(1.65)],
    stock: 2100,
    bulkFrom: { qty: 10, unit: 'ton', price: 640 },
    densityKey: 'pgs',
    art: 'pgs',
    deliveryMin: 40,
  },
  {
    id: 'cement-m500',
    sku: 'ЦМ-500',
    title: 'Цемент ПЦ М500 Д0',
    spec: 'мешок 50 кг, Магнитогорск',
    category: 'dry-mix',
    basePrice: 465,
    baseUnit: 'bag',
    units: [
      BAG,
      { id: 'pallet', label: 'Поддоны', short: 'поддон', factor: 30, step: 1, min: 1, precision: 0 },
      { id: 'ton', label: 'Тонны', short: 'т', factor: 20, step: 1, min: 1, precision: 1 },
    ],
    stock: 3600,
    bulkFrom: { qty: 1, unit: 'pallet', price: 438 },
    badge: 'Всегда в наличии',
    art: 'cement',
    deliveryMin: 45,
  },
  {
    id: 'sandbeton-m300',
    sku: 'ПБ-300',
    title: 'Пескобетон М300',
    spec: 'мешок 40 кг, стяжка пола',
    category: 'dry-mix',
    basePrice: 289,
    baseUnit: 'bag',
    units: [
      BAG,
      { id: 'pallet', label: 'Поддоны', short: 'поддон', factor: 35, step: 1, min: 1, precision: 0 },
      { id: 'ton', label: 'Тонны', short: 'т', factor: 25, step: 1, min: 1, precision: 1 },
    ],
    stock: 2450,
    bulkFrom: { qty: 1, unit: 'pallet', price: 268 },
    art: 'cement',
    deliveryMin: 45,
  },
  {
    id: 'aerated-block-d500',
    sku: 'ГБ-D500',
    title: 'Газоблок D500',
    spec: '600×250×300 мм, 1 поддон — 1,8 м³',
    category: 'blocks',
    basePrice: 128,
    baseUnit: 'piece',
    units: [
      { id: 'piece', label: 'Штуки', short: 'шт', factor: 1, step: 1, min: 1, precision: 0 },
      { id: 'pallet', label: 'Поддоны', short: 'поддон', factor: 40, step: 1, min: 1, precision: 0 },
      { id: 'm3', label: 'Кубы', short: 'м³', factor: 22.2, step: 1, min: 1, precision: 1 },
    ],
    stock: 5120,
    bulkFrom: { qty: 4, unit: 'pallet', price: 119 },
    badge: 'Под кладку',
    art: 'block',
    deliveryMin: 60,
  },
];

export function productById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function productsByCategory(category: CategoryId): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

/** Поиск по названию, спецификации и артикулу — так ищет снабженец */
export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return PRODUCTS.filter((p) =>
    `${p.title} ${p.spec} ${p.sku}`.toLowerCase().includes(q),
  ).slice(0, 6);
}
