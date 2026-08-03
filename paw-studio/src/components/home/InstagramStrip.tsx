import { ArrowUpRight } from '@phosphor-icons/react';
import { Reveal } from '@/lib/reveal';
import { photos } from '@/data/photos';
import { site } from '@/data/site';
import { SmartImage } from '@/components/ui/SmartImage';

const feed = [photos.ig1, photos.ig2, photos.ig3, photos.ig4, photos.ig5, photos.ig6];

export function InstagramStrip() {
  return (
    <section id="instagram" aria-labelledby="instagram-title" className="py-[clamp(3rem,5vw,5rem)]">
      <div className="container-page">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="instagram-title" className="text-[1.0625rem] font-semibold">
            Каждый день в нашем зале
          </h2>
          <a
            href={`https://instagram.com/${site.instagramHandle.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="link-accent text-small inline-flex items-center gap-1"
          >
            {site.instagramHandle}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </Reveal>
      </div>

      <Reveal className="container-page" delay={0.05}>
        <ul className="-mr-[clamp(1.25rem,4.5vw,2.5rem)] mt-6 flex gap-2 overflow-x-auto pr-[clamp(1.25rem,4.5vw,2.5rem)] pb-2 [scrollbar-width:none] lg:mr-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pr-0 [&::-webkit-scrollbar]:hidden">
          {feed.map((photo) => (
            <li key={photo.key} className="w-[42vw] shrink-0 sm:w-[28vw] lg:w-auto">
              <SmartImage
                photo={photo}
                className="aspect-square rounded-[14px]"
                sizes="(min-width: 1024px) 190px, 42vw"
              />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
