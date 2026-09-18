import { DELIVERY_ZONES, TRUCKS, WAREHOUSE } from '@/lib/warehouse';
import { phoneHref } from '@/lib/phone';

/**
 * Доставка и база. Отвечает на два вопроса, которые задают в каждом
 * звонке: «когда привезёте» и «откуда вы вообще».
 */

export function DeliverySection() {
  return (
    <section id="delivery" className="scroll-mt-24 bg-surface-sunk py-14 md:py-20">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <h2 className="section-title text-ink">Доставка от базы</h2>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-muted md:text-[16px]">
              {WAREHOUSE.address}. Выезд по кольцу на Западном шоссе — до
              большинства площадок города меньше получаса.
            </p>

            <ul className="mt-6 overflow-hidden rounded-[14px] bg-surface shadow-e1">
              {DELIVERY_ZONES.map((z) => (
                <li
                  key={z.id}
                  className="flex items-center justify-between gap-4 border-b border-line px-4 py-3.5 last:border-0"
                >
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-semibold text-ink">{z.title}</span>
                    <span className="block text-[12.5px] text-ink-muted">{z.eta}</span>
                  </span>
                  <span className="shrink-0 text-[13.5px] font-bold text-ink">{z.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[17px] font-bold text-ink">Свой парк</h3>
            <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-ink-muted">
              Не зависим от наёмных перевозчиков: машину под заявку ставим
              сами, поэтому и время подачи называем точно.
            </p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {TRUCKS.map((t) => (
                <li key={t.id} className="rounded-[12px] bg-surface p-4 shadow-e1">
                  <p className="tnum display text-[26px] leading-none text-ink">{t.capacity} т</p>
                  <p className="mt-1.5 text-[13px] font-semibold text-ink">{t.title}</p>
                  <p className="tnum mt-0.5 text-[12.5px] text-ink-muted">кузов {t.volume} м³</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-[14px] bg-graphite-950 p-5">
              <p className="text-[15px] font-bold text-white">Нужен точный расчёт доставки?</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/70">
                Назовите адрес объекта и объём — диспетчер посчитает подачу
                и назовёт время машины.
              </p>
              <a
                href={phoneHref(WAREHOUSE.phone)}
                className="tnum mt-4 inline-flex h-11 items-center justify-center rounded-[10px] bg-hv px-5 text-[15px] font-bold text-hv-ink transition-colors hover:bg-hv-deep"
              >
                {WAREHOUSE.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
