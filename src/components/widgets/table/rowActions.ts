import { mutateLabState } from './state.ts';
import type { RenderLabTable, TableDefinition } from './types.ts';

function updateLab(renderLabTable: RenderLabTable, labId: string, mutator: (tables: TableDefinition[]) => boolean | void): void {
  mutateLabState(labId, renderLabTable, mutator);
}

export function addRow(labId: string, renderLabTable: RenderLabTable, tableIndex: number): void {
  updateLab(renderLabTable, labId, (tables) => {
    const liveTable = tables[tableIndex];
    if (!liveTable) return false;
    const newRow = liveTable.columns.map((column) => (column.autoIncrement ? (liveTable.rows.length + 1).toString() : ''));
    liveTable.rows.push(newRow);
  });
}

export function deleteRow(labId: string, renderLabTable: RenderLabTable, tableIndex: number, rowIndex: number): void {
  updateLab(renderLabTable, labId, (tables) => {
    const liveTable = tables[tableIndex];
    if (!liveTable) return false;
    liveTable.rows.splice(rowIndex, 1);
  });
}
