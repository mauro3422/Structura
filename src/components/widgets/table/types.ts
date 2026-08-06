export type TableCellValue = string | number | boolean | null | undefined;
export type TableCardinality = '1:1' | '1:N' | 'N:N';

export interface TableColumn {
  name: string;
  type: string;
  autoIncrement?: boolean;
  isPK?: boolean;
  isFK?: boolean;
  references?: string | null;
  cardinality?: TableCardinality;
  placeholder?: string;
}

export interface TableDefinition {
  tableId?: string;
  tableName: string;
  columns: TableColumn[];
  rows: TableCellValue[][];
  x?: number;
  y?: number;
}

export type TableDefinitionSeed = Pick<TableDefinition, 'tableName' | 'columns' | 'rows'> & Partial<Pick<TableDefinition, 'tableId'>>;

export interface TableRelationship {
  relationshipKind: 'direct' | 'derived';
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  bridgeTable?: string;
  cardinality: TableCardinality;
  sourceRole: string;
  targetRole: string;
  status: 'linked' | 'caution' | 'derived' | 'missing-target' | 'missing-reference';
  message: string;
}

export interface TableObservation {
  kind: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  hint?: string;
  subject?: string;
  tableId?: string;
  tableIds?: string[];
  tableName?: string;
  columnIndex?: number;
  columnName?: string;
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
