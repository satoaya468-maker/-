import type { Icon } from '@phosphor-icons/react';
import { Cat, Dog, Drop, PawPrint, Scissors, Wind } from '@phosphor-icons/react';

export interface Service {
  id: string;
  icon: Icon;
  title: string;
  description: string;
  priceFrom: number;
  priceExact?: boolean;
  duration: string;
  /** Крупная карточка в сетке. */
  featured?: boolean;
  /** Вариант фона крупной карточки. */
  tone?: 'sage' | 'beige';
}

export const services: readonly Service[] = [
  {
    id: 'dogs',
    icon: Dog,
    title: 'Комплекс для собак',
    description:
      'Мытьё косметикой под тип шерсти, бережная сушка, стрижка по стандарту породы или удобная домашняя, уши, когти, гигиена.',
    priceFrom: 2500,
    duration: '1,5–3 часа',
    featured: true,
    tone: 'sage',
  },
  {
    id: 'cats',
    icon: Cat,
    title: 'Комплекс для кошек',
    description:
      'Деликатная работа без жёсткой фиксации: ванна или сухая чистка, вычёсывание, когти, гигиенические зоны. Ведёт фелинолог.',
    priceFrom: 3000,
    duration: '1–2 часа',
    featured: true,
    tone: 'beige',
  },
  {
    id: 'haircut',
    icon: Scissors,
    title: 'Модельная стрижка',
    description: 'Ножницами, по стандарту породы или по вашим фото. Форму обсуждаем до первой пряди.',
    priceFrom: 1800,
    duration: '1–1,5 часа',
  },
  {
    id: 'deshed',
    icon: Wind,
    title: 'Экспресс-линька',
    description:
      'Вымываем отживший подшёрсток за одну процедуру. Дома заметно меньше шерсти уже в первую неделю.',
    priceFrom: 2800,
    duration: 'около 1,5 часа',
  },
  {
    id: 'spa',
    icon: Drop,
    title: 'SPA-уход',
    description:
      'Маски и пилинги Iv San Bernard: восстановление шерсти, уход за подушечками лап, лёгкий массаж.',
    priceFrom: 2000,
    duration: '40 минут',
  },
  {
    id: 'claws',
    icon: PawPrint,
    title: 'Стрижка когтей',
    description:
      'Аккуратно и с подпилом краёв. Заодно приучаем питомца относиться к процедуре спокойно.',
    priceFrom: 500,
    priceExact: true,
    duration: '15 минут',
  },
] as const;
