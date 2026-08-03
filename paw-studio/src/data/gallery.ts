import { photos, type PhotoSlot } from './photos';

export interface ComparePair {
  photo: PhotoSlot;
  caption: string;
}

export const comparePairs: readonly ComparePair[] = [
  {
    photo: photos.baDog,
    caption: 'Комплексный уход: мытьё, вычёсывание, гигиеническая стрижка',
  },
  {
    photo: photos.baCat,
    caption: 'Экспресс-линька: минус отживший подшёрсток, плюс блеск',
  },
  {
    photo: photos.baPup,
    caption: 'Первый щенячий груминг: знакомство, ванна, лёгкая стрижка',
  },
] as const;
