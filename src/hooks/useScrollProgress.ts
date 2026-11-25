import { useEffect, useState, type RefObject } from 'react';
import { computeStickyProgress, computeTransitProgress } from '../utils/scrollMath';

/**
 * Tracks smooth scroll progress [0, 1] for an element using rAF-throttled passive listeners.
 * Under `prefers-reduced-motion: reduce`, returns `reducedFallback` (default 0.5) so all
 * sections appear cleanly settled without motion sickness.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  mode: 'sticky' | 'transit' = 'transit',
  reducedFallback = 0.5
): number {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setProgress(reducedFallback);
      return;
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const next =
        mode === 'sticky'
          ? computeStickyProgress(rect.top, rect.height, vh)
          : computeTransitProgress(rect.top, rect.height, vh);

      setProgress((prev) => (Math.abs(prev - next) > 0.0015 ? next : prev));
    };

    const schedule = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, mode, reducedFallback]);

  return progress;
}
