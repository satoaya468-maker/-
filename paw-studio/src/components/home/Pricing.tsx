import { formatPrice } from '@/lib/format';
import { Reveal, RevealGroup, RevealItem } from '@/lib/reveal';
import { useLenis } from '@/lib/lenis';
import { priceGroups, pricingNotes } from '@/data/pricing';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Pricing() {
  const { scrollToSection } = useLenis();

  return (
    <section id="ceny" className="py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page">
        <SectionHeading
          title="Цены"
          intro="Стоимость зависит от веса, типа шерсти и её состояния. Ниже рабочие цифры, по которым мы записываем. Точную сумму называем после осмотра."
        />

        <RevealGroup className="mt-12 grid gap-x-10 gap-y-12 lg:grid-cols-3" amount={0.1}>
          {priceGroups.map((group) => (
            <RevealItem key={group.title}>
              <h3 className="text-[1.0625rem] font-semibold">{group.title}</h3>
              <dl className="mt-4">
                {group.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 border-b border-line py-3.5 last:border-b-0"
                  >
                    <dt>
                      <span className="text-small">{row.label}</span>
                      {row.hint && (
                        <span className="text-caption mt-0.5 block text-muted">{row.hint}</span>
                      )}
                    </dt>
                    <dd className="price-figure text-small shrink-0 font-medium whitespace-nowrap">
                      {formatPrice(row.price, row.from)}
                    </dd>
                  </div>
                ))}
              </dl>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-12 rounded-card bg-beige-100 p-7 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <ul className="max-w-[62ch] space-y-2.5">
              {pricingNotes.map((note) => (
                <li key={note} className="text-small text-ink-soft">
                  {note}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => scrollToSection('zapis')}
              className="btn btn-primary shrink-0 self-start lg:self-auto"
            >
              Записаться
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
