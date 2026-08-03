import { useCallback, useEffect, useRef, useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { resolvePhoto, type PhotoSlot } from '@/data/photos';
import { PawMark } from './PawMark';

interface CompareSliderProps {
  photo: PhotoSlot;
  caption: string;
  className?: string;
}

const START = 58;

/**
 * Слайдер «до/после». Оба слоя — один и тот же кадр: слой «до» показан
 * с приглушённой обработкой (тусклая, свалявшаяся шерсть), слой «после» —
 * оригинал. Позиция ведётся через ref и пишется в style напрямую,
 * без ре-рендеров на каждое движение указателя.
 */
export function CompareSlider({ photo, caption, className }: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(START);
  const draggingRef = useRef(false);
  const frameRef = useRef(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { src, srcSet } = resolvePhoto(photo);
  const showFallback = failed || src === null;

  const apply = useCallback((value: number) => {
    const clamped = Math.min(100, Math.max(0, value));
    positionRef.current = clamped;
    if (beforeRef.current) {
      beforeRef.current.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    }
    if (handleRef.current) {
      handleRef.current.style.left = `${clamped}%`;
    }
    knobRef.current?.setAttribute('aria-valuenow', String(Math.round(clamped)));
  }, []);

  useEffect(() => {
    apply(START);
    return () => cancelAnimationFrame(frameRef.current);
  }, [apply]);

  const positionFromEvent = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return positionRef.current;
    return ((clientX - rect.left) / rect.width) * 100;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (showFallback) return;
      draggingRef.current = true;
      containerRef.current?.setPointerCapture(event.pointerId);
      apply(positionFromEvent(event.clientX));
    },
    [apply, showFallback, positionFromEvent],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const x = event.clientX;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => apply(positionFromEvent(x)));
    },
    [apply, positionFromEvent],
  );

  const endDrag = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step = 4;
      const current = positionRef.current;
      if (event.key === 'ArrowLeft') apply(current - step);
      else if (event.key === 'ArrowRight') apply(current + step);
      else if (event.key === 'Home') apply(0);
      else if (event.key === 'End') apply(100);
      else return;
      event.preventDefault();
    },
    [apply],
  );

  return (
    <figure className={className}>
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative aspect-[4/5] cursor-ew-resize touch-pan-y overflow-hidden rounded-media bg-[linear-gradient(165deg,#F3F1EA_0%,#E9EBE0_100%)] select-none"
      >
        {showFallback ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <PawMark className="w-9 text-sage-300" />
            <span className="text-caption max-w-[26ch] text-muted">{photo.alt}</span>
          </div>
        ) : (
          <>
            {/* Слой «после» — оригинал */}
            <img
              src={src}
              srcSet={srcSet}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw"
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={cn(
                'absolute inset-0 h-full w-full object-cover saturate-[0.94] transition-opacity duration-500',
                loaded ? 'opacity-100' : 'opacity-0',
              )}
            />
            {/* Слой «до» — тот же кадр с «уставшей» шерстью */}
            <div ref={beforeRef} className="absolute inset-0 will-change-[clip-path]">
              <img
                src={src}
                srcSet={srcSet}
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw"
                alt=""
                aria-hidden="true"
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={cn(
                  'h-full w-full object-cover brightness-[0.9] contrast-[0.88] saturate-[0.45] sepia-[0.14] transition-opacity duration-500',
                  loaded ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>

            {loaded && (
              <>
                <span className="text-caption pointer-events-none absolute top-3 left-3 rounded-full bg-[rgb(17_17_17/0.55)] px-2.5 py-1 font-medium text-white">
                  До
                </span>
                <span className="text-caption pointer-events-none absolute top-3 right-3 rounded-full bg-[rgb(17_17_17/0.55)] px-2.5 py-1 font-medium text-white">
                  После
                </span>
              </>
            )}

            <div
              ref={handleRef}
              className="absolute inset-y-0 -ml-px w-0.5 bg-white/90 shadow-[0_0_12px_rgb(17_17_17/0.25)]"
              style={{ left: `${START}%` }}
            >
              <div
                ref={knobRef}
                role="slider"
                tabIndex={0}
                aria-label={`Сравнение «до и после»: ${caption}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={START}
                onKeyDown={onKeyDown}
                className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full bg-white text-ink shadow-lift"
              >
                <CaretLeft size={12} weight="bold" aria-hidden="true" />
                <CaretRight size={12} weight="bold" aria-hidden="true" />
              </div>
            </div>
          </>
        )}
      </div>
      <figcaption className="text-caption mt-3 text-muted">{caption}</figcaption>
    </figure>
  );
}
