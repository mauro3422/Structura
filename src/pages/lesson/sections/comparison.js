import { renderSectionBlock } from '../../../components/templates.js';
import { escapeHtml } from '../../../components/widgets/Utils.js';
import { formatInlineMarkdown } from '../../../utils/inlineMarkdown.js';

function normalizeSide(side, fallbackTitle) {
  if (typeof side === 'string') {
    return { title: fallbackTitle, content: side };
  }

  return {
    title: side?.title || fallbackTitle,
    content: side?.content || '',
  };
}

function renderComparisonCard(side, variant, index) {
  return renderSectionBlock(`
    <span class="lesson-comparison__tag">${escapeHtml(variant)}</span>
    <h3 class="lesson-comparison__title">${escapeHtml(side.title)}</h3>
    <div class="lesson-comparison__content">
      ${formatInlineMarkdown(side.content)}
    </div>
  `, {
    className: `lesson-comparison__card lesson-comparison__card--${variant.toLowerCase()}`,
    animationClass: 'anim-slide-up',
    index,
    delayStep: 0.08,
    marginClass: '',
  });
}

export function renderComparison(section, index) {
  const left = normalizeSide(section.left, 'Lado izquierdo');
  const right = normalizeSide(section.right, 'Lado derecho');

  return renderSectionBlock(`
    <div class="lesson-comparison__header">
      <div>
        <div class="lesson-comparison__eyebrow">Comparación</div>
        <h3 class="lesson-comparison__heading">Dos enfoques, lado a lado</h3>
      </div>
    </div>
    <div class="lesson-comparison__grid">
      ${renderComparisonCard(left, 'Izquierda', index)}
      ${renderComparisonCard(right, 'Derecha', index + 1)}
    </div>
  `, {
    className: 'lesson-comparison',
    animationClass: 'anim-scale-in',
    index,
  });
}
