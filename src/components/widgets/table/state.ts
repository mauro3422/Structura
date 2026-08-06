import { getLabState } from './reader.ts';
import { createTableId, getDefaultLabTables as loadDefaultLabTables, resolveLabTables, saveLabTables } from './persistence.ts';
import { renderCanvas, updateRelationships } from './dom.ts';
import { runValidation } from './validation.ts';
import type { RenderLabTable, TableDefinition } from './types.ts';

const autosaveTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

export { getLabState, renderCanvas, updateRelationships };

export function getDefaultLabTables(): TableDefinition[] {
  return loadDefaultLabTables();
}

export { createTableId, resolveLabTables };

export function syncLabState(labId: string, tables: TableDefinition[]): void {
  const lab = document.getElementById(labId) as HTMLElement | null;
  if (!lab) return;
  const lessonId = lab.dataset.lessonId || '';

  saveLabTables(lessonId, tables);

  const indicator = lab.querySelector<HTMLElement>('.lab-autosave-indicator');
  if (indicator) {
    indicator.textContent = 'Guardado';
    const previousTimer = autosaveTimers.get(lab);
    if (previousTimer) clearTimeout(previousTimer);

    const timer = setTimeout(() => {
      indicator.textContent = 'Guardado automático';
      autosaveTimers.delete(lab);
    }, 1200);
    autosaveTimers.set(lab, timer);
  }

  runValidation(labId);
}

export function mutateLabState(
  labId: string,
  renderLabTable: RenderLabTable,
  mutator: (tables: TableDefinition[]) => boolean | void,
): TableDefinition[] {
  const tables = getLabState(labId);
  const result = mutator(tables);
  if (result === false) return tables;
  renderCanvas(labId, tables, renderLabTable);
  syncLabState(labId, tables);
  return tables;
}
