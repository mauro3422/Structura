/**
 * DataLab Module Registry
 * 
 * Centralized registry that discovers and manages all modules.
 * To add a new module, just import it and call registry.register().
 */

class ModuleRegistry {
  constructor() {
    /** @type {Map<string, import('./Module.js').Module>} */
    this._modules = new Map();
  }

  /** Register a module */
  register(mod) {
    this._modules.set(mod.id, mod);
    return this;
  }

  /** Get all modules sorted by order */
  getAll() {
    return [...this._modules.values()].sort((a, b) => a.order - b.order);
  }

  /** Get a specific module by ID */
  getModule(moduleId) {
    return this._modules.get(moduleId) || null;
  }

  /** Find which module contains a lesson */
  getModuleForLesson(lessonId) {
    for (const mod of this._modules.values()) {
      if (mod.getLesson(lessonId)) return mod;
    }
    return null;
  }

  /** Get a lesson by ID (searches all modules) */
  getLesson(lessonId) {
    for (const mod of this._modules.values()) {
      const lesson = mod.getLesson(lessonId);
      if (lesson) return lesson;
    }
    return null;
  }

  /** Get all glossary terms from all modules */
  getAllGlossary() {
    const terms = [];
    for (const mod of this._modules.values()) {
      terms.push(...mod.glossary);
    }
    return terms;
  }

  /** Get module count */
  get count() {
    return this._modules.size;
  }

  /** Get total lesson count across all modules */
  get totalLessons() {
    let count = 0;
    for (const mod of this._modules.values()) {
      count += mod.lessons.length;
    }
    return count;
  }
}

export const registry = new ModuleRegistry();
