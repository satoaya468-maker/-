import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { LenisProvider } from '@/lib/lenis';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';

const ArticlePage = lazy(() =>
  import('@/pages/ArticlePage').then((m) => ({ default: m.ArticlePage })),
);
const PolicyPage = lazy(() => import('@/pages/PolicyPage').then((m) => ({ default: m.PolicyPage })));

function RouteFallback() {
  return (
    <div className="container-page py-40 text-muted" role="status" aria-live="polite">
      Загружаем…
    </div>
  );
}

export function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <LenisProvider>
      <a
        href="#soderzhanie"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-surface focus:px-5 focus:py-3 focus:shadow-lift"
      >
        Перейти к содержанию
      </a>
      <Header />
      <main id="soderzhanie">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/zhurnal/:slug"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ArticlePage />
              </Suspense>
            }
          />
          <Route
            path="/politika"
            element={
              <Suspense fallback={<RouteFallback />}>
                <PolicyPage />
              </Suspense>
            }
          />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </LenisProvider>
  );
}
