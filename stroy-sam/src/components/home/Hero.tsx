'use client';

import { useState } from 'react';
import { HeroBackdrop } from '@/components/art/HeroBackdrop';
import { PhoneField } from '@/components/ui/PhoneField';
import { Button } from '@/components/ui/Button';
import { isValidPhone } from '@/lib/phone';

/**
 * Главный экран.
 *
 * Одна мысль на первый экран: «привезём сегодня, посчитаем сами».
 * Форма стоит прямо в герое и просит ровно одно поле — телефон.
 * Каждое лишнее поле здесь стоит процентов конверсии, а имя и объём
 * менеджер спросит голосом за десять секунд.
 */

export function Hero() {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError('Проверьте номер — нужно 10 цифр после +7');
      return;
    }
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, source: 'hero' }),
      });
      if (!res.ok) throw new Error('bad status');
      setState('done');
    } catch {
      setState('error');
      setError('Не отправилось. Позвоните напрямую: +7 (3519) 55-04-04');
    }
  }

  return (
    <section id="top" className="on-dark relative isolate overflow-hidden bg-graphite-950">
      <div className="absolute inset-0 -z-10">
        <HeroBackdrop className="h-full w-full object-cover" />
        {/* Читаемость текста поверх сцены: затемнение слева, где стоит заголовок */}
        <div className="absolute inset-0 bg-gradient-to-r from-graphite-950 via-graphite-950/85 to-graphite-950/35" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-graphite-950 to-transparent" />
      </div>

      <div className="shell relative py-12 md:py-20 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-14">
          <div className="rise">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-hv px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-wide text-hv-ink">
              Своя база · свои самосвалы
            </p>

            {/* Без жёстких <br>: на 360 px они рвут строку в неудобном месте.
                Балансировку строк делает text-wrap: balance из globals.css. */}
            <h1
              className="display text-white"
              style={{ fontSize: 'clamp(2.35rem, 1.2rem + 5vw, 5rem)' }}
            >
              Щебень, песок, цемент — на объект{' '}
              <span className="text-hv">за 30 минут</span>
            </h1>

            <p className="mt-6 max-w-[54ch] text-[16px] leading-relaxed text-white/75 md:text-[18px]">
              База на Западном шоссе. Отгружаем с 7:00, считаем объём и вес за вас,
              возим по Магнитогорску и области. Работаем с физлицами и по безналу
              с НДС.
            </p>

            <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[14px] font-medium text-white/80">
              <li className="flex items-center gap-2">
                <Tick /> Доставка от 30 минут
              </li>
              <li className="flex items-center gap-2">
                <Tick /> Скидка на объём от 5 тонн
              </li>
              <li className="flex items-center gap-2">
                <Tick /> Недовес компенсируем
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalog"
                className="inline-flex h-12 items-center justify-center rounded-[10px] bg-hv px-6 text-[15px] font-bold text-hv-ink transition-colors hover:bg-hv-deep md:h-[52px]"
              >
                Смотреть цены и наличие
              </a>
              <a
                href="#calculator"
                className="inline-flex h-12 items-center justify-center rounded-[10px] border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10 md:h-[52px]"
              >
                Посчитать объём
              </a>
            </div>
          </div>

          {/* Лид-форма. Отдельная плоскость над сценой — самый верхний слой. */}
          <div className="rise rounded-2xl bg-surface p-5 shadow-e4 md:p-6" style={{ animationDelay: '90ms' }}>
            {state === 'done' ? (
              <div className="py-4 text-center">
                <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-stock/10">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-stock" aria-hidden="true">
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h2 className="text-[19px] font-bold text-ink">Заявка принята</h2>
                <p className="mx-auto mt-2 max-w-[34ch] text-[14px] text-ink-muted">
                  Диспетчер перезвонит в течение 15 минут, посчитает объём
                  и назовёт время подачи машины.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setState('idle');
                    setPhone('');
                  }}
                  className="mt-5 text-[14px] font-semibold text-ink underline underline-offset-4"
                >
                  Оставить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 className="text-[20px] font-bold leading-tight text-ink">
                  Посчитаем и привезём сегодня
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                  Оставьте номер — перезвоним за 15 минут, посчитаем тоннаж
                  по вашим размерам и назовём цену с доставкой.
                </p>

                <div className="mt-5">
                  <PhoneField value={phone} onChange={setPhone} label="Ваш телефон" />
                </div>

                {error && state !== 'sending' && (
                  <p role="alert" className="mt-2 text-[13px] font-medium text-danger">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={state === 'sending'}
                  className="mt-4 w-full"
                >
                  {state === 'sending' ? 'Отправляем…' : 'Получить расчёт'}
                </Button>

                <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                  Звоним один раз — рассылок не делаем.
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <span className="text-[13px] text-ink-muted">Нужно прямо сейчас?</span>
                  <a
                    href="tel:+73519550404"
                    className="tnum text-[15px] font-bold text-ink underline underline-offset-4"
                  >
                    +7 (3519) 55-04-04
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-hv" aria-hidden="true">
      <path
        d="M3 8.4l3.2 3.2L13 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
