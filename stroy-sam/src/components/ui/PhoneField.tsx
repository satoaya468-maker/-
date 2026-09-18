'use client';

import { useId, useState, type ChangeEvent } from 'react';
import { formatPhone, isValidPhone } from '@/lib/phone';

/**
 * Поле телефона. Единственное обязательное поле во всех формах портала.
 *
 * Метка всегда видима (placeholder-only — провал доступности), ошибка
 * показывается только после того, как поле покинули: подсвечивать
 * «неверный номер» на втором введённом символе — это враждебно.
 */

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  /** Компактный вид для узких карточек */
  compact?: boolean;
  onDark?: boolean;
  autoFocus?: boolean;
  name?: string;
}

export function PhoneField({
  value,
  onChange,
  label = 'Телефон',
  compact = false,
  onDark = false,
  autoFocus = false,
  name = 'phone',
}: PhoneFieldProps) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const invalid = touched && value.replace(/\D/g, '').length > 1 && !isValidPhone(value);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(formatPhone(e.target.value));
  }

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className={`mb-1.5 block text-[12px] font-semibold ${
          onDark ? 'text-white/70' : 'text-ink-muted'
        }`}
      >
        {label} <span aria-hidden="true">*</span>
        <span className="sr-only">(обязательное поле)</span>
      </label>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        autoFocus={autoFocus}
        required
        value={value}
        onChange={handleChange}
        onFocus={() => !value && onChange('+7 ')}
        onBlur={() => setTouched(true)}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-err` : undefined}
        placeholder="+7 (900) 123-45-67"
        className={`tnum w-full rounded-[10px] border px-3.5 font-semibold outline-none transition-colors ${
          compact ? 'h-11 text-[15px]' : 'h-12 text-[16px] md:h-[52px]'
        } ${
          onDark
            ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-hv'
            : 'border-line-strong bg-surface text-ink placeholder:text-ink-faint focus:border-graphite-950'
        } ${invalid ? '!border-danger' : ''}`}
      />
      {invalid && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[12px] font-medium text-danger">
          Проверьте номер — нужно 10 цифр после +7
        </p>
      )}
    </div>
  );
}
