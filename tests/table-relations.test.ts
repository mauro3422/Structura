import { describe, expect, it } from 'vitest';
import { renderTableLaboratory } from '../src/components/widgets/table/renderers.ts';
import { updateRelationships } from '../src/components/widgets/table/dom.ts';

describe('Table relationship panel', () => {
  it('describes 1:N as master/detail', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [
          {
            tableName: 'Clientes',
            columns: [
              { name: 'ID', type: 'INT', isPK: true },
              { name: 'Nombre', type: 'TEXT' },
            ],
            rows: [[1, 'Ana']],
          },
          {
            tableName: 'Pedidos',
            columns: [
              { name: 'ID', type: 'INT', isPK: true },
              { name: 'cliente_id', type: 'INT', isFK: true, references: 'table-demo-1', cardinality: '1:N' },
              { name: 'Total', type: 'FLOAT' },
            ],
            rows: [[1, 1, 1500]],
          },
        ],
      },
      0,
      'demo',
    );

    updateRelationships('table-lab-demo');

    const panel = main.querySelector('.lab-relations-panel');
    expect(panel?.textContent).toContain('Pedidos.cliente_id → Clientes');
    expect(panel?.textContent).toContain('detalle');
    expect(panel?.textContent).toContain('maestra');
    expect(panel?.textContent).toContain('1:N detectada. La tabla destino actua como maestra y la actual como detalle.');
  });

  it('flags 1:1 without a shared key as a caution', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [
          {
            tableName: 'Usuarios',
            columns: [
              { name: 'ID', type: 'INT', isPK: true },
              { name: 'Nombre', type: 'TEXT' },
            ],
            rows: [[1, 'Ana']],
          },
          {
            tableName: 'Perfiles',
            columns: [
              { name: 'ID', type: 'INT', isPK: true },
              { name: 'usuario_id', type: 'INT', isFK: true, references: 'table-demo-1-1-1', cardinality: '1:1' },
              { name: 'Bio', type: 'TEXT' },
            ],
            rows: [[1, 1, 'Perfil']],
          },
        ],
      },
      0,
      'demo-1-1',
    );

    updateRelationships('table-lab-demo-1-1');

    const panel = main.querySelector('.lab-relations-panel');
    expect(panel?.textContent).toContain('Revisar');
    expect(panel?.textContent).toContain('Referencia sugerida');
    expect(panel?.textContent).toContain('conviene que la FK sea unica o compartida con la PK.');
  });

  it('flags missing destinations as invalid relationships', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [
          {
            tableName: 'Pedidos',
            columns: [
              { name: 'ID', type: 'INT', isPK: true },
              { name: 'cliente_id', type: 'INT', isFK: true, cardinality: '1:N' },
              { name: 'Total', type: 'FLOAT' },
            ],
            rows: [[1, 99, 1500]],
          },
        ],
      },
      0,
      'demo-missing',
    );

    updateRelationships('table-lab-demo-missing');

    const panel = main.querySelector('.lab-relations-panel');
    expect(panel?.textContent).toContain('Relacion invalida');
    expect(panel?.textContent).toContain('Falta destino');
  });
});
