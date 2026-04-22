/**
 * Lesson Section Template
 *
 * Copiá esta carpeta y renombrala para crear un tipo de sección nuevo.
 * Patrón recomendado:
 * - render...() devuelve markup
 * - registrá el renderer en src/pages/lesson/sectionRenderer.js
 * - mantené la forma de datos simple y explícita
 */
import { escapeHtml } from '../../../../components/widgets/Utils.js';
import { renderSectionBlock } from '../../../../components/templates.js';

export function renderLessonSectionExample(section, index) {
  return renderSectionBlock(`
    <div class="lesson-section-template__title">
      ${escapeHtml(section.title || 'Sección nueva')}
    </div>
    <div class="lesson-section-template__body">
      ${escapeHtml(section.content || 'Contenido de ejemplo')}
    </div>
  `, {
    className: 'lesson-section-template',
    index,
  });
}
