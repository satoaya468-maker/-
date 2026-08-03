/**
 * Неразрывный пробел (U+00A0) для разрядов, знака рубля и дат.
 * Узкий U+202F в Golos Text слишком тесен: «2 500» читается как «2500».
 */
const NBSP = ' ';

/** «3500» → «3 500 ₽»; from=true → «от 3 500 ₽». */
export function formatPrice(value: number, from = false): string {
  const grouped = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${from ? `от${NBSP}` : ''}${grouped}${NBSP}₽`;
}

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

/** «2026-03-21» → «21 марта 2026». */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}${NBSP}${MONTHS_GENITIVE[m - 1]} ${y}`;
}

/** Оставляет только цифры телефона, нормализуя 8 → 7. */
export function phoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  return digits.slice(0, 11);
}

/** Форматирует ввод как +7 (9xx) xxx-xx-xx по мере набора. */
export function formatPhone(raw: string): string {
  const d = phoneDigits(raw);
  if (d.length <= 1) return d.length ? '+7 ' : '';
  const rest = d.slice(1);
  let out = '+7';
  out += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) out += ')';
  if (rest.length > 3) out += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) out += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) out += `-${rest.slice(8, 10)}`;
  return out;
}

export function isCompletePhone(raw: string): boolean {
  return phoneDigits(raw).length === 11;
}
