import { describe, expect, it } from 'vitest';
import {
  buildRelationshipRoute,
  buildRoundedOrthogonalPath,
  classifyTargetDirection,
} from '../src/components/widgets/table/relationshipLayer.ts';
import { createRoutingSandboxTables } from '../src/modules/laboratorio-tablas/fixtures.ts';

describe('Relationship layer path', () => {
  it('rounds orthogonal corners for horizontal routing', () => {
    const path = buildRoundedOrthogonalPath(
      [
        { x: 10, y: 20 },
        { x: 120, y: 20 },
        { x: 120, y: 80 },
        { x: 240, y: 80 },
      ],
      18,
    );

    expect(path).toContain('Q 120 20 120 38');
    expect(path).toContain('Q 120 80 138 80');
  });

  it('rounds orthogonal corners for vertical routing', () => {
    const path = buildRoundedOrthogonalPath(
      [
        { x: 50, y: 10 },
        { x: 50, y: 100 },
        { x: 180, y: 100 },
        { x: 180, y: 220 },
      ],
      18,
    );

    expect(path).toContain('Q 50 100 68 100');
    expect(path).toContain('Q 180 100 180 118');
  });

  it('routes stacked tables around the outer side instead of through the center', () => {
    const route = buildRelationshipRoute(
      { left: 100, top: 100, right: 200, bottom: 150, width: 100, height: 50 },
      { left: 120, top: 320, right: 220, bottom: 370, width: 100, height: 50 },
      { left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500 },
    );

    expect(route.textAnchor).toBe('middle');
    expect(route.labelX).toBeGreaterThan(140);
    expect(route.labelX).toBeLessThan(190);
    expect(route.labelY).toBeGreaterThan(150);
    expect(route.labelY).toBeLessThan(320);
    expect(route.points.some((point) => point.y > 150)).toBe(true);
    expect(route.points.some((point) => point.y < 320)).toBe(true);
    expect(route.d).toContain('M');
  });

  it('routes side-by-side tables through the top or bottom gutter', () => {
    const route = buildRelationshipRoute(
      { left: 100, top: 100, right: 160, bottom: 150, width: 60, height: 50 },
      { left: 300, top: 120, right: 360, bottom: 170, width: 60, height: 50 },
      { left: 0, top: 0, right: 500, bottom: 500, width: 500, height: 500 },
    );

    expect(route.textAnchor).toBe('middle');
    expect(route.labelX).toBeGreaterThan(160);
    expect(route.labelX).toBeLessThan(320);
    expect(route.labelY).toBeGreaterThan(100);
    expect(route.labelY).toBeLessThan(190);
    expect(route.points.some((point) => point.x > 160)).toBe(true);
    expect(route.d).toMatch(/^M /);
  });

  it('chooses a bottom trunk for the 3-table routing sandbox', () => {
    const tables = createRoutingSandboxTables();
    const source = tables.find((table) => table.tableId === 'sandbox-ventas');
    const clientes = tables.find((table) => table.tableId === 'sandbox-clientes');
    const productos = tables.find((table) => table.tableId === 'sandbox-productos');

    expect(source).toBeTruthy();
    expect(clientes).toBeTruthy();
    expect(productos).toBeTruthy();

    const sourceRect = { left: 320, top: 56, right: 796, bottom: 379, width: 476, height: 323 };
    const clienteRect = { left: 224, top: 520, right: 499, bottom: 767, width: 275, height: 247 };
    const productoRect = { left: 496, top: 520, right: 771, bottom: 767, width: 275, height: 247 };

    expect(classifyTargetDirection(sourceRect, clienteRect)).toBe('vertical:bottom');
    expect(classifyTargetDirection(sourceRect, productoRect)).toBe('vertical:bottom');
    const route = buildRelationshipRoute(sourceRect, clienteRect, { left: 0, top: 0, right: 900, bottom: 700, width: 900, height: 700 });

    expect(route.points.some((point) => point.y > sourceRect.bottom)).toBe(true);
    expect(route.points.some((point) => point.y < clienteRect.top)).toBe(true);
  });
});
