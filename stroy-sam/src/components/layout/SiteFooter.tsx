import { CATEGORIES } from '@/lib/catalog';
import { WAREHOUSE } from '@/lib/warehouse';
import { phoneHref } from '@/lib/phone';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark bg-graphite-950 pb-8 pt-12 text-white/70">
      <div className="shell">
        <div className="grid gap-8 border-b border-white/10 pb-9 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="display text-[20px] text-white">Строй Сам</p>
            <p className="mt-2.5 max-w-[32ch] text-[13.5px] leading-relaxed">
              Стройматериалы с собственной базы в Магнитогорске. Отгрузка
              день в день, доставка своим транспортом.
            </p>
          </div>

          <nav aria-label="Каталог">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-white">
              Каталог
            </h2>
            <ul className="space-y-2 text-[13.5px]">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <a href={`#cat-${c.id}`} className="transition-colors hover:text-hv">
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Покупателям">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-white">
              Покупателям
            </h2>
            <ul className="space-y-2 text-[13.5px]">
              <li>
                <a href="#calculator" className="transition-colors hover:text-hv">
                  Калькулятор сыпучки
                </a>
              </li>
              <li>
                <a href="#delivery" className="transition-colors hover:text-hv">
                  Доставка и зоны
                </a>
              </li>
              <li>
                <a href="#b2b" className="transition-colors hover:text-hv">
                  Юрлицам и подрядчикам
                </a>
              </li>
              <li>
                <a href="#catalog" className="transition-colors hover:text-hv">
                  Цены и наличие
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-white">
              База
            </h2>
            <address className="space-y-2 text-[13.5px] not-italic">
              <p>{WAREHOUSE.address}</p>
              <p>
                <a
                  href={phoneHref(WAREHOUSE.phone)}
                  className="tnum text-[17px] font-bold text-white transition-colors hover:text-hv"
                >
                  {WAREHOUSE.phone}
                </a>
              </p>
              <p className="tnum">
                Приём заявок {WAREHOUSE.hours.open}:00–{WAREHOUSE.hours.close}:00,
                без выходных
              </p>
            </address>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[12.5px]">
          <p>© {year} «Строй Сам». Не является публичной офертой.</p>
          <p className="text-white/45">
            Цены действительны на дату отгрузки и подтверждаются диспетчером.
          </p>
        </div>
      </div>
    </footer>
  );
}
