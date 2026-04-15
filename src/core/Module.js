/**
 * DataLab Module System
 * 
 * Base class for all DataLab modules. Each module is a self-contained
 * educational unit with metadata, lessons, and glossary terms.
 * 
 * USAGE:
 *   import { Module } from '../core/Module.js';
 *   
 *   export default new Module({
 *     id: 'mi-modulo',
 *     icon: '📊',
 *     color: 'primary',
 *     title: 'Mi Módulo',
 *     description: 'Descripción corta',
 *     lessons: [ ... ],
 *     glossary: [ ... ],
 *   });
 */

export class Module {
  /**
   * @param {ModuleConfig} config
   */
  constructor(config) {
    this.id = config.id;
    this.icon = config.icon || '📦';
    this.color = config.color || 'primary';
    this.title = config.title;
    this.description = config.description;
    this.order = config.order || 99;
    this.lessons = (config.lessons || []).map((l, i) => new Lesson(l, i, this));
    this.glossary = config.glossary || [];
  }

  /** Get a lesson by its ID */
  getLesson(lessonId) {
    return this.lessons.find(l => l.id === lessonId) || null;
  }

  /** Get module metadata for listing */
  toMeta() {
    return {
      id: this.id,
      icon: this.icon,
      color: this.color,
      title: this.title,
      description: this.description,
      lessonCount: this.lessons.length,
      lessons: this.lessons.map(l => l.toMeta()),
    };
  }
}

export class Lesson {
  /**
   * @param {LessonConfig} config
   * @param {number} index
   * @param {Module} module
   */
  constructor(config, index, module) {
    this.id = config.id;
    this.title = config.title;
    this.description = config.description || '';
    this.duration = config.duration || '';
    this.index = index;
    this.module = module;
    this.sections = config.sections || [];
  }

  /** Get next lesson in the module */
  getNext() {
    return this.module.lessons[this.index + 1] || null;
  }

  /** Get previous lesson in the module */
  getPrev() {
    return this.module.lessons[this.index - 1] || null;
  }

  /** Metadata for listing */
  toMeta() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      duration: this.duration,
      index: this.index,
    };
  }
}

/* ============================================
   SECTION BUILDER API
   Fluent API for building lesson sections easily
   ============================================ */

export class LessonBuilder {
  constructor(id, title) {
    this._id = id;
    this._title = title;
    this._description = '';
    this._duration = '';
    this._sections = [];
  }

  description(desc) { this._description = desc; return this; }
  duration(dur) { this._duration = dur; return this; }

  // --- Content Sections ---

  /** Add a text paragraph (supports HTML) */
  text(content) {
    this._sections.push({ type: 'text', content });
    return this;
  }

  /** Add a heading */
  heading(content) {
    this._sections.push({ type: 'heading', content });
    return this;
  }

  /** Add an info/callout box */
  info(content, { variant = 'primary', icon = '💡' } = {}) {
    this._sections.push({ type: 'info', content, variant, icon });
    return this;
  }

  /** Add concept cards grid */
  conceptCards(items) {
    this._sections.push({ type: 'concept-cards', items });
    return this;
  }

  /** Add a static example table */
  tableExample(tableName, columns, rows) {
    this._sections.push({ type: 'table-example', tableName, columns, rows });
    return this;
  }

  /** Add an interactive editable table */
  interactiveTable(tableName, columns, initialRows = [], options = {}) {
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

  /** Add data types showcase */
  dataTypes(items) {
    this._sections.push({ type: 'data-types', items });
    return this;
  }

  /** Add a code block with syntax highlighting */
  code(language, code) {
    this._sections.push({ type: 'code', language, code });
    return this;
  }

  /** Add a quiz question */
  quiz(question, options, correctIndex, explanation) {
    this._sections.push({ type: 'quiz', question, options, correctIndex, explanation });
    return this;
  }

  /** Add a timeline */
  timeline(events) {
    this._sections.push({ type: 'timeline', events });
    return this;
  }

  /** Add statistics cards */
  stats(items) {
    this._sections.push({ type: 'stats', items });
    return this;
  }

  /** Add a search algorithm animation */
  searchAnimation(algorithm, data, target) {
    this._sections.push({ type: 'search-animation', algorithm, data, target });
    return this;
  }

  /** Add a step-by-step animation (generic) */
  stepAnimation(config) {
    this._sections.push({ type: 'step-animation', ...config });
    return this;
  }

  /** Add a comparison between two approaches */
  comparison(left, right) {
    this._sections.push({ type: 'comparison', left, right });
    return this;
  }

  /** Build the lesson config object */
  build() {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      duration: this._duration,
      sections: this._sections,
    };
  }
}

/** Shortcut to create a lesson builder */
export function lesson(id, title) {
  return new LessonBuilder(id, title);
}

/** Shortcut to create a concept card item */
export function concept(icon, title, description, color = 'primary') {
  return { icon, title, description, color };
}

/** Shortcut to create a data type item */
export function dataType(type, name, example, icon) {
  return { type, name, example, icon };
}

/** Shortcut to create a table column definition */
export function col(name, type, options = {}) {
  return { name, type, ...options };
}

/** Shortcut to create a timeline event */
export function event(year, title, description, icon = '📌') {
  return { year, title, description, icon };
}

/** Shortcut to create a stat card */
export function stat(value, label, icon = '📊') {
  return { value, label, icon };
}

/** Shortcut to create a glossary term */
export function term(term, definition, category = 'general') {
  return { term, definition, category };
}
