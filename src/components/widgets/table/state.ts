import { createDefaultLabTables } from './markup.ts';
import { getLabState, renderCanvas, updateObservations, updateRelationships } from './dom.ts';
import type { RenderLabTable, TableDefinition, TableSection } from './types.ts';

export function getDefaultLabTables(): TableDefinition[] {
  return createDefaultLabTables();
}

export function createTableId(lessonId: string, index: number, existingIds: Iterable<string> = []): string {
  const cleanLessonId = lessonId.trim() || 'lesson';
  const baseId = `table-${cleanLessonId}-${index + 1}`;
  const usedIds = new Set(existingIds);
  let tableId = baseId;
  let suffix = 1;

  while (usedIds.has(tableId)) {
    tableId = `${baseId}-${suffix++}`;
  }

  return tableId;
}

function ensureTableIds(tables: TableDefinition[], lessonId: string): TableDefinition[] {
  const usedIds = new Set<string>();

  return tables.map((table, index) => {
    const baseId = table.tableId?.trim() || createTableId(lessonId, index);
    let tableId = baseId;
    let suffix = 1;

    while (usedIds.has(tableId)) {
      tableId = `${baseId}-${suffix++}`;
    }

    usedIds.add(tableId);
    return { ...table, tableId };
  });
}

export function resolveLabTables(section: TableSection, lessonId: string): TableDefinition[] {
  if (typeof localStorage === 'undefined') {
    const baseTables = section.initialTables && section.initialTables.length > 0 ? section.initialTables : getDefaultLabTables();
    return ensureTableIds(baseTables, lessonId);
  }

  try {
    const saved = localStorage.getItem(`datalab_lab_${lessonId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return ensureTableIds(parsed, lessonId);
      }
    }
  } catch {
    // Use the lesson-provided data or the default starter table.
  }

  const baseTables = section.initialTables && section.initialTables.length > 0 ? section.initialTables : getDefaultLabTables();
  return ensureTableIds(baseTables, lessonId);
}

export function syncLabState(labId: string, tables: TableDefinition[]): void {
  const lab = document.getElementById(labId) as HTMLElement & { _autosaveStatusTimer?: ReturnType<typeof setTimeout> } | null;
  if (!lab) return;
  const lessonId = lab.dataset.lessonId || '';

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`datalab_lab_${lessonId}`, JSON.stringify(tables));
  }

  const indicator = lab.querySelector<HTMLElement>('.lab-autosave-indicator');
  if (indicator) {
    indicator.textContent = 'Guardado';
    if (lab._autosaveStatusTimer) clearTimeout(lab._autosaveStatusTimer);
    lab._autosaveStatusTimer = setTimeout(() => {
      indicator.textContent = 'Guardado automático';
    }, 1200);
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

export function runValidation(labId: string): void {
  const lab = document.getElementById(labId);
  if (!lab) return;

  lab.querySelectorAll<HTMLElement>('.lab-table-item').forEach((item) => {
    const pks = item.querySelectorAll('.meta-toggle[data-action="toggle-pk"].active');
    const warning = item.querySelector<HTMLElement>('.lab-table-warning');
    if (warning) {
      if (pks.length === 0) warning.classList.add('visible');
      else warning.classList.remove('visible');
    }
  });

  updateObservations(labId);
  updateRelationships(labId);
}

export function showStatus(labId: string, msg: string): void {
  const status = document.getElementById(`${labId}-status`) as HTMLElement | null;
  if (!status) return;
  status.textContent = msg;
  status.style.opacity = '1';
  status.style.transform = 'translateY(0)';
  setTimeout(() => {
    status.style.opacity = '0';
    status.style.transform = 'translateY(10px)';
  }, 2000);
}

export { getLabState, renderCanvas, updateRelationships };
