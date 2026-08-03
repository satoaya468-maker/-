import { Reveal } from '@/lib/reveal';
import { site } from '@/data/site';
import { faq } from '@/data/faq';
import { Accordion } from '@/components/ui/Accordion';

export function Faq() {
  return (
    <section id="voprosy" className="py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page grid gap-x-12 gap-y-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="heading-section">Частые вопросы</h2>
            <p className="text-small mt-5 max-w-[32ch] text-muted">
              Не нашли своего? Напишите в{' '}
              <a href={site.telegram} target="_blank" rel="noreferrer" className="link-accent">
                телеграм
              </a>{' '}
              или позвоните:{' '}
              <a href={site.phoneHref} className="link-quiet font-medium text-ink">
                {site.phone}
              </a>
            </p>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.06}>
          <Accordion items={faq} />
        </Reveal>
      </div>
    </section>
  );
}
