import { registry } from '../modules/index.js';
import { renderBackButton, renderPageHeader, renderPageShell } from '../components/templates.js';
import { installMagicTriggerBridge } from './lesson/triggers.js';
import { renderLessonSection } from './lesson/sectionRenderer.js';

export function renderLesson(params) {
  const lessonId = params.id;
  const lessonObj = registry.getLesson(lessonId);
  const mod = registry.getModuleForLesson(lessonId);

  if (!lessonObj || !mod) {
    return renderPageShell('<p>Lección no encontrada</p>');
  }

  installMagicTriggerBridge();

  const sectionsHtml = lessonObj.sections.map((section, i) =>
    renderLessonSection(section, i, lessonId)
  ).join('');

  const nextLesson = lessonObj.getNext();

  const nextBtn = nextLesson
    ? `<button class="btn btn-primary btn-block" onclick="window.markCompleted('${lessonId}'); window.location.hash='/lesson/${nextLesson.id}'" id="btn-next-lesson">
        Siguiente Lección →
      </button>`
    : `<button class="btn btn-secondary btn-block" onclick="window.markCompleted('${lessonId}'); window.location.hash='/module/${mod.id}'" id="btn-back-to-module">
        ✓ Módulo completado — Volver
      </button>`;

  return renderPageShell(`
      ${renderBackButton(mod.title, { id: 'btn-back-module', href: `/module/${mod.id}` })}
      ${renderPageHeader(lessonObj.title, '', {
        children: `
          <div class="lesson-badges">
            <span class="badge badge-primary">${lessonObj.duration || ''}</span>
            <span class="badge badge-secondary">Lección ${lessonObj.index + 1}/${mod.lessons.length}</span>
          </div>
        `,
      })}
      <div class="lesson-content">
        ${sectionsHtml}
      </div>
      <div class="lesson-nav">
        ${nextBtn}
      </div>
  `, { id: `page-lesson-${lessonId}` });
}
