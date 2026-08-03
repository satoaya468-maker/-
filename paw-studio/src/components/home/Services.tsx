import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { RevealGroup, RevealItem } from '@/lib/reveal';
import { services, type Service } from '@/data/services';
import { SectionHeading } from '@/components/ui/SectionHeading';

function ServiceCard({ service }: { service: Service }) {
  const IconComponent = service.icon;
  const price = formatPrice(service.priceFrom, !service.priceExact);

  if (service.featured) {
    return (
      <article
        className={cn(
          'flex h-full min-h-[15rem] flex-col rounded-card p-7 sm:p-8',
          service.tone === 'sage' ? 'bg-sage-100' : 'bg-beige-100',
        )}
      >
        <IconComponent size={30} weight="light" aria-hidden="true" className="text-sage-700" />
        {/* mt-auto стоит на строке с ценой, а не на заголовке: так заголовки
            карточек выравниваются между собой при разной длине описаний. */}
        <h3 className="heading-card pt-12 text-[1.25rem]">{service.title}</h3>
        <p className="text-small mt-2.5 max-w-[46ch] text-muted">{service.description}</p>
        <div className="mt-auto flex items-baseline justify-between gap-4 pt-7">
          <span className="price-figure font-medium">{price}</span>
          <span className="text-caption text-muted">{service.duration}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-6">
      <IconComponent size={24} weight="light" aria-hidden="true" className="text-sage-600" />
      <h3 className="heading-card pt-9 text-[1.0625rem]">{service.title}</h3>
      <p className="text-small mt-2 text-muted">{service.description}</p>
      <div className="mt-auto flex items-baseline justify-between gap-3 pt-6">
        <span className="price-figure text-small font-medium">{price}</span>
        <span className="text-caption text-muted">{service.duration}</span>
      </div>
    </article>
  );
}

export function Services() {
  return (
    <section id="uslugi" className="py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page">
        <SectionHeading
          title="Услуги"
          intro="Комплекс — базовый формат: в него уже входит всё, что нужно для чистоты и комфорта. Остальное добавляем по потребностям породы и шерсти."
        />
        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <RevealItem
              key={service.id}
              className={cn('h-full', service.featured && 'md:col-span-2')}
            >
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
