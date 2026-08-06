import { describe, expect, it, beforeEach } from 'vitest';
import { renderTableLaboratory } from '../src/components/widgets/table/renderers.ts';
import { updateObservations, updateRelationships } from '../src/components/widgets/table/dom.ts';

describe('Laboratorio SQL - Agent Verification (10 Cases)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main-content"></main>';
  });

  const getPanelText = (selector: string) => {
    return document.querySelector(selector)?.textContent || '';
  };

  it('Case 1: 3 Tables joined to a Master Table', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case1';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        {
          tableId: 'master',
          tableName: 'Clientes',
          columns: [{ name: 'id', type: 'INT', isPK: true }],
          rows: [['1']]
        },
        {
          tableId: 't1',
          tableName: 'Pedidos',
          columns: [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'cliente_id', type: 'INT', isFK: true, references: 'master' }
          ],
          rows: [['101', '1']]
        },
        {
          tableId: 't2',
          tableName: 'Comentarios',
          columns: [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'cliente_id', type: 'INT', isFK: true, references: 'master' }
          ],
          rows: [['1', '1']]
        },
        {
          tableId: 't3',
          tableName: 'Direcciones',
          columns: [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'cliente_id', type: 'INT', isFK: true, references: 'master' }
          ],
          rows: [['1', '1']]
        }
      ]
    }, 0, 'case1');

    updateObservations(labId);
    updateRelationships(labId);

    const relText = getPanelText('.lab-relations-panel');
    expect(relText).toContain('3 total');
    expect(relText).toContain('3 directas');
    expect(relText).toContain('Pedidos.cliente_id -> Clientes');
    expect(relText).toContain('Comentarios.cliente_id -> Clientes');
    expect(relText).toContain('Direcciones.cliente_id -> Clientes');
  });

  it('Case 2: Bridge Table (N:N)', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case2';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        { tableId: 'p', tableName: 'Productos', columns: [{ name: 'id', type: 'INT', isPK: true }], rows: [['1']] },
        { tableId: 'c', tableName: 'Categorias', columns: [{ name: 'id', type: 'INT', isPK: true }], rows: [['1']] },
        {
          tableId: 'bridge',
          tableName: 'Producto_Categoria',
          columns: [
            { name: 'pid', type: 'INT', isFK: true, references: 'p' },
            { name: 'cid', type: 'INT', isFK: true, references: 'c' }
          ],
          rows: [['1', '1']]
        }
      ]
    }, 0, 'case2');

    updateObservations(labId);
    updateRelationships(labId);

    const obsText = getPanelText('.lab-observations-panel');
    expect(obsText).toContain('Tabla puente candidata');
    expect(obsText).toContain('Producto_Categoria conecta Productos y Categorias');

    const relText = getPanelText('.lab-relations-panel');
    expect(relText).toContain('N:N inferida vía Producto_Categoria');
  });

  it('Case 3: Missing PK Warning', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case3';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [{ tableName: 'SinPK', columns: [{ name: 'dato', type: 'TEXT' }], rows: [['hola']] }]
    }, 0, 'case3');

    updateObservations(labId);
    expect(getPanelText('.lab-observations-panel')).toContain('Falta clave primaria');
  });

  it('Case 4: Duplicate Table Name Error', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case4';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        { tableName: 'Repetida', columns: [{ name: 'id', type: 'INT', isPK: true }], rows: [['1']] },
        { tableName: 'Repetida', columns: [{ name: 'id', type: 'INT', isPK: true }], rows: [['2']] }
      ]
    }, 0, 'case4');

    updateObservations(labId);
    expect(getPanelText('.lab-observations-panel')).toContain('Nombre de tabla duplicado');
  });

  it('Case 5: Invalid FK Error', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case5';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        { tableName: 'Huerfana', columns: [{ name: 'ref_id', type: 'INT', isFK: true, references: '' }], rows: [['1']] }
      ]
    }, 0, 'case5');

    updateObservations(labId);
    expect(getPanelText('.lab-observations-panel')).toContain('Relación inválida');
    expect(getPanelText('.lab-observations-panel')).toContain('no apunta a ninguna tabla');
  });

  it('Case 6: Naming Convention Suggestion', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case6';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        { tableName: 'Test', columns: [{ name: 'User Name', type: 'TEXT' }], rows: [['Juan']] }
      ]
    }, 0, 'case6');

    updateObservations(labId);
    expect(getPanelText('.lab-observations-panel')).toContain('Sugerencia de nombre');
    expect(getPanelText('.lab-observations-panel')).toContain('Sugerencia: userName');
  });

  it('Case 7: Composite PK Identification', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case7';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        {
          tableName: 'Stock',
          columns: [
            { name: 'aid', type: 'INT', isPK: true },
            { name: 'pid', type: 'INT', isPK: true }
          ],
          rows: [['1', '1']]
        }
      ]
    }, 0, 'case7');

    updateObservations(labId);
    expect(getPanelText('.lab-observations-panel')).toContain('Clave primaria compuesta');
  });

  it('Case 8: Strict 1:1 Violation Warning', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case8';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        { tableId: 'u', tableName: 'Users', columns: [{ name: 'id', type: 'INT', isPK: true }], rows: [['1']] },
        {
          tableId: 'p',
          tableName: 'Profiles',
          columns: [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'uid', type: 'INT', isFK: true, references: 'u', cardinality: '1:1' }
          ],
          rows: [['10', '1']]
        }
      ]
    }, 0, 'case8');

    updateObservations(labId);
    expect(getPanelText('.lab-observations-panel')).toContain('1:1 a revisar');
    expect(getPanelText('.lab-observations-panel')).toContain('la FK no es PK');
  });

  it('Case 9: Relational Chain (Paises -> Provincias -> Ciudades)', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case9';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        { tableId: 'pa', tableName: 'Paises', columns: [{ name: 'id', type: 'INT', isPK: true }], rows: [['1']] },
        {
          tableId: 'pr',
          tableName: 'Provincias',
          columns: [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'pais_id', type: 'INT', isFK: true, references: 'pa' }
          ],
          rows: [['1', '1']]
        },
        {
          tableId: 'ci',
          tableName: 'Ciudades',
          columns: [
            { name: 'id', type: 'INT', isPK: true },
            { name: 'prov_id', type: 'INT', isFK: true, references: 'pr' }
          ],
          rows: [['1', '1']]
        }
      ]
    }, 0, 'case9');

    updateObservations(labId);
    updateRelationships(labId);

    const relText = getPanelText('.lab-relations-panel');
    expect(relText).toContain('Provincias.pais_id -> Paises');
    expect(relText).toContain('Ciudades.prov_id -> Provincias');
  });

  it('Case 10: Empty Table Name Error', () => {
    const main = document.getElementById('main-content') as HTMLElement;
    const labId = 'table-lab-case10';

    main.innerHTML = renderTableLaboratory({
      type: 'table-laboratory',
      initialTables: [
        { tableName: '', columns: [{ name: 'id', type: 'INT', isPK: true }], rows: [['1']] }
      ]
    }, 0, 'case10');

    updateObservations(labId);
    expect(getPanelText('.lab-observations-panel')).toContain('Nombre de tabla vacío');
  });
});
