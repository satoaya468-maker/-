import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { formatDate } from '@/lib/format';
import { Reveal } from '@/lib/reveal';
import { useLenis } from '@/lib/lenis';
import { articles, findArticle } from '@/data/articles';
import { SmartImage } from '@/components/ui/SmartImage';

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { scrollToSection } = useLenis();
  const article = slug ? findArticle(slug) : undefined;

  useEffect(() => {
    document.title = article ? `${article.title} — Paw Studio` : 'Журнал — Paw Studio';
  }, [article]);

  if (!article) {
    return (
      <div className="container-page py-[clamp(7rem,12vw,11rem)]">
        <h1 className="heading-section">Такой статьи нет</h1>
        <p className="text-lead mt-4 max-w-[46ch] text-muted">
          Возможно, адрес набран с опечаткой. Все материалы журнала собраны на главной странице.
        </p>
        <button
          type="button"
          onClick={() => scrollToSection('zhurnal')}
          className="btn btn-primary mt-8"
        >
          В журнал
        </button>
      </div>
    );
  }

  const others = articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <article className="pt-[104px] sm:pt-[124px]">
      <div className="container-page">
        <Reveal className="max-w-[46rem]">
          <button
            type="button"
            onClick={() => scrollToSection('zhurnal')}
            className="link-quiet text-small inline-flex items-center gap-1.5 text-muted"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Журнал
          </button>
          <h1 className="heading-display mt-5 text-[clamp(2rem,1.3rem+2.6vw,3rem)]">
            {article.title}
          </h1>
          <p className="text-caption mt-5 text-muted">
            {article.author} · {formatDate(article.date)} · {article.readingTime}
          </p>
        </Reveal>

        <Reveal className="mt-10" delay={0.06}>
          <SmartImage
            photo={article.photo}
            priority
            className="aspect-[16/9] rounded-media"
            sizes="(min-width: 1240px) 1160px, 92vw"
          />
        </Reveal>

        <div className="mt-12 max-w-[38rem]">
          {article.body.map((block, index) => {
            if (block.type === 'h') {
              return (
                <h2
                  key={index}
                  className="font-display mt-11 text-[1.5rem] leading-tight font-[540] tracking-[-0.014em] first:mt-0"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'list') {
              return (
                <ul key={index} className="mt-5 space-y-3">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-3.5 text-ink-soft">
                      <span
                        aria-hidden="true"
                        className="mt-[0.6875rem] h-1 w-1 shrink-0 rounded-full bg-sage-500"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'note') {
              return (
                <p
                  key={index}
                  className="mt-8 rounded-card bg-beige-100 p-6 text-[1rem] text-ink-soft"
                >
                  {block.text}
                </p>
              );
            }
            return (
              <p key={index} className="mt-5 text-ink-soft first:mt-0">
                {block.text}
              </p>
            );
          })}
        </div>

        <div className="hairline-t mt-16 pt-10 pb-[clamp(4rem,7vw,6rem)]">
          <h2 className="text-[1.0625rem] font-semibold">Читать дальше</h2>
          <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug}>
                <Link to={`/zhurnal/${item.slug}`} className="group block">
                  <span className="text-caption block text-muted">
                    {item.category} · {item.readingTime}
                  </span>
                  <h3 className="mt-1.5 text-[1.0625rem] leading-snug font-semibold transition-colors duration-200 group-hover:text-sage-700">
                    {item.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
