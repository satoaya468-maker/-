import { RevealGroup, RevealItem } from '@/lib/reveal';
import { comparePairs } from '@/data/gallery';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CompareSlider } from '@/components/ui/CompareSlider';

export function BeforeAfter() {
  return (
    <section id="raboty" className="py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page">
        <SectionHeading
          title="До и после"
          intro="Разницу лучше показывать, чем описывать. Потяните разделитель: слева — как приходят, справа — как уходят."
        />
        <RevealGroup className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {comparePairs.map((pair) => (
            <RevealItem key={pair.photo.key}>
              <CompareSlider photo={pair.photo} caption={pair.caption} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
