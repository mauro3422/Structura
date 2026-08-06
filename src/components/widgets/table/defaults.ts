import type { TableDefinition } from './types.ts';

export function createDefaultLabTable(): TableDefinition {
  return {
    tableName: 'MiTabla1',
    columns: [
      { name: 'ID', type: 'INT', autoIncrement: true, isPK: true },
      { name: 'Nombre', type: 'TEXT' },
    ],
    rows: [['1', 'Ejemplo']],
    x: 64,
    y: 56,
  };
}

export function createDefaultLabTables(): TableDefinition[] {
  return [createDefaultLabTable()];
}
