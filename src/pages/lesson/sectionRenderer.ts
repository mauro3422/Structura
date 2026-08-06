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

function renderUnknownLessonSection(section: Partial<LessonSection> | undefined, index: number) {
  return renderAnimatedElement(
    'div',
    `
    <strong>Sección no soportada</strong>
    <p>Tipo: <code>${escapeHtml(section?.type || 'desconocido')}</code></p>
  `,
    {
      index,
      animationClass: 'anim-fade-in',
      className: 'lesson-section lesson-section--unsupported',
    },
  );
}

export function renderLessonSection(section: LessonSection | undefined, index: number, lessonId?: string) {
  if (!section) {
    return renderUnknownLessonSection(section, index);
  }

  switch (section.type) {
    case 'text':
      return renderAnimatedElement('p', parseTextWithTriggers(section.content), {
        index,
        delayStep: 0.05,
      });
    case 'heading':
      return renderAnimatedElement('h2', section.content, {
        index,
        delayStep: 0.05,
      });
    case 'info':
      return renderInfoBox(section, index);
    case 'concept-cards':
      return renderConceptCards(section, index);
    case 'table-example':
      return renderTableExample(section, index);
    case 'interactive-table':
      return renderInteractiveTable(section, index, lessonId ?? '');
    case 'data-types':
      return renderBadgeList(section, index);
    case 'code':
      return renderCodeBlock(section, index);
    case 'quiz':
      return renderQuiz(section, index, lessonId ?? '');
    case 'timeline':
      return renderTreeWidget(section, index);
    case 'stats':
      return renderStats(section, index);
    case 'search-animation':
      return renderSearchAnimation(section, index, lessonId ?? '');
    case 'diagram':
      return renderDiagram(section, index);
    case 'magic-table':
      return renderMagicTable(section, index, lessonId ?? '');
    case 'table-laboratory':
      return renderTableLaboratory(section, index, lessonId ?? '');
    case 'step-animation':
      return renderStepAnimation(section, index);
    case 'comparison':
      return renderComparison(section, index);
    default:
      return renderUnknownLessonSection(section, index);
  }
}
