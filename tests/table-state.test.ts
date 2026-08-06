import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultLabTable } from '../src/components/widgets/table/markup.ts';
import { createRoutingSandboxTables } from '../src/modules/laboratorio-tablas/fixtures.ts';
import { getLabState, mutateLabState, syncLabState } from '../src/components/widgets/table/state.ts';
import { resolveLabTables } from '../src/components/widgets/table/persistence.ts';
import { renderTableLaboratory } from '../src/components/widgets/table/renderers.ts';

describe('Table state contracts', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the live laboratory DOM into a table snapshot', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [
          {
            tableId: 'users',
            tableName: 'Usuarios',
            columns: [
              { name: 'ID', type: 'INT', isPK: true, autoIncrement: true },
              { name: 'email', type: 'TEXT', isFK: true, references: 'profiles', cardinality: '1:N' },
            ],
            rows: [[1, 'user@mail.com']],
          },
        ],
      },
      0,
      'lesson-state',
    );

    const tables = getLabState('table-lab-lesson-state');

    expect(tables).toHaveLength(1);
    expect(tables[0]).toMatchObject({
      tableId: 'users',
      tableName: 'Usuarios',
    });
    expect(tables[0].columns).toEqual([
      expect.objectContaining({ name: 'ID', type: 'INT', isPK: true }),
      expect.objectContaining({ name: 'email', type: 'TEXT', isFK: true, cardinality: '1:N' }),
    ]);
    expect(tables[0].rows).toEqual([['1', 'user@mail.com']]);
  });

  it('persists syncs and updates the autosave indicator', async () => {
    document.body.innerHTML = `
      <section id="lab-sync" class="table-laboratory" data-lesson-id="lesson-sync">
        <div class="lab-autosave-indicator">Guardado automático</div>
      </section>
    `;

    const tables = [createDefaultLabTable()];
    syncLabState('lab-sync', tables);

    expect(localStorage.getItem('datalab_lab_lesson-sync')).toContain('MiTabla1');
    expect(document.querySelector('.lab-autosave-indicator')?.textContent).toBe('Guardado');

    await vi.advanceTimersByTimeAsync(1200);

    expect(document.querySelector('.lab-autosave-indicator')?.textContent).toBe('Guardado automático');
  });

  it('ignores localStorage for non persistent routing sandboxes', () => {
    localStorage.setItem(
      'datalab_lab_lesson-sandbox',
      JSON.stringify([
        {
          tableId: 'broken',
          tableName: 'Rotto',
          columns: [],
          rows: [],
        },
      ]),
    );

    const tables = resolveLabTables(
      {
        type: 'table-laboratory',
        persist: false,
        initialTables: createRoutingSandboxTables(),
      },
      'lesson-sandbox',
    );

    expect(tables).toHaveLength(3);
    expect(tables[0]).toMatchObject({
      tableId: 'sandbox-ventas',
      tableName: 'Ventas',
      x: 320,
      y: 56,
    });
  });

  it('re-renders and persists the lab after a mutation', () => {
    document.body.innerHTML = `
      <section id="lab-mutate" class="table-laboratory" data-lesson-id="lesson-mutate">
        <div id="lab-mutate-canvas"></div>
        <div class="lab-autosave-indicator">Guardado automático</div>
      </section>
    `;

    const renderLabTable = (table: { tableName: string }, index: number) => `
      <article class="lab-table-item" data-table-id="table-${index}">
        <span class="table-name-display">${table.tableName}</span>
      </article>
    `;

    const tables = mutateLabState('lab-mutate', renderLabTable, (snapshot) => {
      snapshot.push({
        tableId: 'new-table',
        tableName: 'Productos',
        columns: [],
        rows: [],
      });
    });

    expect(tables).toHaveLength(1);
    expect(document.getElementById('lab-mutate-canvas')?.innerHTML).toContain('Productos');
    expect(localStorage.getItem('datalab_lab_lesson-mutate')).toContain('Productos');
  });
});
