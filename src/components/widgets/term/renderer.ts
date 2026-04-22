import { escapeHtml } from '../Utils.ts';
import { renderSectionBlock } from '../../templates.ts';

export function renderCollapsibleTerm(term: string, definition: string, index: number, id: string) {
  return renderSectionBlock(`
    <div class="collapsible-term__header" onclick="this.parentElement.classList.toggle('term--expanded')">
      <div class="collapsible-term__title-row">
        <span class="collapsible-term__name">${escapeHtml(term)}</span>
        <span class="collapsible-term__badge">Term</span>
      </div>
      <span class="collapsible-term__toggle">+</span>
    </div>
    <div class="collapsible-term__body">
      <div class="collapsible-term__content">
        <p>${escapeHtml(definition)}</p>
      </div>
    </div>
  `, {
    className: 'collapsible-term card premium-term',
    animationClass: 'anim-slide-up',
    index,
    duration: 0.3,
    attrs: `id="${id}"`,
  });
}
