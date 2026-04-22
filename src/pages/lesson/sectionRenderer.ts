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
} from '../../components/widgets/index.ts';
import { renderAnimatedElement } from '../../components/templates.ts';
import { escapeHtml } from '../../components/widgets/Utils.ts';
import { renderComparison, renderStepAnimation } from './sections/index.ts';
import { parseTextWithTriggers } from './triggers.ts';
import type { LessonSection } from '../../core/Module.ts';
import type { TableSection } from '../../components/widgets/table/types.ts';

type SectionRenderer = (section: LessonSection, index: number, lessonId?: string) => string;

export const LESSON_SECTION_RENDERERS: Record<string, SectionRenderer> = {
  text: (section, index) => renderAnimatedElement('p', parseTextWithTriggers((section as Extract<LessonSection, { type: 'text' }>).content), {
    index,
    delayStep: 0.05,
  }),
  heading: (section, index) => renderAnimatedElement('h2', (section as Extract<LessonSection, { type: 'heading' }>).content, {
    index,
    delayStep: 0.05,
  }),
  info: (section, index) => renderInfoBox(section, index),
  'concept-cards': (section, index) => renderConceptCards(section, index),
  'table-example': (section, index) => renderTableExample(section as TableSection, index),
  'interactive-table': (section, index, lessonId) => renderInteractiveTable(section as TableSection, index, lessonId ?? ''),
  'data-types': (section, index) => renderBadgeList(section, index),
  code: (section, index) => renderCodeBlock(section, index),
  quiz: (section, index, lessonId) => renderQuiz(section, index, lessonId ?? ''),
  timeline: (section, index) => renderTreeWidget(section, index),
  stats: (section, index) => renderStats(section, index),
  'search-animation': (section, index, lessonId) => renderSearchAnimation(section, index, lessonId ?? ''),
  diagram: (section, index) => renderDiagram(section, index),
  'magic-table': (section, index, lessonId) => renderMagicTable(section, index, lessonId ?? ''),
  'table-laboratory': (section, index, lessonId) => renderTableLaboratory(section as TableSection, index, lessonId ?? ''),
  'step-animation': (section, index) => renderStepAnimation(section as never, index),
  comparison: (section, index) => renderComparison(section as never, index),
};

export function registerLessonSectionRenderer(type: string, renderer: SectionRenderer) {
  LESSON_SECTION_RENDERERS[type] = renderer;
}

function renderUnknownLessonSection(section: Partial<LessonSection> | undefined, index: number) {
  return renderAnimatedElement('div', `
    <strong>Sección no soportada</strong>
    <p>Tipo: <code>${escapeHtml(section?.type || 'desconocido')}</code></p>
  `, {
    index,
    animationClass: 'anim-fade-in',
    className: 'lesson-section lesson-section--unsupported',
  });
}

export function renderLessonSection(section: LessonSection | undefined, index: number, lessonId?: string) {
  const type = section?.type;
  const renderer = type ? LESSON_SECTION_RENDERERS[type] : undefined;
  return renderer ? renderer(section as LessonSection, index, lessonId) : renderUnknownLessonSection(section, index);
}
