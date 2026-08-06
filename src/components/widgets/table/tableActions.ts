import { createTableId } from './persistence.ts';
import { mutateLabState } from './state.ts';
import { suggestNextTablePosition } from '../stage/index.ts';
import type { RenderLabTable, TableDefinition } from './types.ts';

const newTableTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

function scrollTableIntoView(element: Element): void {
  if (!(element instanceof HTMLElement)) return;
  if (typeof element.scrollIntoView !== 'function') return;
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function flashNewTable(tableEl: HTMLElement): void {
  const previousTimer = newTableTimers.get(tableEl);
  if (previousTimer) clearTimeout(previousTimer);

  tableEl.classList.add('lab-table-item--new-flash');
  const timer = setTimeout(() => {
    tableEl.classList.remove('lab-table-item--new-flash');
    newTableTimers.delete(tableEl);
  }, 2000);
  newTableTimers.set(tableEl, timer);
}

function updateLab(renderLabTable: RenderLabTable, labId: string, mutator: (tables: TableDefinition[]) => boolean | void): void {
  mutateLabState(labId, renderLabTable, mutator);
}

export function addNewTable(labId: string, renderLabTable: RenderLabTable): void {
  let newTableId = '';

  updateLab(renderLabTable, labId, (tables) => {
    const existingIds = tables.map((table) => table.tableId || '');
    const newId = createTableId(labId, tables.length, existingIds);
    const nextPosition = suggestNextTablePosition(tables);
    newTableId = newId;
    tables.unshift({
      tableId: newId,
      tableName: `NuevaTabla_${tables.length + 1}`,
      columns: [
        { name: 'ID', type: 'INT', isPK: true, autoIncrement: true },
        { name: 'C1', type: 'TEXT' },
      ],
      rows: [['1', '']],
      x: nextPosition.x,
      y: nextPosition.y,
    });
  });

  if (!newTableId) return;

  setTimeout(() => {
    const newTableEl = document.querySelector<HTMLElement>(`[data-table-id="${newTableId}"]`);
    if (!newTableEl) return;
    scrollTableIntoView(newTableEl);
    flashNewTable(newTableEl);
  }, 100);
}

export function deleteTable(labId: string, renderLabTable: RenderLabTable, tableItem: HTMLElement): void {
  const tableIndex = Number.parseInt(tableItem.dataset.index || '0', 10);

  updateLab(renderLabTable, labId, (tables) => {
    tables.splice(tableIndex, 1);
  });
}
