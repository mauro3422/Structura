export type ModuleColor = 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | string;

export type CellValue = string | number | boolean | null;

export interface ConceptCard {
  icon: string;
  title: string;
  description: string;
  color?: string;
}

export interface TableColumn {
  name: string;
  type: string;
  isPK?: boolean;
  isFK?: boolean;
  autoIncrement?: boolean;
  placeholder?: string;
  [key: string]: unknown;
}

export interface DataTypeItem {
  type: string;
  name: string;
  example: string;
  icon: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon?: string;
}

export interface StatItem {
  value: string | number;
  label: string;
  icon?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

export interface ComparisonSide {
  title?: string;
  content?: string;
}

export interface StepAnimationStep {
  text?: string;
  icon?: string;
}

export interface TableLaboratoryTable {
  [key: string]: unknown;
}

export interface TextSection {
  type: 'text';
  content: string;
}

export interface HeadingSection {
  type: 'heading';
  content: string;
}

export interface InfoSection {
  type: 'info';
  content: string;
  variant?: string;
  icon?: string;
}

export interface ConceptCardsSection {
  type: 'concept-cards';
  items: ConceptCard[];
}

export interface TableExampleSection {
  type: 'table-example';
  tableName: string;
  columns: TableColumn[];
  rows: CellValue[][];
}

export interface InteractiveTableSection {
  type: 'interactive-table';
  tableName: string;
  columns: TableColumn[];
  initialRows: CellValue[][];
  editable: boolean;
  canAddRows: boolean;
  canAddColumns: boolean;
}

export interface DataTypesSection {
  type: 'data-types';
  items: DataTypeItem[];
}

export interface CodeSection {
  type: 'code';
  language: string;
  code: string;
}

export interface DiagramSection {
  type: 'diagram';
  format: string;
  code: string;
}

export interface QuizSection {
  type: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TimelineSection {
  type: 'timeline';
  events: TimelineEvent[];
}

export interface StatsSection {
  type: 'stats';
  items: StatItem[];
}

export interface SearchAnimationSection {
  type: 'search-animation';
  algorithm: string;
  data: Array<number | string>;
  target: number | string;
}

export interface MagicTableSection {
  type: 'magic-table';
  tableName: string;
  columns: TableColumn[];
  rows: CellValue[][];
  definition: string;
  interactive: boolean;
  narrative: boolean;
}

export interface TableLaboratorySection {
  type: 'table-laboratory';
  initialTables: TableLaboratoryTable[];
}

export interface StepAnimationSection {
  type: 'step-animation';
  title?: string;
  steps: StepAnimationStep[];
}

export interface ComparisonSection {
  type: 'comparison';
  left: string | ComparisonSide;
  right: string | ComparisonSide;
  title: string;
  summary: string;
  open: boolean;
}

export type LessonSection =
  | TextSection
  | HeadingSection
  | InfoSection
  | ConceptCardsSection
  | TableExampleSection
  | InteractiveTableSection
  | DataTypesSection
  | CodeSection
  | DiagramSection
  | QuizSection
  | TimelineSection
  | StatsSection
  | SearchAnimationSection
  | MagicTableSection
  | TableLaboratorySection
  | StepAnimationSection
  | ComparisonSection;

export interface LessonConfig {
  id: string;
  title: string;
  description: string;
  duration: string;
  sections: LessonSection[];
}

export interface ModuleConfig {
  id: string;
  icon?: string;
  color?: ModuleColor;
  title: string;
  description: string;
  order?: number;
  lessons?: LessonConfig[];
  glossary?: GlossaryTerm[];
}

export interface LessonMeta {
  id: string;
  title: string;
  description: string;
  duration: string;
  index: number;
}

export interface ModuleMeta {
  id: string;
  icon: string;
  color: ModuleColor;
  title: string;
  description: string;
  lessonCount: number;
  lessons: LessonMeta[];
}
