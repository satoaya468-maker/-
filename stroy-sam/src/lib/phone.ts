/**
 * Телефон — единственное обязательное поле во всех формах.
 * Значит, ввод должен прощать всё: пробелы, скобки, 8 вместо +7, копипаст.
 */

/** Только цифры, приведённые к 11-значному российскому номеру с ведущей 7 */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits.length === 10) digits = `7${digits}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  return digits.slice(0, 11);
}

/** Маска ввода: +7 (900) 123-45-67 */
export function formatPhone(raw: string): string {
  const d = normalizePhone(raw);
  const rest = d.slice(1);
  if (!rest) return '+7 ';
  let out = '+7 (';
  out += rest.slice(0, 3);
  if (rest.length >= 3) out += ') ';
  if (rest.length > 3) out += rest.slice(3, 6);
  if (rest.length > 6) out += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) out += `-${rest.slice(8, 10)}`;
  return out;
}

export function isValidPhone(raw: string): boolean {
  const d = normalizePhone(raw);
  // 7 + код оператора (9xx для мобильных, но берём шире — бывают городские)
  return d.length === 11 && /^7[3489]\d{9}$/.test(d);
}

export function phoneHref(raw: string): string {
  return `tel:+${normalizePhone(raw)}`;
}
