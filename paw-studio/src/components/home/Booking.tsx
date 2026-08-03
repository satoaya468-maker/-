import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CaretDown, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { EASE_OUT, Reveal } from '@/lib/reveal';
import { formatPhone, isCompletePhone } from '@/lib/format';
import { services } from '@/data/services';
import { site } from '@/data/site';

type PetKind = 'dog' | 'cat';

interface FormValues {
  name: string;
  phone: string;
  pet: PetKind;
  breed: string;
  weight: string;
  service: string;
  date: string;
  comment: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = {
  name: '',
  phone: '',
  pet: 'dog',
  breed: '',
  weight: '',
  service: '',
  date: '',
  comment: '',
};

function validate(values: FormValues, today: string): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Напишите, как к вам обращаться';
  if (!isCompletePhone(values.phone)) errors.phone = 'Нужен полный номер: +7 и десять цифр';
  if (!values.service) errors.service = 'Выберите услугу: это поможет рассчитать время';
  if (values.date && values.date < today) errors.date = 'Эта дата уже прошла';
  return errors;
}

export function Booking() {
  const fieldId = useId();
  const reduce = useReducedMotion();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values, today);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    // Заглушка отправки: подключается к CRM салона на этапе интеграции.
    window.setTimeout(() => setStatus('sent'), 700);
  };

  const id = (name: string) => `${fieldId}-${name}`;
  const err = (name: keyof FormValues) => errors[name];

  return (
    <section id="zapis" className="bg-sage-900 py-[clamp(4.5rem,7vw,7rem)] text-beige-50">
      <div className="container-page grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5 lg:self-center">
          <h2 className="heading-section text-beige-50">Запись онлайн</h2>
          <p className="text-lead mt-4 max-w-[38ch] text-sage-100">
            Оставьте заявку, и мы перезвоним в течение рабочего дня: подберём время
            и мастера под характер питомца.
          </p>
          <dl className="mt-10 space-y-5 text-sage-100">
            <div>
              <dt className="text-caption text-sage-200">Телефон</dt>
              <dd className="mt-1">
                <a href={site.phoneHref} className="text-[1.0625rem] font-medium text-beige-50">
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-sage-200">Часы работы</dt>
              <dd className="mt-1 text-[1.0625rem]">{site.hoursLabel}</dd>
            </div>
            <div>
              <dt className="text-caption text-sage-200">Адрес</dt>
              <dd className="mt-1 text-[1.0625rem]">
                {site.city}, {site.address}
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.08}>
          <div className="rounded-card bg-surface p-6 text-ink sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'sent' ? (
                <motion.div
                  key="done"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="flex min-h-[26rem] flex-col items-start justify-center"
                  role="status"
                  aria-live="polite"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-700">
                    <Check size={22} weight="bold" aria-hidden="true" />
                  </span>
                  <h3 className="heading-section mt-6 text-[1.75rem]">Заявка принята</h3>
                  <p className="mt-3 max-w-[42ch] text-muted">
                    {values.name.trim()}, мы получили заявку и перезвоним на{' '}
                    <span className="whitespace-nowrap">{values.phone}</span> в рабочее время.
                    Если удобнее переписка, напишите нам в{' '}
                    <a
                      href={site.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="link-accent"
                    >
                      телеграм
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary mt-8"
                    onClick={() => {
                      setValues(EMPTY);
                      setStatus('idle');
                    }}
                  >
                    Оставить ещё одну заявку
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  onSubmit={onSubmit}
                  noValidate
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-x-5 gap-y-5 sm:grid-cols-2"
                >
                  <div>
                    <label className="field-label" htmlFor={id('name')}>
                      Имя
                    </label>
                    <input
                      id={id('name')}
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Анна"
                      className="field-control"
                      value={values.name}
                      onChange={(e) => set('name', e.target.value)}
                      aria-invalid={Boolean(err('name'))}
                      aria-describedby={err('name') ? id('name-error') : undefined}
                    />
                    {err('name') && (
                      <p className="field-error" id={id('name-error')}>
                        {err('name')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="field-label" htmlFor={id('phone')}>
                      Телефон
                    </label>
                    <input
                      id={id('phone')}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+7 (900) 000-00-00"
                      className="field-control"
                      value={values.phone}
                      onChange={(e) => set('phone', formatPhone(e.target.value))}
                      aria-invalid={Boolean(err('phone'))}
                      aria-describedby={err('phone') ? id('phone-error') : undefined}
                    />
                    {err('phone') && (
                      <p className="field-error" id={id('phone-error')}>
                        {err('phone')}
                      </p>
                    )}
                  </div>

                  <fieldset className="sm:col-span-2">
                    <legend className="field-label">Питомец</legend>
                    <div className="flex gap-2">
                      {(
                        [
                          { value: 'dog', label: 'Собака' },
                          { value: 'cat', label: 'Кошка' },
                        ] as const
                      ).map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            'flex h-11 flex-1 cursor-pointer items-center justify-center rounded-field border text-[0.9375rem] transition-colors duration-150',
                            values.pet === option.value
                              ? 'border-sage-600 bg-sage-50 font-medium text-sage-700'
                              : 'border-line-strong text-ink-soft hover:border-[#c3bfb2]',
                          )}
                        >
                          <input
                            type="radio"
                            name="pet"
                            value={option.value}
                            checked={values.pet === option.value}
                            onChange={() => set('pet', option.value)}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label className="field-label" htmlFor={id('breed')}>
                      Порода <span className="font-normal text-muted">(если знаете)</span>
                    </label>
                    <input
                      id={id('breed')}
                      name="breed"
                      type="text"
                      placeholder={values.pet === 'cat' ? 'мейн-кун' : 'шпиц'}
                      className="field-control"
                      value={values.breed}
                      onChange={(e) => set('breed', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor={id('weight')}>
                      Вес, кг <span className="font-normal text-muted">(примерно)</span>
                    </label>
                    <input
                      id={id('weight')}
                      name="weight"
                      type="text"
                      inputMode="decimal"
                      placeholder="4,5"
                      className="field-control"
                      value={values.weight}
                      onChange={(e) => set('weight', e.target.value.replace(/[^\d.,]/g, ''))}
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor={id('service')}>
                      Услуга
                    </label>
                    <div className="relative">
                      <select
                        id={id('service')}
                        name="service"
                        className="field-control appearance-none pr-10"
                        value={values.service}
                        onChange={(e) => set('service', e.target.value)}
                        aria-invalid={Boolean(err('service'))}
                        aria-describedby={err('service') ? id('service-error') : undefined}
                      >
                        <option value="">Выберите услугу</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.title}>
                            {service.title}
                          </option>
                        ))}
                        <option value="Не знаю, нужен совет">Не знаю, нужен совет</option>
                      </select>
                      <CaretDown
                        size={16}
                        weight="bold"
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted"
                      />
                    </div>
                    {err('service') && (
                      <p className="field-error" id={id('service-error')}>
                        {err('service')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="field-label" htmlFor={id('date')}>
                      Желаемая дата
                    </label>
                    <input
                      id={id('date')}
                      name="date"
                      type="date"
                      min={today}
                      className="field-control"
                      value={values.date}
                      onChange={(e) => set('date', e.target.value)}
                      aria-invalid={Boolean(err('date'))}
                      aria-describedby={err('date') ? id('date-error') : undefined}
                    />
                    {err('date') && (
                      <p className="field-error" id={id('date-error')}>
                        {err('date')}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor={id('comment')}>
                      Комментарий <span className="font-normal text-muted">(необязательно)</span>
                    </label>
                    <textarea
                      id={id('comment')}
                      name="comment"
                      rows={3}
                      placeholder="Боится фена, есть колтуны за ушами, стрижёмся впервые"
                      className="field-control resize-y"
                      value={values.comment}
                      onChange={(e) => set('comment', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      className="btn btn-primary shrink-0"
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
                    </button>
                    <p className="text-caption text-muted">
                      Нажимая кнопку, вы соглашаетесь с{' '}
                      <a href="/politika" className="link-accent">
                        политикой обработки данных
                      </a>
                      .
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
