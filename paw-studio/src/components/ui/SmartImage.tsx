import { useState } from 'react';
import { cn } from '@/lib/cn';
import { resolvePhoto, type PhotoSlot } from '@/data/photos';
import { PawMark } from './PawMark';

interface SmartImageProps {
  photo: PhotoSlot;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  /** Первый экран: загружаем сразу и с приоритетом. */
  priority?: boolean;
}

/**
 * Фотослот с гарантированной деградацией: пока грузится — тёплая поверхность,
 * при ошибке сети — фирменный фолбэк со знаком лапы и подписью. Сломанной
 * картинки пользователь не увидит никогда.
 */
export function SmartImage({ photo, className, imgClassName, sizes, priority }: SmartImageProps) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const { src, srcSet } = resolvePhoto(photo);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[linear-gradient(165deg,#F3F1EA_0%,#E9EBE0_100%)]',
        className,
      )}
    >
      {state !== 'error' && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={cn(
            'h-full w-full object-cover saturate-[0.94] transition-opacity duration-500',
            state === 'ok' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
      {state === 'error' && (
        <div
          role="img"
          aria-label={photo.alt}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
        >
          <PawMark className="w-9 text-sage-300" />
          <span className="text-caption max-w-[26ch] text-muted">{photo.alt}</span>
        </div>
      )}
    </div>
  );
}
