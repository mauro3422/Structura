/**
 * DataLab - Modules Page
 */
import { registry } from '../modules/index.ts';
import { Progress } from '../core/Progress.ts';
import {
  cssVar,
  progressBar,
  renderLessonCard,
  renderBackButton,
  renderPageHeader,
  renderPageShell,
  styleAttr,
} from '../components/templates.ts';
import { renderModuleCards } from './moduleCards.ts';

export function renderModules() {
  const modules = registry.getAll();

  return renderPageShell(`
      ${renderPageHeader('Módulos', 'Elegí un tema para empezar a aprender')}
      <div class="modules-grid">
        ${renderModuleCards(modules, { idPrefix: 'module-card' })}
      </div>
  `, { id: 'page-modules' });
}

export function renderModuleDetail(params: { id: string }) {
  const mod = registry.getModule(params.id);
  if (!mod) return renderPageShell('<p>Módulo no encontrado</p>');

  const lessonCards = mod.lessons
    .map((lesson, i) => renderLessonCard(lesson, {
      index: i,
      completed: Progress.isLessonCompleted(lesson.id),
    }))
    .join('');

  const progress = Progress.getModuleProgress(mod);

  return renderPageShell(`
      ${renderBackButton('Módulos', { id: 'btn-back-modules', href: '/modules' })}
      ${renderPageHeader('', '', {
        children: `
          <div class="module-detail__header" ${styleAttr(cssVar('--module-color', `var(--color-${mod.color})`))}>
            <div class="module-card__icon module-card__icon--${mod.color} module-detail__icon">${mod.icon}</div>
            <div class="module-detail__title-group">
              <h1 class="page-title">${mod.title}</h1>
              <p class="page-subtitle">${mod.description}</p>
            </div>
            ${progress > 0 ? `<div class="module-detail__progress-value">${progress}%</div>` : ''}
          </div>
          ${progress > 0 ? progressBar({
            value: progress,
            color: `var(--color-${mod.color})`,
            size: 'md',
            className: 'module-detail__progress-track',
          }) : ''}
        `,
      })}
      <div class="section">
        <h2 class="section__title">Lecciones</h2>
        <div class="lessons-list">
          ${lessonCards}
        </div>
      </div>
  `, { id: 'page-module-detail' });
}
