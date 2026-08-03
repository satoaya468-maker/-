import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/lib/reveal';
import { site } from '@/data/site';
import { testimonials } from '@/data/testimonials';

export function Testimonials() {
  const trackRef = useRef<HTMLUListElement>(null);
  const startRef = useRef<HTMLLIElement>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Края ленты определяем наблюдателем, а не слушателем скролла.
  useEffect(() => {
    const root = trackRef.current;
    const first = startRef.current;
    const last = endRef.current;
    if (!root || !first || !last) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === first) setAtStart(entry.isIntersecting);
          if (entry.target === last) setAtEnd(entry.isIntersecting);
        }
      },
      { root, threshold: 0.9 },
    );
    observer.observe(first);
    observer.observe(last);
    return () => observer.disconnect();
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  return (
    <section id="otzyvy" className="overflow-hidden py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[34rem]">
            <h2 className="heading-section">Что говорят владельцы</h2>
            <p className="text-lead mt-4 text-muted">
              {site.rating.value} на {site.rating.source}, {site.rating.reviews} отзывов. Здесь
              несколько из тех, что мы перечитываем в тяжёлые дни.
            </p>
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label="Предыдущий отзыв"
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface transition-[opacity,border-color] duration-200',
                atStart ? 'opacity-35' : 'hover:border-ink/40',
              )}
            >
              <ArrowLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label="Следующий отзыв"
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface transition-[opacity,border-color] duration-200',
                atEnd ? 'opacity-35' : 'hover:border-ink/40',
              )}
            >
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* Лента выровнена по сетке страницы слева и уходит под правый край экрана. */}
      <Reveal className="container-page" delay={0.05}>
        <ul
          ref={trackRef}
          tabIndex={0}
          aria-label="Лента отзывов, прокручивается стрелками"
          className="-mr-[clamp(1.25rem,4.5vw,2.5rem)] mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pr-[clamp(1.25rem,4.5vw,2.5rem)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((review, index) => (
            <li
              key={review.author + review.pet}
              ref={index === 0 ? startRef : index === testimonials.length - 1 ? endRef : undefined}
              className="w-[min(21.5rem,82vw)] shrink-0 snap-start"
            >
              <figure className="flex h-full flex-col rounded-card border border-line bg-surface p-6">
                <blockquote className="text-[1rem] leading-[1.6] text-ink-soft">
                  «{review.text}».
                </blockquote>
                <figcaption className="mt-auto pt-6">
                  <span className="text-small block font-semibold">{review.author}</span>
                  <span className="text-caption mt-0.5 block text-muted">{review.pet}</span>
                  <span className="text-caption mt-2.5 block text-sage-700">{review.source}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
