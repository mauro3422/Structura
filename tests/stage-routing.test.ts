import { describe, expect, it } from 'vitest';
import { buildGraphEdgeRoute } from '../src/components/widgets/stage/router.ts';

function segmentIntersectsRect(
  start: { x: number; y: number },
  end: { x: number; y: number },
  rect: { left: number; top: number; right: number; bottom: number },
): boolean {
  if (start.x === end.x) {
    const x = start.x;
    if (x < rect.left || x > rect.right) return false;
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    return maxY >= rect.top && minY <= rect.bottom;
  }

  if (start.y === end.y) {
    const y = start.y;
    if (y < rect.top || y > rect.bottom) return false;
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    return maxX >= rect.left && minX <= rect.right;
  }

  return false;
}

describe('Stage routing', () => {
  it('routes around a central obstacle with a gutter-style path', () => {
    const obstacle = { left: 220, top: 140, right: 340, bottom: 300, width: 120, height: 160 };
    const route = buildGraphEdgeRoute({
      sourceRect: { left: 80, top: 100, right: 180, bottom: 180, width: 100, height: 80 },
      targetRect: { left: 420, top: 120, right: 520, bottom: 200, width: 100, height: 80 },
      canvasRect: { left: 0, top: 0, right: 700, bottom: 500, width: 700, height: 500 },
      obstacles: [obstacle],
      preferAxis: 'horizontal',
    });

    expect(route.points.length).toBeGreaterThanOrEqual(4);
    expect(route.points[0].x).toBeLessThan(240);
    expect(route.points[route.points.length - 1].x).toBeGreaterThan(380);

    for (let index = 1; index < route.points.length; index += 1) {
      const start = route.points[index - 1];
      const end = route.points[index];
      expect(segmentIntersectsRect(start, end, obstacle)).toBe(false);
    }
  });
});
