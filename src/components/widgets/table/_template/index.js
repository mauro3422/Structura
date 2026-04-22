/**
 * Table Widget Template
 *
 * Copiá esta carpeta y renombrala para crear un widget/tablero de tablas nuevo.
 * Patrón recomendado:
 * - render...() devuelve markup
 * - state.js guarda o resuelve persistencia
 * - interactions.js instala listeners
 * - exportá la API desde src/components/widgets/TableWidget.js
 */
import { renderSectionBlock } from '../../../templates.js';

export function renderTableWidgetExample(section, index, lessonId) {
  const widgetId = `table-widget-${lessonId}-${index}`;

  return renderSectionBlock(`
    <strong>${section.title || 'Tabla'}</strong>
    <p>${section.content || 'Contenido de ejemplo'}</p>
    <code>${widgetId}</code>
  `, {
    className: 'table-widget-example',
    index,
    attrs: `id="${widgetId}"`,
  });
}
