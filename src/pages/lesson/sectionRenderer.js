import {
  renderTreeWidget,
  renderInteractiveTable,
  renderTableExample,
  renderSearchAnimation,
  renderCodeBlock,
  renderDiagram,
  renderQuiz,
  renderConceptCards,
  renderInfoBox,
  renderStats,
  renderBadgeList,
  renderMagicTable,
  renderTableLaboratory,
} from '../../components/widgets/index.js';
import { renderAnimatedElement } from '../../components/templates.js';
import { escapeHtml } from '../../components/widgets/Utils.js';
import { renderComparison, renderStepAnimation } from './sections/index.js';
import { parseTextWithTriggers } from './triggers.js';

export const LESSON_SECTION_RENDERERS = {
  text: (section, index) => renderAnimatedElement('p', parseTextWithTriggers(section.content), {
    index,
    delayStep: 0.05,
  }),
  heading: (section, index) => renderAnimatedElement('h2', section.content, {
    index,
    delayStep: 0.05,
  }),
  info: (section, index) => renderInfoBox(section, index),
  'concept-cards': (section, index) => renderConceptCards(section, index),
  'table-example': (section, index) => renderTableExample(section, index),
  'interactive-table': (section, index, lessonId) => renderInteractiveTable(section, index, lessonId),
  'data-types': (section, index) => renderBadgeList(section, index),
  code: (section, index) => renderCodeBlock(section, index),
  quiz: (section, index, lessonId) => renderQuiz(section, index, lessonId),
  timeline: (section, index) => renderTreeWidget(section, index),
  stats: (section, index) => renderStats(section, index),
  'search-animation': (section, index, lessonId) => renderSearchAnimation(section, index, lessonId),
  diagram: (section, index) => renderDiagram(section, index),
  'magic-table': (section, index, lessonId) => renderMagicTable(section, index, lessonId),
  'table-laboratory': (section, index, lessonId) => renderTableLaboratory(section, index, lessonId),
  'step-animation': (section, index) => renderStepAnimation(section, index),
  comparison: (section, index) => renderComparison(section, index),
};

export function registerLessonSectionRenderer(type, renderer) {
  LESSON_SECTION_RENDERERS[type] = renderer;
}

function renderUnknownLessonSection(section, index) {
  return renderAnimatedElement('div', `
    <strong>Sección no soportada</strong>
    <p>Tipo: <code>${escapeHtml(section?.type || 'desconocido')}</code></p>
  `, {
    index,
    animationClass: 'anim-fade-in',
    className: 'lesson-section lesson-section--unsupported',
  });
}

export function renderLessonSection(section, index, lessonId) {
  const type = section?.type;
  const renderer = LESSON_SECTION_RENDERERS[type];
  return renderer ? renderer(section, index, lessonId) : renderUnknownLessonSection(section || {}, index);
}
