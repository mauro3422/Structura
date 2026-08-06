import { showConfirm } from '../Utils.ts';
import { getLabState } from './state.ts';
import { pushLabToast } from './feedback.ts';
import type { RenderLabTable } from './types.ts';
import { updateRuleHelp, saveCurrentLab } from './uiActions.ts';
import { addNewTable, deleteTable } from './tableActions.ts';
import { addColumn, deleteColumn, toggleColumnMeta, toggleCardinality } from './columnActions.ts';
import { addRow, deleteRow } from './rowActions.ts';

export async function dispatchLabClick(target: HTMLElement, labId: string, renderLabTable: RenderLabTable): Promise<boolean> {
  const ruleChip = target.closest('.lab-rule-chip') as HTMLElement | null;
  if (ruleChip) {
    updateRuleHelp(ruleChip);
    return true;
  }

  if (target.closest('[id$="-save"]')) {
    saveCurrentLab(labId);
    return true;
  }

  if (target.closest('[id$="-add-table"]')) {
    addNewTable(labId, renderLabTable);
    return true;
  }

  const delTableBtn = target.closest('.lab-table-delete');
  if (delTableBtn) {
    if (await showConfirm('¿Eliminar tabla?', 'Se borrarán todos sus datos y columnas.')) {
      const tableItem = delTableBtn.closest('.lab-table-item') as HTMLElement | null;
      if (tableItem) deleteTable(labId, renderLabTable, tableItem);
    }
    return true;
  }

  const tableItem = target.closest('.lab-table-item') as HTMLElement | null;
  if (!tableItem) return false;

  const tableIndex = Number.parseInt(tableItem.dataset.index || '0', 10);
  const tables = getLabState(labId);
  const table = tables[tableIndex];
  if (!table) return true;

  if (target.closest('.data-table__add-col')) {
    addColumn(labId, renderLabTable, tableIndex);
    return true;
  }

  const delColBtn = target.closest('.lab-col-delete');
  if (delColBtn) {
    const th = delColBtn.closest('th') as HTMLElement | null;
    if (!th) return true;
    const columnIndex = Number.parseInt(th.dataset.colIndex || '0', 10);
    const column = table.columns[columnIndex];

    if (table.columns.length <= 1) {
      pushLabToast(labId, {
        tone: 'warning',
        title: 'No se puede borrar',
        message: 'La tabla necesita al menos una columna. Agregá otra antes de borrar esta.',
        durationMs: 3400,
      });
      return true;
    }

    if (
      column?.isPK &&
      !(await showConfirm(
        '¿Eliminar clave primaria?',
        'Esta columna identifica los registros. Si la eliminas, la tabla quedará sin PK hasta que marques otra.',
      ))
    ) {
      return true;
    }

    deleteColumn(labId, renderLabTable, tableIndex, columnIndex, column);
    return true;
  }

  if (target.closest('.data-table__add-row')) {
    addRow(labId, renderLabTable, tableIndex);
    return true;
  }

  const delRowBtn = target.closest('.lab-row-delete');
  if (delRowBtn) {
    const tr = delRowBtn.closest('tr') as HTMLElement | null;
    if (!tr) return true;
    const rowIndex = Number.parseInt(tr.dataset.row || '0', 10);
    deleteRow(labId, renderLabTable, tableIndex, rowIndex);
    return true;
  }

  const meta = target.closest('.meta-toggle');
  if (meta) {
    const action = meta.getAttribute('data-action');
    const th = meta.closest('th') as HTMLElement | null;
    if (!th) return true;
    const columnIndex = Number.parseInt(th.dataset.colIndex || '0', 10);
    toggleColumnMeta(labId, renderLabTable, tableIndex, columnIndex, action);
    return true;
  }

  const cardBtn = target.closest('.cardinality-toggle');
  if (cardBtn) {
    const th = cardBtn.closest('th') as HTMLElement | null;
    if (!th) return true;
    const columnIndex = Number.parseInt(th.dataset.colIndex || '0', 10);
    toggleCardinality(labId, renderLabTable, tableIndex, columnIndex);
    return true;
  }

  return false;
}
