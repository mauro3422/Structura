import { describe, expect, it } from 'vitest';
import {
  computeAnchorZoomTransform,
  computeFitTransform,
  rectToLocal,
} from '../src/components/widgets/stage/index.ts';

describe('Stage viewport geometry', () => {
  it('projects screen rects back into local stage space', () => {
    const local = rectToLocal(
      { left: 220, top: 180, right: 320, bottom: 240, width: 100, height: 60 },
      { left: 120, top: 100, right: 520, bottom: 460, width: 400, height: 360 },
      2,
    );

    expect(local.left).toBe(50);
    expect(local.top).toBe(40);
    expect(local.width).toBe(50);
    expect(local.height).toBe(30);
  });

  it('zooms around the anchor point without drifting the focus', () => {
    const next = computeAnchorZoomTransform(
      { x: 30, y: 40, scale: 1 },
      1.5,
      { x: 200, y: 160 },
      { minScale: 0.5, maxScale: 2.5 },
    );

    expect(next.scale).toBeCloseTo(1.5);
    expect(next.x).toBeLessThan(30);
    expect(next.y).toBeLessThan(40);
  });

  it('fits large content into the viewport with a bounded scale', () => {
    const fit = computeFitTransform(
      { width: 1200, height: 900 },
      { width: 900, height: 700 },
      72,
    );

    expect(fit.scale).toBeLessThan(1);
    expect(fit.x).toBeGreaterThanOrEqual(-200);
    expect(fit.y).toBeGreaterThanOrEqual(-200);
  });
});
