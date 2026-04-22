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
  tableName: string;
  columns: TableColumn[];
  rows: TableCellValue[][];
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
