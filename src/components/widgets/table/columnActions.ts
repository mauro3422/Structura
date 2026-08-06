import { mutateLabState } from './state.ts';
import type { RenderLabTable, TableColumn, TableDefinition } from './types.ts';

function updateLab(renderLabTable: RenderLabTable, labId: string, mutator: (tables: TableDefinition[]) => boolean | void): void {
  mutateLabState(labId, renderLabTable, mutator);
}

export function addColumn(labId: string, renderLabTable: RenderLabTable, tableIndex: number): void {
  updateLab(renderLabTable, labId, (tables) => {
    const liveTable = tables[tableIndex];
    if (!liveTable) return false;
    liveTable.columns.push({ name: `Col_${liveTable.columns.length + 1}`, type: 'TEXT' });
    liveTable.rows.forEach((row) => row.push(''));
  });
}

export function deleteColumn(
  labId: string,
  renderLabTable: RenderLabTable,
  tableIndex: number,
  columnIndex: number,
  column: TableColumn | undefined,
): void {
  if (!column) return;

  updateLab(renderLabTable, labId, (tables) => {
    const liveTable = tables[tableIndex];
    if (!liveTable) return false;
    if (liveTable.columns.length <= 1) return false;
    liveTable.columns.splice(columnIndex, 1);
    liveTable.rows.forEach((row) => row.splice(columnIndex, 1));
  });
}

export function toggleColumnMeta(labId: string, renderLabTable: RenderLabTable, tableIndex: number, columnIndex: number, action: string | null): void {
  updateLab(renderLabTable, labId, (tables) => {
    const liveTable = tables[tableIndex];
    const column = liveTable?.columns[columnIndex];
    if (!column) return false;
    if (action === 'toggle-pk') {
      column.isPK = !column.isPK;
    } else if (action === 'toggle-fk') {
      column.isFK = !column.isFK;
    }
  });
}

export function toggleCardinality(labId: string, renderLabTable: RenderLabTable, tableIndex: number, columnIndex: number): void {
  updateLab(renderLabTable, labId, (tables) => {
    const liveTable = tables[tableIndex];
    const column = liveTable?.columns[columnIndex];
    if (!column) return false;
    column.cardinality = column.cardinality === '1:1' ? '1:N' : '1:1';
  });
}
