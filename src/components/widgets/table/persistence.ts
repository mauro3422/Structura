import { createDefaultLabTables } from './defaults.ts';
import { layoutLabTables } from '../stage/index.ts';
import type { TableDefinition } from './types.ts';
import type { TableLaboratorySection } from '../../../core/moduleTypes.ts';

const DEFAULT_TABLE_GAP_X = 448;
const DEFAULT_TABLE_GAP_Y = 272;
const DEFAULT_TABLE_START_X = 64;
const DEFAULT_TABLE_START_Y = 56;

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
    const x = typeof table.x === 'number' ? table.x : DEFAULT_TABLE_START_X + (index % 2) * DEFAULT_TABLE_GAP_X;
    const y = typeof table.y === 'number' ? table.y : DEFAULT_TABLE_START_Y + Math.floor(index / 2) * DEFAULT_TABLE_GAP_Y;

    return { ...table, tableId, x, y };
  });
}

export function getDefaultLabTables(): TableDefinition[] {
  return createDefaultLabTables();
}

export function resolveLabTables(section: TableLaboratorySection, lessonId: string): TableDefinition[] {
  const baseTables = section.initialTables && section.initialTables.length > 0 ? section.initialTables : getDefaultLabTables();

  if (section.persist === false) {
    return layoutLabTables(ensureTableIds(baseTables, lessonId));
  }

  if (typeof localStorage === 'undefined') {
    return layoutLabTables(ensureTableIds(baseTables, lessonId));
  }

  try {
    const saved = localStorage.getItem(`datalab_lab_${lessonId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return layoutLabTables(ensureTableIds(parsed, lessonId));
      }
    }
  } catch {
    // Use the lesson-provided data or the default starter table.
  }

  return layoutLabTables(ensureTableIds(baseTables, lessonId));
}

export function saveLabTables(lessonId: string, tables: TableDefinition[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(`datalab_lab_${lessonId}`, JSON.stringify(tables));
}
