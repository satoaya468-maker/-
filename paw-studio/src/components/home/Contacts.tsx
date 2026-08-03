import { ArrowUpRight } from '@phosphor-icons/react';
import { Reveal } from '@/lib/reveal';
import { useLenis } from '@/lib/lenis';
import { site } from '@/data/site';

export function Contacts() {
  const { scrollToSection } = useLenis();

  return (
    <section id="kontakty" className="py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <h2 className="heading-section">Контакты</h2>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-caption text-muted">Адрес</dt>
              <dd className="mt-1 text-[1.0625rem]">
                {site.city}, {site.address}
                <span className="text-small block text-muted">{site.addressNote}</span>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Часы работы</dt>
              <dd className="mt-1 text-[1.0625rem]">{site.hoursLabel}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Связь</dt>
              <dd className="mt-1 flex flex-col gap-1 text-[1.0625rem]">
                <a href={site.phoneHref} className="link-quiet font-medium">
                  {site.phone}
                </a>
                <a href={`mailto:${site.email}`} className="link-quiet">
                  {site.email}
                </a>
                <span className="mt-1 flex gap-4">
                  <a
                    href={site.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="link-accent text-small"
                  >
                    Телеграм
                  </a>
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="link-accent text-small"
                  >
                    Ватсап
                  </a>
                </span>
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.08}>
          <div className="flex h-full flex-col rounded-card bg-beige-100 p-7 sm:p-9">
            <h3 className="heading-card">Как добраться</h3>
            <ul className="mt-5 space-y-3">
              {site.metro.map((station) => (
                <li key={station.station} className="flex items-baseline justify-between gap-4">
                  <span>{station.station}</span>
                  <span className="text-small text-ink-soft">{station.walk}</span>
                </li>
              ))}
            </ul>
            <p className="text-small mt-6 max-w-[46ch] text-ink-soft">
              На машине удобнее заезжать со стороны Спиридоньевского переулка: во дворе есть
              два гостевых места, они закреплены за салоном. Вход со двора, к двери ведёт пандус,
              внутри лифта нет и не требуется.
            </p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <a
                href={site.routeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                Построить маршрут
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => scrollToSection('zapis')}
                className="btn btn-primary"
              >
                Записаться
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
