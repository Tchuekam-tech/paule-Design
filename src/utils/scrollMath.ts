export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Exponential ease-out matching ever.co.id's Lenis configuration:
 * (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
 */
export function easeOutExpo(t: number): number {
  const x = clamp01(t);
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

/**
 * Computes normalized [0, 1] scroll progress through a sticky scroll container.
 * 0 = top of container hits top of viewport; 1 = bottom of container hits bottom of viewport.
 */
export function computeStickyProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): number {
  const scrollable = Math.max(1, rectHeight - viewportHeight);
  return clamp01(-rectTop / scrollable);
}

/**
 * Computes normalized [0, 1] viewport transit progress for a standard section.
 * 0 = top of element enters bottom of viewport; 1 = bottom of element leaves top of viewport.
 */
export function computeTransitProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number
): number {
  const totalDistance = Math.max(1, rectHeight + viewportHeight);
  return clamp01((viewportHeight - rectTop) / totalDistance);
}

export interface ArcSlideTransform {
  translateY: number;
  rotateDeg: number;
  imageParallaxPercent: number;
  scale: number;
  opacity: number;
}

/**
 * Exact curved arc slider math mirroring ever.co.id's Flickity carousel:
 * parallaxAmount = 49, verticalAmount = 60, rotationAmount = 6.
 * `normalizedOffset` is 0 at center, negative to the left, positive to the right.
 */
export function computeArcSlideTransform(
  normalizedOffset: number,
  options: {
    parallaxAmount?: number;
    verticalAmount?: number;
    rotationAmount?: number;
  } = {}
): ArcSlideTransform {
  const parallaxAmount = options.parallaxAmount ?? 49;
  const verticalAmount = options.verticalAmount ?? 60;
  const rotationAmount = options.rotationAmount ?? 6;

  const clamped = clamp(normalizedOffset, -2.5, 2.5);
  const absOffset = Math.abs(clamped);

  const translateY = Math.round(absOffset * absOffset * verticalAmount * 100) / 100;
  const rotateDeg = Math.round(clamped * rotationAmount * 100) / 100;
  const imageParallaxPercent =
    Math.round(clamp(clamped * (parallaxAmount * 0.45), -parallaxAmount, parallaxAmount) * 100) /
    100;
  const scale = Math.round(clamp(1 - absOffset * 0.06, 0.82, 1) * 1000) / 1000;
  const opacity = Math.round(clamp(1 - absOffset * 0.22, 0.35, 1) * 1000) / 1000;

  return {
    translateY,
    rotateDeg,
    imageParallaxPercent,
    scale,
    opacity,
  };
}

export interface CollageScrollState {
  leftColumnY: number;
  rightColumnY: number;
  clipInsetX: number;
  imageOpacity: number;
  headingOpacity: number;
  headingScale: number;
}

/**
 * Computes scroll-scrubbed dual-column parallax and clip-path inset reveal
 * matching ever.co.id's `section_header80` ("THE ART OF UNDERSTATED BEAUTY").
 */
export function computeCollageScrollState(progress: number): CollageScrollState {
  const p = clamp01(progress);

  // Left column moves up noticeably faster than right column for layered depth
  const leftColumnY = Math.round(lerp(90, -260, p) * 10) / 10;
  const rightColumnY = Math.round(lerp(55, -120, p) * 10) / 10;

  // Clip-path opens smoothly from inset(0% 26%) -> inset(0% 0%) around mid-scroll, then softens gently
  const openPhase = clamp01(p / 0.45);
  const exitPhase = clamp01((p - 0.78) / 0.22);
  const clipInsetX =
    Math.round((lerp(26, 0, easeOutExpo(openPhase)) + lerp(0, 10, exitPhase)) * 10) / 10;

  const imageOpacity =
    Math.round(clamp(lerp(0.38, 1, openPhase) - exitPhase * 0.2, 0.3, 1) * 1000) / 1000;

  const headingOpacity = Math.round(clamp(lerp(0.35, 1, clamp01(p / 0.35)), 0.35, 1) * 1000) / 1000;
  const headingScale = Math.round(lerp(0.95, 1.03, p) * 1000) / 1000;

  return {
    leftColumnY,
    rightColumnY,
    clipInsetX,
    imageOpacity,
    headingOpacity,
    headingScale,
  };
}

/**
 * Computes per-word/character scrubbed opacity matching SplitType + ScrollTrigger
 * in ever.co.id's "PERSONALISED SERVICES" section.
 */
export function computeTextScrubOpacity(
  progress: number,
  index: number,
  total: number,
  minOpacity = 0.2
): number {
  const safeTotal = Math.max(1, total);
  const p = clamp01(progress);
  const start = (index / safeTotal) * 0.72;
  const span = 0.28;
  const local = clamp01((p - start) / span);
  return Math.round(lerp(minOpacity, 1, local) * 1000) / 1000;
}
