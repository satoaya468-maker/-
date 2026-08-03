import { Link } from 'react-router-dom';
import { useLenis } from '@/lib/lenis';
import { site } from '@/data/site';
import { articles } from '@/data/articles';
import { PawMark } from '@/components/ui/PawMark';

const salonLinks = [
  { id: 'uslugi', label: 'Услуги' },
  { id: 'ceny', label: 'Цены' },
  { id: 'raboty', label: 'До и после' },
  { id: 'komanda', label: 'Команда' },
  { id: 'voprosy', label: 'Частые вопросы' },
] as const;

export function Footer() {
  const { scrollToSection } = useLenis();
  const year = new Date().getFullYear();

  return (
    <footer className="hairline-t bg-surface">
      <div className="container-page pt-14 pb-10 sm:pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:gap-8">
          <div>
            <span className="flex items-center gap-2.5">
              <PawMark className="w-6 text-sage-600" />
              <span className="font-display text-[1.3125rem] font-[560] tracking-[-0.01em]">
                Paw Studio
              </span>
            </span>
            <p className="text-small mt-4 max-w-[30ch] text-muted">
              Салон груминга для собак и кошек. Работаем с {site.foundedYear} года: без клеток,
              без спешки, без седации.
            </p>
          </div>

          <nav aria-label="Разделы сайта">
            <h2 className="text-small font-semibold">Салон</h2>
            <ul className="mt-4 space-y-2.5">
              {salonLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="link-quiet text-small text-muted"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Журнал">
            <h2 className="text-small font-semibold">Журнал</h2>
            <ul className="mt-4 space-y-2.5">
              {articles.slice(0, 3).map((article) => (
                <li key={article.slug}>
                  <Link
                    to={`/zhurnal/${article.slug}`}
                    className="link-quiet text-small block max-w-[34ch] text-muted"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('zhurnal')}
                  className="link-accent text-small"
                >
                  Все статьи
                </button>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-small font-semibold">Контакты</h2>
            <ul className="text-small mt-4 space-y-2.5 text-muted">
              <li>
                {site.city}, {site.address}
              </li>
              <li>{site.hoursLabel}</li>
              <li>
                <a href={site.phoneHref} className="link-quiet font-medium text-ink">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="link-quiet">
                  {site.email}
                </a>
              </li>
              <li className="flex gap-4 pt-1">
                <a href={site.telegram} rel="noreferrer" target="_blank" className="link-accent">
                  Телеграм
                </a>
                <a href={site.whatsapp} rel="noreferrer" target="_blank" className="link-accent">
                  Ватсап
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline-t text-caption mt-12 flex flex-col gap-3 pt-6 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.foundedYear}–{year} Paw Studio
          </p>
          <p>
            {site.legal.entity} · {site.legal.ogrnip} · {site.legal.inn}
          </p>
          <Link to="/politika" className="link-quiet underline underline-offset-2">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}
