/**
 * Единицы измерения и пересчёт.
 *
 * Прораб мыслит кубами («яма под фундамент — 12 кубов»), а база отгружает
 * и выставляет счёт тоннами. Всё расхождение между этими двумя мирами
 * живёт здесь, в одном месте.
 *
 * `factor` = сколько БАЗОВЫХ единиц товара содержится в одной такой единице.
 */

export type UnitId = 'ton' | 'm3' | 'bag' | 'pallet' | 'piece';

export interface UnitDef {
  id: UnitId;
  /** Подпись на переключателе */
  label: string;
  /** Короткая форма для цены: 1 850 ₽/т */
  short: string;
  factor: number;
  /** Шаг изменения количества */
  step: number;
  /** Минимальный заказ в этой единице */
  min: number;
  /** Знаков после запятой при вводе количества */
  precision: number;
}

export const UNIT_LABELS: Record<UnitId, { label: string; short: string }> = {
  ton: { label: 'Тонны', short: 'т' },
  m3: { label: 'Кубы', short: 'м³' },
  bag: { label: 'Мешки', short: 'мешок' },
  pallet: { label: 'Поддоны', short: 'поддон' },
  piece: { label: 'Штуки', short: 'шт' },
};

/**
 * Цена за одну единицу `unit`, исходя из цены за базовую единицу.
 */
export function unitPrice(basePrice: number, unit: UnitDef): number {
  return basePrice * unit.factor;
}

/**
 * Количество в базовых единицах — то, что уходит в корзину и в счёт.
 */
export function toBaseQty(qty: number, unit: UnitDef): number {
  return qty * unit.factor;
}

/**
 * Итог по позиции. Округляем до рубля — в счёте копеек не бывает.
 */
export function lineTotal(basePrice: number, qty: number, unit: UnitDef): number {
  return Math.round(basePrice * unit.factor * qty);
}

/**
 * Перевод количества при переключении единиц: 10 т щебня → 7,14 м³.
 * Держим физический объём постоянным, а не число в поле.
 */
export function convertQty(qty: number, from: UnitDef, to: UnitDef): number {
  const base = qty * from.factor;
  const next = base / to.factor;
  const rounded = roundToStep(next, to);
  return Math.max(to.min, rounded);
}

export function roundToStep(value: number, unit: UnitDef): number {
  if (unit.step <= 0) return value;
  const stepped = Math.round(value / unit.step) * unit.step;
  return Number(stepped.toFixed(unit.precision));
}

export function clampQty(value: number, unit: UnitDef): number {
  if (!Number.isFinite(value) || value <= 0) return unit.min;
  return Math.max(unit.min, Number(value.toFixed(unit.precision)));
}

/**
 * Насыпная плотность — сколько тонн весит куб материала.
 * Значения рабочие, по ГОСТ-диапазонам для влажности до 5 %.
 */
export const BULK_DENSITY: Record<string, { label: string; density: number }> = {
  'gravel-20-40': { label: 'Щебень гранитный 20–40', density: 1.38 },
  'gravel-5-20': { label: 'Щебень гранитный 5–20', density: 1.42 },
  'gravel-limestone': { label: 'Щебень известняковый 20–40', density: 1.3 },
  'sand-quarry': { label: 'Песок карьерный', density: 1.5 },
  'sand-river': { label: 'Песок речной мытый', density: 1.6 },
  'screening': { label: 'Отсев дробления 0–5', density: 1.45 },
  'pgs': { label: 'ПГС природная', density: 1.65 },
  'soil': { label: 'Грунт плодородный', density: 1.2 },
};

/**
 * Куб → тонна. Сердце калькулятора сыпучки.
 */
export function volumeToTons(volumeM3: number, density: number): number {
  return volumeM3 * density;
}

/**
 * Габариты засыпки → объём. Толщина приходит в сантиметрах: так её
 * называют на объекте («подушка 20 сантиметров»), переводим сами.
 */
export function slabVolume(lengthM: number, widthM: number, thicknessCm: number): number {
  return lengthM * widthM * (thicknessCm / 100);
}

/**
 * Запас на уплотнение. Щебень под виброплитой садится на 15–25 %,
 * песок — на 10–15 %. Без этого на объект приезжает недосып.
 */
export function withCompaction(tons: number, percent: number): number {
  return tons * (1 + percent / 100);
}

/**
 * Разбивка по рейсам. Самосвал — 20 т, шаланда — 30 т.
 */
export function tripsFor(tons: number, truckCapacity: number): number {
  if (truckCapacity <= 0) return 0;
  return Math.ceil(tons / truckCapacity);
}
