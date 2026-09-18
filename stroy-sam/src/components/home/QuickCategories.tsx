import { CATEGORIES } from '@/lib/catalog';
import { MaterialArt } from '@/components/art/MaterialArt';

/**
 * Быстрые категории сразу под баннером.
 *
 * Сетка намеренно неравномерная: три ходовые позиции (сыпучка, смеси,
 * блоки) занимают крупные плитки, остальные — узкие. Ровная сетка
 * одинаковых карточек не расставляет приоритетов, а здесь 80 % заказов
 * приходится на первые три.
 */

export function QuickCategories() {
  const featured = CATEGORIES.filter((c) => c.featured);
  const rest = CATEGORIES.filter((c) => !c.featured);

  return (
    <section aria-labelledby="cats-title" className="shell -mt-6 pb-4 md:-mt-10">
      <h2 id="cats-title" className="sr-only">
        Категории материалов
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            className="group relative overflow-hidden rounded-[14px] bg-surface shadow-e2 transition-[box-shadow,transform] duration-200 ease-out-quart hover:-translate-y-0.5 hover:shadow-e3"
          >
            <div className="relative h-[124px] overflow-hidden border-b border-line md:h-[140px]">
              <MaterialArt
                kind={c.art}
                seed={`cat-${c.id}`}
                className="h-full w-full transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex items-end justify-between gap-3 p-4">
              <div className="min-w-0">
                <h3 className="text-[16px] font-bold leading-tight text-ink">{c.title}</h3>
                <p className="mt-1 truncate text-[12.5px] text-ink-muted">{c.examples}</p>
              </div>
              <span className="tnum shrink-0 rounded-md bg-surface-sunk px-2 py-1 text-[12.5px] font-bold text-ink">
                от {c.fromPrice.toLocaleString('ru-RU')} ₽/{c.fromUnit}
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {rest.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            className="group flex items-center gap-4 overflow-hidden rounded-[14px] bg-surface p-3 shadow-e1 transition-[box-shadow] duration-200 hover:shadow-e2"
          >
            <span className="h-[62px] w-[86px] shrink-0 overflow-hidden rounded-[9px] border border-line">
              <MaterialArt kind={c.art} seed={`cat-${c.id}`} className="h-full w-full" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-tight text-ink">{c.title}</span>
              <span className="mt-0.5 block truncate text-[12.5px] text-ink-muted">{c.examples}</span>
            </span>
            <span className="tnum shrink-0 pr-1 text-[12.5px] font-bold text-ink-muted">
              от {c.fromPrice.toLocaleString('ru-RU')} ₽
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
