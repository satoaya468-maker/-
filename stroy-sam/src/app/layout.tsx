import type { Metadata, Viewport } from 'next';
import { Oswald, Golos_Text } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/store/cart';
import { CartDrawer } from '@/components/order/CartDrawer';
import { ChatWidget } from '@/components/chat/ChatWidget';

/**
 * Шрифты подобраны по контрастной оси, а не по «похожести»:
 * Oswald — узкий signage-гротеск, каким подписывают склады и технику;
 * Golos Text — нейтральный кириллический UI-шрифт с настоящими
 * табличными цифрами, что критично для колонок с ценами.
 */

const display = Oswald({
  subsets: ['cyrillic', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Golos_Text({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stroy-sam.ru'),
  title: {
    default: 'Строй Сам — стройматериалы с доставкой по Магнитогорску от 30 минут',
    template: '%s · Строй Сам',
  },
  description:
    'Щебень, песок, цемент, газоблок с базы на Западном шоссе. Отгрузка день в день, доставка от 30 минут, скидка на объём от 5 тонн. Безнал с НДС для юрлиц.',
  keywords: [
    'щебень Магнитогорск',
    'песок с доставкой',
    'цемент М500',
    'стройматериалы Магнитогорск',
    'газоблок',
    'ПГС',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Строй Сам',
    title: 'Строй Сам — стройматериалы на объект за 30 минут',
    description:
      'База на Западном шоссе: щебень, песок, цемент, блоки. Считаем объём, привозим своим транспортом.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#14161a',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Разметка организации для выдачи: локальный бизнес с адресом базы,
 * телефоном и часами приёма заявок.
 */
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'HardwareStore',
  name: 'Строй Сам',
  description: 'Стройматериалы с собственной базы в Магнитогорске',
  telephone: '+7 (3519) 55-04-04',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Западное шоссе, 16/2',
    addressLocality: 'Магнитогорск',
    addressRegion: 'Челябинская область',
    addressCountry: 'RU',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '07:00',
    closes: '20:00',
  },
  areaServed: 'Магнитогорск и Челябинская область',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#catalog"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-lg focus:bg-hv focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-bold focus:text-hv-ink"
        >
          Перейти к каталогу
        </a>

        <CartProvider>
          {children}
          <CartDrawer />
          <ChatWidget />
        </CartProvider>

        <script
          type="application/ld+json"
          // Статичный объект, собранный на сервере — пользовательских данных здесь нет
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </body>
    </html>
  );
}
