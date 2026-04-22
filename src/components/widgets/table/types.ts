export type TableCellValue = string | number | boolean | null | undefined;

export interface TableColumn {
  name: string;
  type: string;
  autoIncrement?: boolean;
  isPK?: boolean;
  isFK?: boolean;
  references?: string | null;
  cardinality?: string;
  placeholder?: string;
}

export interface TableDefinition {
  tableId?: string;
  tableName: string;
  columns: TableColumn[];
  rows: TableCellValue[][];
}

export interface TableRelationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  cardinality: string;
  sourceRole: string;
  targetRole: string;
  status: 'linked' | 'caution' | 'missing-target' | 'missing-reference';
  message: string;
}

export interface TableObservation {
  kind: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  hint?: string;
  subject?: string;
}

export interface TableSection {
  tableName?: string;
  columns?: TableColumn[];
  rows?: TableCellValue[][];
  initialRows?: TableCellValue[][];
  initialTables?: TableDefinition[];
  canAddColumns?: boolean;
  canAddRows?: boolean;
  icon?: string;
  definition?: string;
  narrative?: boolean;
}

export type RenderLabTable = (
  table: TableDefinition,
  index: number,
  lessonId: string,
  allTables?: TableDefinition[],
) => string;
