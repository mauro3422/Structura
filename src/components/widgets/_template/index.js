/**
 * Widget Template
 *
 * Copiá esta carpeta y renombrala para crear un widget nuevo.
 * Patrón recomendado:
 * - render...() devuelve markup
 * - setup...() instala listeners opcionales
 * - exportá la función render desde src/components/widgets/index.js
 */
import { escapeHtml } from '../Utils.js';
import { renderSectionBlock } from '../../templates.js';

export function renderWidgetExample(section, index, lessonId) {
  const widgetId = `widget-${lessonId}-${index}`;

  return renderSectionBlock(`
    <div class="widget-example__header">
      <strong>${escapeHtml(section.title || 'Widget')}</strong>
    </div>
    <div class="widget-example__body">
      ${escapeHtml(section.content || 'Contenido del widget')}
    </div>
  `, {
    className: 'widget-example',
    index,
    attrs: `id="${widgetId}"`,
  });
}

export function setupWidgetExample() {
  // Agregá listeners si el widget necesita interacción.
}
