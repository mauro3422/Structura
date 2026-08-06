import { describe, expect, it, beforeEach } from 'vitest';
import { resolveLabTables } from '../src/components/widgets/table/persistence.ts';
import { renderTableLaboratory, renderLabTable } from '../src/components/widgets/table/renderers.ts';

describe('Table positioning', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('assigns starter coordinates to resolved tables', () => {
    const tables = resolveLabTables(
      {
        type: 'table-laboratory',
        initialTables: [
          { tableName: 'A', columns: [], rows: [] },
          { tableName: 'B', columns: [], rows: [] },
          { tableName: 'C', columns: [], rows: [] },
        ],
      },
      'lesson-1',
    );

    expect(tables).toHaveLength(3);
    expect(tables[0].x).not.toBeUndefined();
    expect(tables[1].x).not.toBeUndefined();
    expect(tables[2].x).not.toBeUndefined();
    expect(new Set(tables.map((table) => `${table.x}:${table.y}`)).size).toBe(3);
    expect(Math.max(...tables.map((table) => table.x || 0)) - Math.min(...tables.map((table) => table.x || 0))).toBeGreaterThan(200);
  });

  it('renders stage coordinates into table nodes', () => {
    const html = renderLabTable(
      {
        tableId: 'table-1',
        tableName: 'MiTabla',
        columns: [{ name: 'ID', type: 'INT' }],
        rows: [],
        x: 210,
        y: 180,
      },
      0,
      'lesson-1',
    );

    expect(html).toContain('data-stage-node="true"');
    expect(html).toContain('data-stage-x="210"');
    expect(html).toContain('data-stage-y="180"');
  });

  it('wraps the laboratory in a graph stage', () => {
    const html = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [{ tableName: 'A', columns: [], rows: [] }],
      },
      0,
      'lesson-1',
    );

    expect(html).toContain('data-graph-stage');
    expect(html).toContain('graph-stage__controls');
  });
});
