import { Link } from 'react-router-dom';
import { ArrowUpRight } from '@phosphor-icons/react';
import { formatDate } from '@/lib/format';
import { Reveal, RevealGroup, RevealItem } from '@/lib/reveal';
import { articles } from '@/data/articles';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SmartImage } from '@/components/ui/SmartImage';

export function Journal() {
  const [featured, ...rest] = articles;

  return (
    <section id="zhurnal" className="py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page">
        <SectionHeading
          title="Журнал"
          intro="Пишем то, что обычно объясняем голосом в зале: про шерсть, привычки и спорные решения в уходе."
        />

        <div className="mt-12 grid gap-x-12 gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <article>
              <Link to={`/zhurnal/${featured.slug}`} className="group block">
                <SmartImage
                  photo={featured.photo}
                  className="aspect-[4/3] rounded-media"
                  imgClassName="transition-transform duration-700 [transition-timing-function:var(--ease-out-strong)] group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 580px, 92vw"
                />
                <p className="text-caption mt-5 text-muted">
                  {featured.category} · {formatDate(featured.date)} · {featured.readingTime}
                </p>
                <h3 className="font-display mt-2.5 text-[clamp(1.375rem,1.1rem+1vw,1.75rem)] leading-[1.2] font-[540] tracking-[-0.015em] transition-colors duration-200 group-hover:text-sage-700">
                  {featured.title}
                </h3>
                <p className="mt-3 max-w-[52ch] text-muted">{featured.excerpt}</p>
              </Link>
            </article>
          </Reveal>

          <RevealGroup className="lg:col-span-5 lg:col-start-8" amount={0.1}>
            <ul className="border-t border-line">
              {rest.map((article) => (
                <li key={article.slug} className="border-b border-line">
                  <RevealItem>
                    <Link to={`/zhurnal/${article.slug}`} className="group flex gap-5 py-5">
                      <span className="min-w-0 flex-1">
                        <span className="text-caption block text-muted">
                          {article.category} · {article.readingTime}
                        </span>
                        <h3 className="mt-1.5 text-[1.0625rem] leading-snug font-semibold transition-colors duration-200 group-hover:text-sage-700">
                          {article.title}
                        </h3>
                      </span>
                      <ArrowUpRight
                        size={18}
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-muted transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:text-sage-700"
                      />
                    </Link>
                  </RevealItem>
                </li>
              ))}
            </ul>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
