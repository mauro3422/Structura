import type {
  CellValue,
  ComparisonSection,
  ComparisonSide,
  ConceptCard,
  DataTypeItem,
  GlossaryTerm,
  LessonConfig,
  LessonMeta,
  LessonSection,
  ModuleColor,
  ModuleConfig,
  ModuleMeta,
  SearchAnimationSection,
  StatItem,
  StepAnimationSection,
  TableColumn,
  TableLaboratoryTable,
  TimelineEvent,
} from './moduleTypes.ts';

export type {
  CellValue,
  ComparisonSection,
  ComparisonSide,
  ConceptCard,
  DataTypeItem,
  GlossaryTerm,
  LessonConfig,
  LessonMeta,
  LessonSection,
  ModuleColor,
  ModuleConfig,
  ModuleMeta,
  SearchAnimationSection,
  StatItem,
  StepAnimationSection,
  TableColumn,
  TableLaboratoryTable,
  TimelineEvent,
} from './moduleTypes.ts';

export class Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  index: number;
  module: Module;
  sections: LessonSection[];

  constructor(config: LessonConfig, index: number, module: Module) {
    this.id = config.id;
    this.title = config.title;
    this.description = config.description || '';
    this.duration = config.duration || '';
    this.index = index;
    this.module = module;
    this.sections = config.sections || [];
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
  id: string;
  icon: string;
  color: ModuleColor;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  glossary: GlossaryTerm[];

  constructor(config: ModuleConfig) {
    this.id = config.id;
    this.icon = config.icon || '📦';
    this.color = config.color || 'primary';
    this.title = config.title;
    this.description = config.description;
    this.order = config.order || 99;
    this.lessons = (config.lessons || []).map((lessonConfig, index) => new Lesson(lessonConfig, index, this));
    this.glossary = config.glossary || [];
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

  info(content: string, { variant = 'primary', icon = '💡' }: { variant?: string; icon?: string } = {}) {
    this._sections.push({ type: 'info', content, variant, icon });
    return this;
  }

  conceptCards(items: ConceptCard[]) {
    this._sections.push({ type: 'concept-cards', items });
    return this;
  }

  tableExample(tableName: string, columns: TableColumn[], rows: CellValue[][]) {
    this._sections.push({ type: 'table-example', tableName, columns, rows });
    return this;
  }

  interactiveTable(
    tableName: string,
    columns: TableColumn[],
    initialRows: CellValue[][] = [],
    options: { editable?: boolean; canAddRows?: boolean; canAddColumns?: boolean } = {},
  ) {
    this._sections.push({
      type: 'interactive-table',
      tableName,
      columns,
      initialRows,
      editable: options.editable !== false,
      canAddRows: options.canAddRows !== false,
      canAddColumns: options.canAddColumns !== false,
    });
    return this;
  }

  dataTypes(items: DataTypeItem[]) {
    this._sections.push({ type: 'data-types', items });
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

  quiz(question: string, options: string[], correctIndex: number, explanation: string) {
    this._sections.push({ type: 'quiz', question, options, correctIndex, explanation });
    return this;
  }

  timeline(events: TimelineEvent[]) {
    this._sections.push({ type: 'timeline', events });
    return this;
  }

  stats(items: StatItem[]) {
    this._sections.push({ type: 'stats', items });
    return this;
  }

  searchAnimation(algorithm: string, data: Array<number | string>, target: number | string) {
    this._sections.push({ type: 'search-animation', algorithm, data, target });
    return this;
  }

  magicTable(
    tableName: string,
    columns: TableColumn[],
    rows: CellValue[][],
    definition: string,
    options: { interactive?: boolean; narrative?: boolean } = {},
  ) {
    this._sections.push({
      type: 'magic-table',
      tableName,
      columns,
      rows,
      definition,
      interactive: options.interactive === true,
      narrative: options.narrative === true,
    });
    return this;
  }

  tableLaboratory(initialTables: TableLaboratoryTable[] = []) {
    this._sections.push({
      type: 'table-laboratory',
      initialTables,
    });
    return this;
  }

  stepAnimation(config: Omit<StepAnimationSection, 'type'>) {
    this._sections.push({ type: 'step-animation', ...config });
    return this;
  }

  comparison(
    left: string | ComparisonSide,
    right: string | ComparisonSide,
    options: { title?: string; summary?: string; open?: boolean } = {},
  ) {
    this._sections.push({
      type: 'comparison',
      left,
      right,
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
      sections: this._sections,
    };
  }
}

export function lesson(id: string, title: string) {
  return new LessonBuilder(id, title);
}

export function concept(icon: string, title: string, description: string, color = 'primary') {
  return { icon, title, description, color };
}

export function dataType(type: string, name: string, example: string, icon: string): DataTypeItem {
  return { type, name, example, icon };
}

export function col(name: string, type: string, options: Record<string, unknown> = {}) {
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
