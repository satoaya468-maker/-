import { RevealGroup, RevealItem } from '@/lib/reveal';
import { team } from '@/data/team';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SmartImage } from '@/components/ui/SmartImage';

export function Team() {
  return (
    <section id="komanda" className="py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page">
        <SectionHeading
          title="Команда"
          intro="Четыре мастера, у каждого своя специализация. При записи можно попросить конкретного грумера: питомцы привыкают к рукам."
        />
        <RevealGroup className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <RevealItem key={member.name}>
              <article>
                <SmartImage
                  photo={member.photo}
                  className="aspect-[3/4] rounded-card"
                  sizes="(min-width: 1024px) 280px, (min-width: 640px) 44vw, 92vw"
                />
                <h3 className="mt-5 text-[1.125rem] leading-snug font-semibold">{member.name}</h3>
                {/* Минимальная высота держит специализацию и заметку на одной
                    линии во всех карточках, хотя должности разной длины.
                    В одну колонку карточки не сравнивают, поэтому только с sm. */}
                <p className="text-small mt-1 text-muted sm:min-h-[3rem]">
                  {member.role} · {member.experience}
                </p>
                <p className="text-small mt-2 font-medium text-sage-700 sm:min-h-[3rem]">
                  {member.focus}
                </p>
                <p className="text-caption mt-1 text-muted">{member.note}</p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
