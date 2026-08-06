import { Progress } from '../core/Progress.ts';
import type { Module } from '../core/Module.ts';
import { renderModuleCard } from '../components/templates.ts';

export interface RenderModuleCardsOptions {
  idPrefix: string;
}

export function renderModuleCards(modules: ReadonlyArray<Module>, { idPrefix }: RenderModuleCardsOptions) {
  return modules
    .map((mod, index) => renderModuleCard(mod, {
      index,
      idPrefix,
      progress: Progress.getModuleProgress(mod),
    }))
    .join('');
}
