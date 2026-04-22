import { describe, expect, it } from 'vitest';
import { renderTableLaboratory } from '../src/components/widgets/table/renderers.ts';
import { updateObservations } from '../src/components/widgets/table/dom.ts';

describe('Table observations panel', () => {
  it('suggests camelCase names and flags incomplete relations', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [
          {
            tableName: 'clientes_pedidos',
            columns: [
              { name: 'ID', type: 'INT', isPK: true },
              { name: 'Nombre_Cliente', type: 'TEXT' },
              { name: 'cliente_id', type: 'INT', isFK: true, cardinality: '1:N' },
            ],
            rows: [[1, 'Ana', 7]],
          },
        ],
      },
      0,
      'demo-observations',
    );

    updateObservations('table-lab-demo-observations');

    const panel = main.querySelector('.lab-observations-panel');
    expect(panel?.textContent).toContain('Sugerencia camelCase');
    expect(panel?.textContent).toContain('clientesPedidos');
    expect(panel?.textContent).toContain('nombreCliente');
    expect(panel?.textContent).toContain('Relación inválida');
  });
});
