/**
 * Реестр фотографий сайта.
 *
 * Источник правды — семантические слоты в `photos.slots.json` (общие для
 * приложения и Node-скрипта `npm run photos`). Каждый слот указывает на
 * стоковый кадр (Unsplash License) и несёт размеры и alt. Приоритет отдачи:
 *   1) локальный файл `src/assets/photos/<key>.<ext>` — появляется после
 *      `npm run photos` (скачивание и пережатие через sharp) или после
 *      замены на съёмку клиента;
 *   2) удалённый URL Unsplash;
 *   3) художественный фолбэк в <SmartImage> — сломанных картинок на сайте
 *      не бывает по построению.
 */
import rawSlots from './photos.slots.json';

export interface PhotoSlot {
  /** Имя файла для локализованных ассетов. */
  key: string;
  unsplashId: string;
  alt: string;
  width: number;
  height: number;
}

export type PhotoKey = keyof typeof rawSlots;

export const photos: Record<PhotoKey, PhotoSlot> = rawSlots;

/** Локализованные файлы (после `npm run photos` или замены на съёмку). */
const localFiles = import.meta.glob('../assets/photos/*.{jpg,jpeg,webp,avif,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function localUrlFor(key: string): string | undefined {
  for (const [path, url] of Object.entries(localFiles)) {
    const base = path.split('/').pop() ?? '';
    if (base.replace(/\.(jpg|jpeg|webp|avif|png)$/i, '') === key) return url;
  }
  return undefined;
}

function remoteUrl(photo: PhotoSlot, width: number): string {
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    q: '80',
    w: String(width),
    h: String(Math.round((photo.height / photo.width) * width)),
  });
  return `https://images.unsplash.com/photo-${photo.unsplashId}?${params.toString()}`;
}

export interface ResolvedPhoto {
  /** null — источника нет, компонент сразу показывает фолбэк. */
  src: string | null;
  srcSet?: string;
  isLocal: boolean;
}

/** В однофайловом превью внешние запросы запрещены политикой безопасности. */
const remoteBlocked = import.meta.env.VITE_NO_REMOTE_IMAGES === '1';

export function resolvePhoto(photo: PhotoSlot): ResolvedPhoto {
  const local = localUrlFor(photo.key);
  if (local) return { src: local, isLocal: true };
  if (remoteBlocked) return { src: null, isLocal: false };
  const src = remoteUrl(photo, photo.width);
  const src2x = remoteUrl(photo, Math.min(photo.width * 2, 2400));
  return { src, srcSet: `${src} 1x, ${src2x} 2x`, isLocal: false };
}
