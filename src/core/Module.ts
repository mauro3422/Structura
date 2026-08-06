import type {
  CellValue,
  ComparisonSection,
  ComparisonSide,
  ComparisonOptions,
  ConceptCard,
  DataTypeItem,
  GlossaryTerm,
  LessonConfig,
  LessonMeta,
  LessonSection,
  InfoSectionOptions,
  ModuleColor,
  ModuleConfig,
  ModuleMeta,
  InteractiveTableOptions,
  MagicTableOptions,
  SearchAnimationSection,
  StatItem,
  StepAnimationSection,
  StepAnimationConfig,
  TableColumn,
  TableColumnOptions,
  TableLaboratoryTable,
  TableLaboratoryOptions,
  TimelineEvent,
} from './moduleTypes.ts';

export type {
  CellValue,
  ComparisonSection,
  ComparisonSide,
  ComparisonOptions,
  ConceptCard,
  DataTypeItem,
  GlossaryTerm,
  LessonConfig,
  LessonMeta,
  LessonSection,
  InfoSectionOptions,
  ModuleColor,
  ModuleConfig,
  ModuleMeta,
  InteractiveTableOptions,
  MagicTableOptions,
  SearchAnimationSection,
  StatItem,
  StepAnimationSection,
  StepAnimationConfig,
  TableColumn,
  TableColumnOptions,
  TableLaboratoryTable,
  TableLaboratoryOptions,
  TimelineEvent,
} from './moduleTypes.ts';

export class Lesson {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly duration: string;
  readonly index: number;
  readonly module: Module;
  readonly sections: LessonSection[];

  constructor(config: LessonConfig, index: number, module: Module) {
    this.id = config.id;
    this.title = config.title;
    this.description = config.description ?? '';
    this.duration = config.duration ?? '';
    this.index = index;
    this.module = module;
    this.sections = config.sections ? [...config.sections] : [];
  }

  getNext(): Lesson | null {
    return this.module.lessons[this.index + 1] || null;
  }

  getPrev(): Lesson | null {
    return this.module.lessons[this.index - 1] || null;
  }

  toMeta(): LessonMeta {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      duration: this.duration,
      index: this.index,
    };
  }
}

export class Module {
  readonly id: string;
  readonly icon: string;
  readonly color: ModuleColor;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly lessons: Lesson[];
  readonly glossary: GlossaryTerm[];

  constructor(config: ModuleConfig) {
    this.id = config.id;
    this.icon = config.icon ?? '📦';
    this.color = config.color ?? 'primary';
    this.title = config.title;
    this.description = config.description;
    this.order = config.order ?? 99;
    this.lessons = (config.lessons ?? []).map((lessonConfig, index) => new Lesson(lessonConfig, index, this));
    this.glossary = (config.glossary ?? []).map((entry) => ({ ...entry }));
  }

  getLesson(lessonId: string): Lesson | null {
    return this.lessons.find((lesson) => lesson.id === lessonId) || null;
  }

  toMeta(): ModuleMeta {
    return {
      id: this.id,
      icon: this.icon,
      color: this.color,
      title: this.title,
      description: this.description,
      lessonCount: this.lessons.length,
      lessons: this.lessons.map((lesson) => lesson.toMeta()),
    };
  }
}

export class LessonBuilder {
  private readonly _id: string;
  private readonly _title: string;
  private _description = '';
  private _duration = '';
  private _sections: LessonSection[] = [];

  constructor(id: string, title: string) {
    this._id = id;
    this._title = title;
  }

  description(desc: string) {
    this._description = desc;
    return this;
  }

  duration(dur: string) {
    this._duration = dur;
    return this;
  }

  text(content: string) {
    this._sections.push({ type: 'text', content });
    return this;
  }

  heading(content: string) {
    this._sections.push({ type: 'heading', content });
    return this;
  }

  info(content: string, { variant = 'primary', icon = '💡' }: InfoSectionOptions = {}) {
    this._sections.push({ type: 'info', content, variant, icon });
    return this;
  }

  conceptCards(items: ReadonlyArray<ConceptCard>) {
    this._sections.push({ type: 'concept-cards', items: items.map((item) => ({ ...item })) });
    return this;
  }

  tableExample(tableName: string, columns: ReadonlyArray<TableColumn>, rows: ReadonlyArray<ReadonlyArray<CellValue>>) {
    this._sections.push({
      type: 'table-example',
      tableName,
      columns: columns.map((column) => ({ ...column })),
      rows: rows.map((row) => [...row]),
    });
    return this;
  }

