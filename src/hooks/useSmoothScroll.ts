import { useEffect } from 'react';

/**
 * Lightweight Lenis-inspired smooth wheel inertia scroll.
 * - Preserves programmatic window.scrollTo and native touch scrolling.
 * - Automatically pauses when a modal/drawer locks body scroll or when
 *   `prefers-reduced-motion: reduce` is enabled.
 */
export function useSmoothScroll(disabled = false) {
  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let currentY = window.scrollY;
    let targetY = window.scrollY;
    let rafId = 0;
    let isAnimating = false;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const step = () => {
      const diff = targetY - currentY;
      if (Math.abs(diff) < 0.4) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        isAnimating = false;
        rafId = 0;
        return;
      }
      // Smooth Lenis-like exponential damping
      currentY += diff * 0.1;
      window.scrollTo(0, currentY);
      rafId = window.requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      // Allow native scroll inside nested scrollable containers (modals, drawers, horizontal carousels)
      const target = e.target as HTMLElement | null;
      if (target?.closest('[role="dialog"], [data-scroll="overscroll"]')) {
        return;
      }
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault();
      if (!isAnimating) {
        currentY = window.scrollY;
        targetY = window.scrollY;
      }
      targetY = Math.min(maxScroll(), Math.max(0, targetY + e.deltaY * 0.95));
      if (!isAnimating) {
        isAnimating = true;
        rafId = window.requestAnimationFrame(step);
      }
    };

    const onNativeScroll = () => {
      if (!isAnimating) {
        currentY = window.scrollY;
        targetY = window.scrollY;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onNativeScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onNativeScroll);
    };
  }, [disabled]);
}
