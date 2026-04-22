import { describe, expect, it } from 'vitest';
import { renderTableLaboratory } from '../src/components/widgets/table/renderers.ts';
import { updateObservations } from '../src/components/widgets/table/dom.ts';

describe('Table observations panel', () => {
  it('highlights the exact table and column while allowing lowercase snake_case', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [
          {
            tableName: 'clientes_pedidos',
            columns: [
              { name: 'nombre_cliente', type: 'TEXT' },
              { name: 'cliente_id', type: 'INT', isFK: true, cardinality: '1:N' },
            ],
            rows: [['Ana', 7]],
          },
        ],
      },
      0,
      'demo-observations',
    );

    updateObservations('table-lab-demo-observations');

    const panel = main.querySelector('.lab-observations-panel');
    expect(panel?.textContent).toContain('Falta clave primaria');
    expect(panel?.textContent).toContain('Relación inválida');
    expect(panel?.textContent).not.toContain('Sugerencia de nombre');

    const tableItem = main.querySelector('.lab-table-item');
    expect(tableItem?.className).toContain('lab-table-item--observed-warning');

    const tableName = main.querySelector('.table-name-display');
    expect(tableName?.className).toContain('lab-table-name-observed--warning');

    const columnHeaders = main.querySelectorAll('.data-table__header-cell');
    expect(columnHeaders[0]?.className).not.toContain('lab-column-observed--info');
    expect(columnHeaders[1]?.className).toContain('lab-column-observed--error');
  });

  it('recognizes multiple primary keys as a composite key hint', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [
          {
            tableName: 'inventario_compuesto',
            columns: [
              { name: 'producto_id', type: 'INT', isPK: true },
              { name: 'almacen_id', type: 'INT', isPK: true },
              { name: 'stock', type: 'INT' },
            ],
            rows: [[1, 2, 40]],
          },
        ],
      },
      0,
      'demo-composite',
    );

    updateObservations('table-lab-demo-composite');

    const panel = main.querySelector('.lab-observations-panel');
    expect(panel?.textContent).toContain('Clave primaria compuesta');

    const tableItem = main.querySelector('.lab-table-item');
    expect(tableItem?.className).toContain('lab-table-item--observed-info');
  });
});