  interactiveTable(
    tableName: string,
    columns: ReadonlyArray<TableColumn>,
    initialRows: ReadonlyArray<ReadonlyArray<CellValue>> = [],
    options: InteractiveTableOptions = {},
  ) {
    this._sections.push({
      type: 'interactive-table',
      tableName,
      columns: columns.map((column) => ({ ...column })),
      initialRows: initialRows.map((row) => [...row]),
      editable: options.editable !== false,
      canAddRows: options.canAddRows !== false,
      canAddColumns: options.canAddColumns !== false,
    });
    return this;
  }

  dataTypes(items: ReadonlyArray<DataTypeItem>) {
    this._sections.push({ type: 'data-types', items: items.map((item) => ({ ...item })) });
    return this;
  }

  code(language: string, code: string) {
    this._sections.push({ type: 'code', language, code });
    return this;
  }

  diagram(code: string, format = 'mermaid') {
    this._sections.push({ type: 'diagram', format, code });
    return this;
  }

  quiz(question: string, options: ReadonlyArray<string>, correctIndex: number, explanation: string) {
    this._sections.push({ type: 'quiz', question, options: [...options], correctIndex, explanation });
    return this;
  }

  timeline(events: ReadonlyArray<TimelineEvent>) {
    this._sections.push({ type: 'timeline', events: events.map((event) => ({ ...event })) });
    return this;
  }

  stats(items: ReadonlyArray<StatItem>) {
    this._sections.push({ type: 'stats', items: items.map((item) => ({ ...item })) });
    return this;
  }

  searchAnimation(algorithm: string, data: ReadonlyArray<number | string>, target: number | string) {
    this._sections.push({ type: 'search-animation', algorithm, data: [...data], target });
    return this;
  }

  magicTable(
    tableName: string,
    columns: ReadonlyArray<TableColumn>,
    rows: ReadonlyArray<ReadonlyArray<CellValue>>,
    definition: string,
    options: MagicTableOptions = {},
  ) {
    this._sections.push({
      type: 'magic-table',
      tableName,
      columns: columns.map((column) => ({ ...column })),
      rows: rows.map((row) => [...row]),
      definition,
      interactive: options.interactive === true,
      narrative: options.narrative === true,
    });
    return this;
  }

  tableLaboratory(initialTables: ReadonlyArray<TableLaboratoryTable> = [], options: TableLaboratoryOptions = {}) {
    this._sections.push({
      type: 'table-laboratory',
      persist: options.persist !== false,
      initialTables: initialTables.map((table) => ({
        ...table,
        columns: table.columns.map((column) => ({ ...column })),
        rows: table.rows.map((row) => [...row]),
      })),
    });
    return this;
  }

  stepAnimation(config: StepAnimationConfig) {
    this._sections.push({
      type: 'step-animation',
      ...config,
      steps: config.steps.map((step) => ({ ...step })),
    });
    return this;
  }

  private cloneComparisonSide(side: string | ComparisonSide): string | ComparisonSide {
    return typeof side === 'string' ? side : { ...side };
  }

  comparison(
    left: string | ComparisonSide,
    right: string | ComparisonSide,
    options: ComparisonOptions = {},
  ) {
    this._sections.push({
      type: 'comparison',
      left: this.cloneComparisonSide(left),
      right: this.cloneComparisonSide(right),
      title: options.title || '',
      summary: options.summary || '',
      open: options.open === true,
    });
    return this;
  }

  build(): LessonConfig {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      duration: this._duration,
      sections: [...this._sections],
    };
  }
}

export function lesson(id: string, title: string) {
  return new LessonBuilder(id, title);
}

export function concept(icon: string, title: string, description: string, color = 'primary'): ConceptCard {
  return { icon, title, description, color };
}

export function dataType(type: string, name: string, example: string, icon: string): DataTypeItem {
  return { type, name, example, icon };
}

export function col(name: string, type: string, options: TableColumnOptions = {}): TableColumn {
  return { name, type, ...options };
}

export function event(year: string, title: string, description: string, icon = '📌'): TimelineEvent {
  return { year, title, description, icon };
}

export function stat(value: string | number, label: string, icon = '📊'): StatItem {
  return { value, label, icon };
}

export function term(termValue: string, definition: string, category = 'general'): GlossaryTerm {
  return { term: termValue, definition, category };
}
