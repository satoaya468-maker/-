import { Reveal } from '@/lib/reveal';
import { useLenis } from '@/lib/lenis';
import { photos } from '@/data/photos';
import { site } from '@/data/site';
import { SmartImage } from '@/components/ui/SmartImage';

export function Intro() {
  const { scrollToSection } = useLenis();

  return (
    <section id="salon" className="py-[clamp(5rem,9vw,8.5rem)]">
      <div className="container-page grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="font-display text-[clamp(1.4375rem,1.05rem+1.5vw,2rem)] leading-[1.4] font-[480] tracking-[-0.012em] text-ink">
            Мы открылись в {site.foundedYear}-м с одним правилом: питомцу здесь должно быть
            спокойнее, чем дома. С тех пор через наши руки прошло больше шести тысяч собак
            и кошек, а правило не изменилось. У мастера всегда есть запас времени,
            у животного всегда есть право на паузу.
          </p>
          <p className="text-small mt-8 text-muted">
            {site.rating.value} на {site.rating.source} · {site.rating.reviews} отзывов ·{' '}
            <button
              type="button"
              onClick={() => scrollToSection('otzyvy')}
              className="link-accent"
            >
              читать
            </button>
          </p>
        </Reveal>
        <Reveal className="lg:col-span-4 lg:col-start-9 lg:translate-y-10" delay={0.1}>
          <SmartImage
            photo={photos.introPets}
            className="aspect-[4/5] rounded-media"
            sizes="(min-width: 1024px) 350px, (min-width: 640px) 60vw, 92vw"
          />
        </Reveal>
      </div>
    </section>
  );
}
