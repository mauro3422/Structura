import type { Lesson, Module } from './Module.ts';

class ModuleRegistry {
  private _modules: Map<string, Module>;

  constructor() {
    this._modules = new Map();
  }

  register(mod: Module) {
    this._modules.set(mod.id, mod);
    return this;
  }

  getAll() {
    return [...this._modules.values()].sort((a, b) => a.order - b.order);
  }

  getModule(moduleId: string): Module | null {
    return this._modules.get(moduleId) || null;
  }

  getModuleForLesson(lessonId: string): Module | null {
    for (const mod of this._modules.values()) {
      if (mod.getLesson(lessonId)) return mod;
    }
    return null;
  }

  getLesson(lessonId: string): Lesson | null {
    for (const mod of this._modules.values()) {
      const lesson = mod.getLesson(lessonId);
      if (lesson) return lesson;
    }
    return null;
  }

  getAllGlossary() {
    const terms = [];
    for (const mod of this._modules.values()) {
      terms.push(...mod.glossary);
    }
    return terms;
  }

  get count() {
    return this._modules.size;
  }

  get totalLessons() {
    let count = 0;
    for (const mod of this._modules.values()) {
      count += mod.lessons.length;
    }
    return count;
  }
}

export const registry = new ModuleRegistry();
