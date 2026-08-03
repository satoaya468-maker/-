import { RevealGroup, RevealItem } from '@/lib/reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const principles = [
  {
    title: 'Один мастер — один питомец',
    text: 'Никаких клеток и передержки: вы приводите к началу процедуры и забираете сразу после. В зале в это время только ваш питомец и его мастер.',
  },
  {
    title: 'Без седации и силовых методов',
    text: 'Работаем на доверии. Если животному тяжело, останавливаемся и делим уход на два коротких визита, и это нормально.',
  },
  {
    title: 'Косметика, как у заводчиков',
    text: 'Профессиональные линейки Iv San Bernard и Hydra, подобранные под тип шерсти. Никакого «универсального шампуня для всех».',
  },
  {
    title: 'Цена — до начала работы',
    text: 'Осмотр, оценка шерсти, фиксированная сумма. Если в процессе окажется сложнее, это наша забота, а не ваш сюрприз.',
  },
] as const;

export function Principles() {
  return (
    <section id="principy" className="py-[clamp(4rem,7vw,6.5rem)]">
      <div className="container-page">
        <SectionHeading title="Как у нас устроено" />
        <RevealGroup className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle) => (
            <RevealItem key={principle.title}>
              <div className="border-t border-line-strong pt-5">
                <h3 className="text-[1.0625rem] leading-snug font-semibold">{principle.title}</h3>
                <p className="text-small mt-2.5 text-muted">{principle.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
