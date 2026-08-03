import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Шапка (68px) перекрывает верхний отступ секции, а не её содержимое:
 * у всех секций padding-top не меньше 64px, поэтому заголовок остаётся
 * видимым, а посадка после перехода по якорю получается плотной.
 */
const HEADER_OFFSET = 44;

interface LenisApi {
  /** Плавно прокручивает к секции по id; с другой страницы сначала возвращает на главную. */
  scrollToSection: (id: string) => void;
  stop: () => void;
  start: () => void;
}

const LenisContext = createContext<LenisApi | null>(null);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.11, autoRaf: true });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollNow = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -HEADER_OFFSET, duration: 1.1 });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      if (pathRef.current === '/') {
        scrollNow(id);
      } else {
        navigate('/', { state: { scrollTo: id } });
      }
    },
    [navigate, scrollNow],
  );

  // После перехода на главную из другой страницы докручиваем до запрошенной секции.
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (location.pathname === '/' && state?.scrollTo) {
      const id = state.scrollTo;
      navigate('/', { replace: true, state: null });
      requestAnimationFrame(() => requestAnimationFrame(() => scrollNow(id)));
    }
  }, [location, navigate, scrollNow]);

  const api: LenisApi = {
    scrollToSection,
    stop: () => lenisRef.current?.stop(),
    start: () => lenisRef.current?.start(),
  };

  return <LenisContext.Provider value={api}>{children}</LenisContext.Provider>;
}

export function useLenis(): LenisApi {
  const ctx = useContext(LenisContext);
  if (!ctx) throw new Error('useLenis: провайдер не найден');
  return ctx;
}
