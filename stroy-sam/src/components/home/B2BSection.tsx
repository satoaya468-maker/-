'use client';

import { useState } from 'react';
import { PhoneField } from '@/components/ui/PhoneField';
import { Button } from '@/components/ui/Button';
import { isValidPhone } from '@/lib/phone';

/**
 * Работа с юрлицами — последний конверсионный блок перед подвалом.
 *
 * Снабженцу нужно другое, чем частнику: отсрочка, документы, свой
 * менеджер. Форма просит телефон и, по желанию, ИНН — по нему менеджер
 * сам поднимет реквизиты и не будет диктовать их по телефону.
 */

const TERMS = [
  'Отсрочка платежа до 30 дней по договору',
  'УПД и счета-фактуры в день отгрузки',
  'Закреплённый менеджер и прямой номер',
  'Спецпрайс на объём от 100 тонн в месяц',
];

export function B2BSection() {
  const [phone, setPhone] = useState('');
  const [inn, setInn] = useState('');
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
        body: JSON.stringify({
          phone,
          source: 'callback',
          comment: inn ? `Юрлицо, ИНН ${inn}` : 'Запрос условий для юрлица',
          context: { inn },
        }),
      });
      if (!res.ok) throw new Error('bad status');
      setState('done');
    } catch {
      setState('error');
      setError('Не отправилось. Позвоните: +7 (3519) 55-04-04');
    }
  }

  return (
    <section id="b2b" className="shell scroll-mt-24 py-14 md:py-20">
      <div className="overflow-hidden rounded-2xl bg-graphite-950">
        <div className="on-dark grid gap-8 p-6 md:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-14">
          <div>
            <h2 className="section-title text-white">Снабжаете объект?</h2>
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-white/70 md:text-[16px]">
              Работаем с подрядчиками по договору: отсрочка, полный пакет
              документов и фиксированный прайс на месяц. Один менеджер ведёт
              все ваши объекты — не придётся каждый раз объяснять заново.
            </p>

            <ul className="mt-7 space-y-2.5">
              {TERMS.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14.5px] text-white/85">
                  <svg
                    viewBox="0 0 16 16"
                    className="mt-1 h-4 w-4 shrink-0 text-hv"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8.4l3.2 3.2L13 4.8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[14px] bg-white/[0.07] p-5 md:p-6">
            {state === 'done' ? (
              <div className="py-6 text-center">
                <p className="text-[17px] font-bold text-white">Заявка принята</p>
                <p className="mx-auto mt-2 max-w-[32ch] text-[14px] leading-relaxed text-white/70">
                  Менеджер по работе с юрлицами перезвонит в рабочее время
                  и пришлёт спецпрайс с условиями отсрочки.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="text-[17px] font-bold text-white">Получить спецпрайс</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/65">
                  Пришлём прайс с ценами под ваш объём и проект договора.
                </p>

                <div className="mt-4">
                  <PhoneField value={phone} onChange={setPhone} onDark label="Телефон" />
                </div>

                <div className="mt-3">
                  <label htmlFor="b2b-inn" className="mb-1.5 block text-[12px] font-semibold text-white/70">
                    ИНН <span className="font-normal text-white/45">— необязательно</span>
                  </label>
                  <input
                    id="b2b-inn"
                    inputMode="numeric"
                    value={inn}
                    onChange={(e) => setInn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Подставим реквизиты сами"
                    className="tnum h-12 w-full rounded-[10px] border border-white/20 bg-white/10 px-3.5 text-[15px] font-semibold text-white outline-none placeholder:font-normal placeholder:text-white/40 focus:border-hv"
                  />
                </div>

                {error && state !== 'sending' && (
                  <p role="alert" className="mt-2 text-[13px] font-medium text-hv">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={state === 'sending'} className="mt-4 w-full">
                  {state === 'sending' ? 'Отправляем…' : 'Запросить условия'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
