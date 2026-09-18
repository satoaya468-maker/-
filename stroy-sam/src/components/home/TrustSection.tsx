/**
 * Блок доверия. Работает против единственного страха снабженца:
 * недовезут, обвесят, подсунут не ту фракцию — и объект встанет.
 *
 * Поэтому здесь не «ценности компании», а четыре обязательства, каждое
 * из которых проверяемо на выгрузке.
 */

const PROMISES = [
  {
    title: 'Вес по талону',
    body: 'Каждая машина проходит сертифицированные весы на базе. Талон едет с водителем — сверяйте на месте.',
  },
  {
    title: 'Недовес компенсируем',
    body: 'Разница больше 200 кг — довозим за свой счёт или возвращаем деньги за недостачу в тот же день.',
  },
  {
    title: 'Фракция как в заявке',
    body: 'Паспорт качества на щебень и цемент по запросу. Привезли не то — забираем и меняем без спора.',
  },
  {
    title: 'Цена не растёт после звонка',
    body: 'Сумма, названная диспетчером, фиксируется на 3 дня. Доплат за подачу и простой под выгрузкой нет.',
  },
];

export function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="shell py-14 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div>
          <h2 id="trust-title" className="section-title text-ink">
            Что мы гарантируем письменно
          </h2>
          <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-ink-muted md:text-[16px]">
            Четыре обязательства, которые вписаны в договор и которые можно
            проверить прямо на выгрузке. Работаем с 2014 года, свой парк
            и своя база — между вами и материалом нет посредника.
          </p>

          <dl className="tnum mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6">
            <div>
              <dt className="text-[13px] text-ink-muted">Отгружаем в сутки</dt>
              <dd className="display mt-1 text-[30px] text-ink">до 400 т</dd>
            </div>
            <div>
              <dt className="text-[13px] text-ink-muted">Постоянных клиентов</dt>
              <dd className="display mt-1 text-[30px] text-ink">340+</dd>
            </div>
          </dl>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-[14px] bg-line sm:grid-cols-2">
          {PROMISES.map((p) => (
            <li key={p.title} className="bg-surface p-5">
              <h3 className="text-[15.5px] font-bold leading-tight text-ink">{p.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
