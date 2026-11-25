import { useEffect, useRef, useState } from 'react';
import { BrandWordmark } from './BrandWordmark';
import { useSiteContent } from '../context/SiteContentContext';

interface PreloaderProps {
  onComplete?: () => void;
}

/**
 * Luxury curtain preloader inspired by ever.co.id's warm-umber splash screen:
 * Centered brand wordmark, subtle 0 -> 100 counter, fine horizontal hairline progress bar,
 * and smooth upward curtain lift revealing the hero portrait underneath.
 * Automatically skipped when `?autostart=1` or `prefers-reduced-motion: reduce` is active.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const { config } = useSiteContent();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [phase, setPhase] = useState<'loading' | 'lifting' | 'done'>(() => {
    if (typeof window === 'undefined') return 'done';
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return 'done';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'done';
    return 'loading';
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase === 'done') {
      onCompleteRef.current?.();
      return;
    }
    if (phase !== 'loading') return;

    const durationMs = 950;
    let startTime: number | null = null;
    let rafId = 0;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = Math.max(0, now - startTime);
      const t = Math.min(1, elapsed / durationMs);
      // Stepped editorial curve mimicking ever.co.id's custom loader ease
      const eased =
        t < 0.55
          ? (t / 0.55) * 0.62
          : 0.62 + Math.pow((t - 0.55) / 0.45, 0.72) * 0.38;
      const pct = Math.max(0, Math.min(100, Math.round(eased * 100)));
      setProgress(pct);

      if (t < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        onCompleteRef.current?.();
        setPhase('lifting');
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'lifting') return;
    const timer = window.setTimeout(() => {
      setPhase('done');
    }, 680);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      aria-hidden={phase === 'lifting'}
      data-testid="ever-preloader"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#7A6047] text-white transition-transform duration-[680ms] ease-[cubic-bezier(0.77,0,0.175,1)] will-change-transform ${
        phase === 'lifting' ? '-translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
    >
      <div
        className={`flex flex-col items-center gap-7 transition-all duration-500 ${
          phase === 'lifting' ? 'opacity-0 -translate-y-6' : 'opacity-100 translate-y-0'
        }`}
      >
        <BrandWordmark size="md" className="text-2xl sm:text-3xl text-[#F9F6F1]" />

        <div className="w-44 sm:w-56 space-y-2.5">
          <div className="h-[1px] w-full overflow-hidden bg-white/20">
            <div
              className="h-full bg-[#F9F6F1] transition-transform duration-75 origin-left"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-white/70">
            <span>{config.brand.tagline}</span>
            <span className="tabular-nums">{String(progress).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
