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

function renderComparisonNode(side, variant) {
  return `
    <div class="lesson-comparison__node lesson-comparison__node--${variant.toLowerCase()}">
      <span class="lesson-comparison__tag">${escapeHtml(variant)}</span>
      <h3 class="lesson-comparison__title">${escapeHtml(side.title)}</h3>
      <div class="lesson-comparison__content">
        ${formatInlineMarkdown(side.content)}
      </div>
    </div>
  `;
}

export function renderComparison(section, index) {
  const left = normalizeSide(section.left, 'Lado izquierdo');
  const right = normalizeSide(section.right, 'Lado derecho');
  const title = section.title || 'Dos enfoques, lado a lado';
  const summary = section.summary || 'El DNS traduce nombres a direcciones IP.';

  return renderSectionBlock(`
    <div class="lesson-comparison__eyebrow-row">
      <div class="lesson-comparison__eyebrow">Comparación</div>
    </div>
    <div class="lesson-comparison__hero">
      <h3 class="lesson-comparison__heading">${escapeHtml(title)}</h3>
      <p class="lesson-comparison__summary-text">${escapeHtml(summary)}</p>
    </div>
    <div class="lesson-comparison__flow" aria-label="${escapeHtml(title)}">
      ${renderComparisonNode(left, 'Izquierda')}
      <div class="lesson-comparison__bridge" aria-hidden="true">
        <span class="lesson-comparison__bridge-label">DNS</span>
        <span class="lesson-comparison__bridge-line"></span>
      </div>
      ${renderComparisonNode(right, 'Derecha')}
    </div>
  `, {
    className: 'lesson-comparison',
    animationClass: 'anim-scale-in',
    index,
  });
}
