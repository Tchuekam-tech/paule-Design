import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ServicePillar } from '../data/siteConfig';
import { useSiteContent } from '../context/SiteContentContext';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { computeArcSlideTransform, clamp01, lerp } from '../utils/scrollMath';

interface ArcShowcaseSliderProps {
  onSelectPillar: (pillar?: ServicePillar) => void;
}

/**
 * Draggable & scroll-revealed curved arc carousel reproducing ever.co.id's
 * Flickity `tricks-slider` effect (vertical arc, ±6deg tilt, inner image horizontal parallax,
 * and scroll-scrubbed clip-path inset reveal).
 */
export function ArcShowcaseSlider({ onSelectPillar }: ArcShowcaseSliderProps) {
  const { config } = useSiteContent();
  const slides = config.arcSlides;
  const slideCount = slides.length;

  const sectionRef = useRef<HTMLElement>(null);
  const transit = useScrollProgress(sectionRef, 'transit', 0.5);

  const [activeIndex, setActiveIndex] = useState(slideCount > 1 ? 1 : 0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartX = useRef(0);
  const dragMoved = useRef(false);

  // Keep activeIndex in bounds if the manager removes slides
  const safeActiveIndex = slideCount > 0 ? activeIndex % slideCount : 0;

  // Subtle auto-glide when not dragging or hovering
  useEffect(() => {
    if (isDragging || isHovered || slideCount <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [isDragging, isHovered, slideCount]);

  // Scroll-scrubbed inset reveal mirroring ever.co.id's `clip: inset(23.7% -> 0%)`
  const revealT = clamp01(transit / 0.36);
  const clipInset = Math.round(lerp(20, 0, revealT) * 10) / 10;
  const slideGroupOpacity = Math.round(lerp(0.45, 1, revealT) * 1000) / 1000;

  const stepSlide = (delta: number) => {
    if (slideCount === 0) return;
    setActiveIndex((prev) => (prev + delta + slideCount) % slideCount);
  };

  const pointerDown = useRef(false);
  const activePointerId = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDown.current = true;
    activePointerId.current = e.pointerId;
    dragStartX.current = e.clientX;
    dragMoved.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return;
    const dx = e.clientX - dragStartX.current;
    if (!dragMoved.current && Math.abs(dx) > 8) {
      dragMoved.current = true;
      setIsDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer already released
      }
    }
    if (dragMoved.current) {
      setDragOffset(dx / 340);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return;
    pointerDown.current = false;
    if (dragMoved.current) {
      try {
        if (activePointerId.current !== null) {
          e.currentTarget.releasePointerCapture(activePointerId.current);
        }
      } catch {
        // Ignore if not captured
      }
      if (dragOffset < -0.22) {
        stepSlide(1);
      } else if (dragOffset > 0.22) {
        stepSlide(-1);
      }
      setDragOffset(0);
      setIsDragging(false);
    }
    activePointerId.current = null;
  };

  const progressPercent = slideCount > 0 ? ((safeActiveIndex + 1) / slideCount) * 100 : 0;

  return (
    <section
      ref={sectionRef}
      id="editorial-quote"
      data-testid="arc-showcase-slider"
      aria-label="Ever house pillars showcase"
      className="relative overflow-hidden bg-[#7A6047] pt-28 pb-24 sm:pt-32 sm:pb-32"
    >
      {/* Curved Arc Carousel Stage */}
      <div
        data-scroll="overscroll"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative mx-auto h-[330px] sm:h-[400px] md:h-[430px] max-w-[1440px] select-none touch-pan-y ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="relative h-full w-full">
          {slides.map((slide, idx) => {
            // Shortest circular signed distance from safeActiveIndex
            let delta = idx - safeActiveIndex;
            const half = slideCount / 2;
            if (delta > half) delta -= slideCount;
            if (delta < -half) delta += slideCount;

            const effectiveOffset = delta + dragOffset;
            if (Math.abs(effectiveOffset) > 2.35) return null;

            const { translateY, rotateDeg, imageParallaxPercent, scale, opacity } =
              computeArcSlideTransform(effectiveOffset, {
                parallaxAmount: 49,
                verticalAmount: 54,
                rotationAmount: 6,
              });

            const horizontalSpacing = 365;
            const translateX = effectiveOffset * horizontalSpacing;
            const isCenter = Math.abs(delta) === 0;

            return (
              <div
                key={slide.id}
                style={{
                  transform: `translate3d(calc(-50% + ${translateX}px), ${translateY}px, 0) rotate(${rotateDeg}deg) scale(${scale})`,
                  opacity: opacity * slideGroupOpacity,
                  zIndex: isCenter ? 20 : 10 - Math.round(Math.abs(effectiveOffset)),
                }}
                className={`absolute left-1/2 top-4 w-[235px] sm:w-[270px] md:w-[295px] aspect-square will-change-transform ${
                  isDragging
                    ? 'transition-none'
                    : 'transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
                }`}
              >
                <button
                  type="button"
                  data-testid={isCenter ? 'arc-active-slide' : undefined}
                  onClick={() => {
                    if (dragMoved.current) return;
                    if (!isCenter) {
                      setActiveIndex(idx);
                    } else {
                      onSelectPillar(slide.pillar);
                    }
                  }}
                  aria-label={`Explore ${slide.label} — ${slide.subtitle}`}
                  style={{
                    clipPath: `inset(${clipInset}%)`,
                  }}
                  className="group relative block h-full w-full overflow-hidden bg-[#5F4A36] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
                >
                  <img
                    src={slide.image}
                    alt={`${slide.label} aesthetic preview`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    style={{
                      transform: `scale(1.26) translate3d(${-imageParallaxPercent * 0.45}%, 0, 0)`,
                    }}
                    className={`h-full w-full object-cover sepia-[0.28] contrast-[0.94] brightness-[0.82] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:brightness-95`}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#251C14]/55 via-black/10 to-black/15" />

                  {/* Signature tracked uppercase sub-brand label overlapping across frame like ref-arc-slider.png */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                    <span className="font-sans text-xl sm:text-2xl font-normal tracking-[0.28em] uppercase text-[#F9F6F1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-105">
                      {slide.label}
                    </span>
                    <span className="mt-2 text-[10px] tracking-[0.2em] uppercase text-white/75 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      {slide.subtitle}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slim Carousel Controls & Progress Fill Bar */}
      <div className="mx-auto mt-2 flex max-w-md items-center justify-center gap-5 px-6">
        <button
          type="button"
          onClick={() => stepSlide(-1)}
          aria-label="Previous showcase slide"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/85 hover:border-white hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="h-[1px] flex-1 overflow-hidden bg-white/20">
          <div
            className="h-full bg-[#F9F6F1] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => stepSlide(1)}
          aria-label="Next showcase slide"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/85 hover:border-white hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Editorial Quote directly beneath the Arc Slider matching ever.co.id */}
      <div className="mx-auto mt-16 sm:mt-20 max-w-4xl px-6 text-center">
        <blockquote
          style={{
            opacity: clamp01((transit - 0.12) / 0.25),
            transform: `translate3d(0, ${lerp(24, 0, clamp01((transit - 0.12) / 0.25))}px, 0)`,
          }}
          className="font-serif text-2xl sm:text-4xl lg:text-[2.75rem] font-normal leading-[1.35] text-white will-change-transform"
        >
          {config.quote.text}
        </blockquote>
        <p className="mt-6 text-xs tracking-[0.22em] uppercase text-white/65">
          {config.quote.sublabel}
        </p>
      </div>
    </section>
  );
}
