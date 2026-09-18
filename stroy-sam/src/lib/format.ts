/** Форматирование чисел. Везде неразрывные пробелы — цена не должна рваться. */

const NBSP = ' ';

export function formatMoney(value: number): string {
  return Math.round(value)
    .toLocaleString('ru-RU')
    .replace(/\s/g, NBSP);
}

export function formatPrice(value: number): string {
  return `${formatMoney(value)}${NBSP}₽`;
}

/** Количество: 7,1 без хвостовых нулей */
export function formatQty(value: number, precision = 1): string {
  const rounded = Number(value.toFixed(precision));
  return rounded.toLocaleString('ru-RU', { maximumFractionDigits: precision });
}

/**
 * Русские склонения: 1 тонна / 2 тонны / 5 тонн.
 * Без этого интерфейс сразу выдаёт машинный текст.
 */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(Math.round(n)) % 100;
  const tail = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (tail > 1 && tail < 5) return forms[1];
  if (tail === 1) return forms[0];
  return forms[2];
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}${NBSP}мин`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  const hLabel = plural(h, ['час', 'часа', 'часов']);
  return rest ? `${h}${NBSP}${hLabel} ${rest}${NBSP}мин` : `${h}${NBSP}${hLabel}`;
}
