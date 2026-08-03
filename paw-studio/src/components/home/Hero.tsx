import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from '@/lib/reveal';
import { useLenis } from '@/lib/lenis';
import { photos } from '@/data/photos';
import { SmartImage } from '@/components/ui/SmartImage';

export function Hero() {
  const { scrollToSection } = useLenis();
  const reduce = useReducedMotion();

  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE_OUT },
        };

  return (
    <section className="pt-[104px] sm:pt-[124px]">
      <div className="container-page grid items-center gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          {/* Неразрывный пробел после предлога: «со» не должно висеть в конце строки. */}
          <motion.h1 className="heading-display max-w-[16ch]" {...enter(0)}>
            Груминг со&nbsp;спокойным характером
          </motion.h1>
          <motion.p className="text-lead mt-6 max-w-[44ch] text-muted" {...enter(0.09)}>
            Салон для собак и кошек на Патриарших: один мастер, отдельный зал и столько времени,
            сколько нужно вашему питомцу.
          </motion.p>
          <motion.div className="mt-9 flex flex-wrap items-center gap-3.5" {...enter(0.17)}>
            <button type="button" className="btn btn-primary" onClick={() => scrollToSection('zapis')}>
              Записаться
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => scrollToSection('uslugi')}
            >
              Услуги и цены
            </button>
          </motion.div>
        </div>

        <motion.figure
          className="lg:col-span-6 lg:pl-6"
          initial={reduce ? false : { opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease: EASE_OUT }}
        >
          <SmartImage
            photo={photos.hero}
            priority
            className="aspect-[4/5] rounded-media"
            sizes="(min-width: 1024px) 560px, 92vw"
          />
          <figcaption className="text-caption mt-3 text-muted">
            Ириска, 4 года. После комплексного ухода и недолгих уговоров
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
