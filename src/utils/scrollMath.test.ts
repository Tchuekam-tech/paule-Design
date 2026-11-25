import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp01,
  computeArcSlideTransform,
  computeCollageScrollState,
  computeStickyProgress,
  computeTextScrubOpacity,
  computeTransitProgress,
  easeOutExpo,
} from './scrollMath';

test('clamp01 and easeOutExpo stay strictly within [0, 1]', () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(1.8), 1);
  assert.equal(easeOutExpo(0), 0);
  assert.equal(easeOutExpo(1), 1);
  assert.ok(easeOutExpo(0.5) > 0.9);
});

test('computeStickyProgress maps container top into [0, 1]', () => {
  assert.equal(computeStickyProgress(100, 2000, 900), 0);
  assert.equal(computeStickyProgress(0, 2000, 900), 0);
  assert.equal(computeStickyProgress(-550, 2000, 900), 0.5);
  assert.equal(computeStickyProgress(-1100, 2000, 900), 1);
  assert.equal(computeStickyProgress(-1500, 2000, 900), 1);
});

test('computeTransitProgress tracks full viewport crossing', () => {
  assert.equal(computeTransitProgress(900, 600, 900), 0);
  assert.equal(computeTransitProgress(150, 600, 900), 0.5);
  assert.equal(computeTransitProgress(-600, 600, 900), 1);
});

test('computeArcSlideTransform centers cleanly and curves symmetrically on left/right', () => {
  const center = computeArcSlideTransform(0);
  assert.equal(center.translateY, 0);
  assert.equal(center.rotateDeg, 0);
  assert.equal(center.scale, 1);
  assert.equal(center.opacity, 1);

  const left = computeArcSlideTransform(-1);
  const right = computeArcSlideTransform(1);
  assert.equal(left.translateY, right.translateY);
  assert.ok(left.translateY > 0);
  assert.equal(left.rotateDeg, -right.rotateDeg);
  assert.equal(left.rotateDeg, -6);
  assert.equal(right.rotateDeg, 6);
});

test('computeCollageScrollState opens clip inset and moves left column faster than right', () => {
  const start = computeCollageScrollState(0);
  const mid = computeCollageScrollState(0.5);
  const end = computeCollageScrollState(1);

  assert.ok(start.clipInsetX > mid.clipInsetX);
  assert.equal(mid.clipInsetX, 0);
  assert.ok(mid.imageOpacity > start.imageOpacity);
  assert.ok(Math.abs(end.leftColumnY - start.leftColumnY) > Math.abs(end.rightColumnY - start.rightColumnY));
});

test('computeTextScrubOpacity progressively illuminates words from minOpacity to 1', () => {
  const earlyFirst = computeTextScrubOpacity(0.15, 0, 6);
  const earlyLast = computeTextScrubOpacity(0.15, 5, 6);
  assert.ok(earlyFirst > earlyLast);
  assert.equal(computeTextScrubOpacity(1, 5, 6), 1);
  assert.equal(computeTextScrubOpacity(0, 5, 6), 0.2);
});
