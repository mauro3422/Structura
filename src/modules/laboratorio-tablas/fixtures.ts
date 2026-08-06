import type { TableLaboratoryTable } from '../../core/moduleTypes.ts';

export function createRoutingSandboxTables(): TableLaboratoryTable[] {
  return [
    {
      tableId: 'sandbox-ventas',
      tableName: 'Ventas',
      columns: [
        { name: 'ID', type: 'INT', autoIncrement: true, isPK: true },
        { name: 'CLIENTE_ID', type: 'INT', isFK: true, references: 'sandbox-clientes', cardinality: '1:N' },
        { name: 'PRODUCTO_ID', type: 'INT', isFK: true, references: 'sandbox-productos', cardinality: '1:N' },
      ],
      rows: [
        ['1', '1', '1'],
        ['2', '2', '1'],
      ],
      x: 320,
      y: 56,
    },
    {
      tableId: 'sandbox-clientes',
      tableName: 'Clientes',
      columns: [
        { name: 'ID', type: 'INT', autoIncrement: true, isPK: true },
        { name: 'NOMBRE', type: 'TEXT' },
      ],
      rows: [['1', 'Ana']],
      x: 224,
      y: 520,
    },
    {
      tableId: 'sandbox-productos',
      tableName: 'Productos',
      columns: [
        { name: 'ID', type: 'INT', autoIncrement: true, isPK: true },
        { name: 'NOMBRE', type: 'TEXT' },
      ],
      rows: [['1', 'Teclado']],
      x: 496,
      y: 520,
    },
  ];
}
