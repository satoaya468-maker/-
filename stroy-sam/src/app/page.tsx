import { MarketingTicker } from '@/components/layout/MarketingTicker';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Hero } from '@/components/home/Hero';
import { QuickCategories } from '@/components/home/QuickCategories';
import { CatalogSection } from '@/components/home/CatalogSection';
import { VolumeCalculator } from '@/components/home/VolumeCalculator';
import { TrustSection } from '@/components/home/TrustSection';
import { DeliverySection } from '@/components/home/DeliverySection';
import { B2BSection } from '@/components/home/B2BSection';

/**
 * Главная. Порядок секций — это воронка, а не оглавление:
 * оффер → быстрый вход в категорию → цена и заказ → расчёт для
 * сомневающихся → снятие страхов → логистика → юрлица.
 *
 * Возможность оставить телефон есть в каждом втором блоке: прораб
 * уходит с сайта в момент, когда его отвлекли на объекте, и второй
 * раз может не вернуться.
 */

export default function HomePage() {
  return (
    <>
      <MarketingTicker />
      <SiteHeader />
      <main>
        <Hero />
        <QuickCategories />
        <CatalogSection />
        <VolumeCalculator />
        <TrustSection />
        <DeliverySection />
        <B2BSection />
      </main>
      <SiteFooter />
    </>
  );
}
