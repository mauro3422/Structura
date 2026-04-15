/**
 * DataLab - Modules Page
 */
import { registry } from '../modules/index.js';
import { Progress } from '../core/Progress.js';

export function renderModules() {
  const modules = registry.getAll();

  const moduleCards = modules.map((mod, i) => {
    const progress = Progress.getModuleProgress(mod);
    const progressHtml = progress > 0 ? `
      <div style="margin-top: 12px; background: rgba(255,255,255,0.1); height: 6px; border-radius: 4px; overflow: hidden;">
        <div style="width: ${progress}%; background: var(--color-${mod.color}); height: 100%; transition: width 0.5s ease-out;"></div>
      </div>
    ` : '';

    return `
      <a class="card module-card" onclick="window.location.hash='/module/${mod.id}'" 
         id="module-card-${mod.id}"
         style="animation: slideUp 0.4s both ${i * 0.1}s">
        <div class="module-card__icon module-card__icon--${mod.color}">${mod.icon}</div>
        <div class="module-card__content">
          <div class="module-card__title">${mod.title}</div>
          <div class="module-card__desc">${mod.description}</div>
          <div style="margin-top: 6px">
            <span class="badge badge-${mod.color === 'primary' ? 'primary' : mod.color === 'secondary' ? 'secondary' : 'accent'}">${mod.lessons.length} lecciones</span>
          </div>
          ${progressHtml}
        </div>
        <span class="module-card__arrow">›</span>
      </a>
    `;
  }).join('');

  return `
    <div class="page" id="page-modules">
      <div class="page-header">
        <h1 class="page-title">Módulos</h1>
        <p class="page-subtitle">Elegí un tema para empezar a aprender</p>
      </div>
      <div class="modules-grid">
        ${moduleCards}
      </div>
    </div>
  `;
}

export function renderModuleDetail(params) {
  const mod = registry.getModule(params.id);
  if (!mod) return '<div class="page"><p>Módulo no encontrado</p></div>';

  const lessonCards = mod.lessons.map((lesson, i) => {
    const isCompleted = Progress.isLessonCompleted(lesson.id);
    const statusHtml = isCompleted 
      ? `<span style="color: var(--color-accent); font-size: 1.2rem;">✅</span>` 
      : `<span class="lesson-card__status">${lesson.duration}</span>`;

    return `
      <div class="card lesson-card" 
           onclick="window.location.hash='/lesson/${lesson.id}'"
           id="lesson-card-${lesson.id}"
           style="animation: slideUp 0.4s both ${i * 0.08}s; ${isCompleted ? 'border-left: 3px solid var(--color-accent); opacity: 0.8;' : ''}">
        <div class="lesson-card__number">${i + 1}</div>
        <div class="module-card__content">
          <div class="module-card__title">${lesson.title}</div>
          <div class="module-card__desc">${lesson.description}</div>
        </div>
        ${statusHtml}
      </div>
    `;
  }).join('');

  const progress = Progress.getModuleProgress(mod);
  
  return `
    <div class="page" id="page-module-detail">
      <button class="back-btn" onclick="window.location.hash='/modules'" id="btn-back-modules">
        ‹ Módulos
      </button>
      <div class="page-header">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px">
          <div class="module-card__icon module-card__icon--${mod.color}" style="width:42px;height:42px;font-size:1.2rem">${mod.icon}</div>
          <div style="flex:1">
            <h1 class="page-title">${mod.title}</h1>
            <p class="page-subtitle">${mod.description}</p>
          </div>
          ${progress > 0 ? `<div style="font-weight: bold; color: var(--color-${mod.color});">${progress}%</div>` : ''}
        </div>
        ${progress > 0 ? `
        <div style="margin-top: 12px; background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="width: ${progress}%; background: var(--color-${mod.color}); height: 100%; transition: width 0.5s ease-out;"></div>
        </div>
        ` : ''}
      </div>
      <div class="section">
        <h2 class="section__title">Lecciones</h2>
        <div class="lessons-list">
          ${lessonCards}
        </div>
      </div>
    </div>
  `;
}
