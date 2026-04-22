import { describe, expect, it } from 'vitest';
import { createDefaultLabTable } from '../src/components/widgets/table/markup.ts';
import { renderInteractiveTable, renderLabTable, renderTableExample, renderTableLaboratory } from '../src/components/widgets/table/renderers.ts';

describe('Table renderers', () => {
  it('creates the default lab table with the starter schema', () => {
    const table = createDefaultLabTable();

    expect(table.tableName).toBe('MiTabla1');
    expect(table.columns).toHaveLength(2);
    expect(table.columns[0]).toMatchObject({ name: 'ID', isPK: true, autoIncrement: true });
    expect(table.rows[0]).toEqual(['1', 'Ejemplo']);
  });

  it('renders a table example with expected structure', () => {
    const html = renderTableExample(
      {
        type: 'table-example',
        tableName: 'Usuarios',
        columns: [{ name: 'ID', type: 'INT', isPK: true }],
        rows: [['1']],
      },
      0,
    );

    expect(html).toContain('Usuarios');
    expect(html).toContain('data-table-wrapper');
    expect(html).toContain('table-example-0-body');
  });

  it('renders an interactive table with add controls', () => {
    const html = renderInteractiveTable(
      {
        type: 'interactive-table',
        tableName: 'Productos',
        columns: [{ name: 'Nombre', type: 'TEXT' }],
        initialRows: [['A']],
        editable: true,
        canAddRows: true,
        canAddColumns: true,
      },
      1,
      'lesson-1',
    );

    expect(html).toContain('interactive-table-lesson-1-1');
    expect(html).toContain('+ Agregar fila');
    expect(html).toContain('data-table__add-col');
  });

  it('renders the laboratory wrapper and table markup', () => {
    const html = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [],
      },
      0,
      'lesson-1',
    );

    const labTable = renderLabTable(
      {
        tableName: 'Personas',
        columns: [{ name: 'ID', type: 'INT', isPK: true }],
        rows: [['1']],
      },
      0,
      'lesson-1',
      [],
    );

    expect(html).toContain('table-laboratory');
    expect(html).toContain('Guardar laboratorio');
    expect(html).toContain('Reglas del laboratorio');
    expect(labTable).toContain('lab-table-header');
    expect(labTable).toContain('Personas');
    expect(labTable).toContain('lab-row-delete');
  });
});
