import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { useLenis } from '@/lib/lenis';
import { navItems, site } from '@/data/site';
import { PawMark } from '@/components/ui/PawMark';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollToSection } = useLenis();
  const location = useLocation();
  const onHome = location.pathname === '/';

  // Смена состояния шапки без scroll-слушателей: наблюдаем страницу через сентинел.
  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.style.cssText =
      'position:absolute;top:0;left:0;height:96px;width:1px;pointer-events:none;';
    sentinel.setAttribute('aria-hidden', 'true');
    document.body.prepend(sentinel);
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300',
          scrolled || !onHome
            ? 'bg-bg/85 shadow-header backdrop-blur-md'
            : 'bg-transparent',
        )}
      >
        <div className="container-page flex h-[68px] items-center justify-between gap-6">
          <Link
            to="/"
            onClick={(e) => {
              if (onHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2.5"
            aria-label="Paw Studio — на главную"
          >
            <PawMark className="w-6 text-sage-600" />
            <span className="font-display text-[1.3125rem] font-[560] tracking-[-0.01em]">
              Paw Studio
            </span>
          </Link>

          <nav aria-label="Основная навигация" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="link-quiet text-small font-medium"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <a href={site.phoneHref} className="link-quiet text-small hidden font-medium xl:block">
              {site.phone}
            </a>
            <button
              type="button"
              onClick={() => scrollToSection('zapis')}
              className="btn btn-primary hidden h-11 px-6 lg:inline-flex"
            >
              Записаться
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню"
              aria-haspopup="dialog"
              className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface lg:hidden"
            >
              <List size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
