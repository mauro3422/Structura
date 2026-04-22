import { escapeHtml } from '../Utils.js';
import { formatInlineMarkdown } from '../../../utils/inlineMarkdown.js';
import { renderSectionBlock } from '../../templates.js';

export function renderInfoBox(section, index) {
  return renderSectionBlock(`
    <span class="info-box__icon">${section.icon || '💡'}</span>
    ${formatInlineMarkdown(section.content)}
  `, {
    className: `info-box info-box--${section.variant || 'primary'}`,
    animationClass: 'anim-slide-up',
    index,
  });
}

export function renderConceptCards(section, index) {
  const cards = (section.items || []).map((item, i) => renderSectionBlock(`
    <div class="concept-card__header">
      <div class="concept-card__icon-wrapper">
        <span class="concept-card__icon concept-card__icon--${item.color || 'primary'}">${item.icon}</span>
      </div>
      <h3 class="concept-card__title">${escapeHtml(item.title)}</h3>
    </div>
    <p class="concept-card__desc">${escapeHtml(item.description)}</p>
  `, {
    className: 'concept-card glass-panel',
    animationClass: 'anim-slide-up',
    index: index + i,
    delayStep: 0.1,
    duration: 0.5,
    marginClass: '',
  })).join('');

  return `<div class="concept-cards-grid premium-grid u-mt-6">${cards}</div>`;
}

export function renderBadgeList(section, index) {
  const items = (section.items || []).map((item, i) => renderSectionBlock(`
    <div class="data-type-item__icon-box">${item.icon}</div>
    <div class="data-type-item__content">
      <span class="data-type-item__name">${escapeHtml(item.name)}</span>
      <code class="data-type-item__type">${escapeHtml(item.type)}</code>
    </div>
    <span class="data-type-item__example">${escapeHtml(item.example)}</span>
  `, {
    className: 'data-type-item premium-list-item',
    animationClass: 'anim-slide-up',
    index: index + i,
    delayStep: 0.08,
    duration: 0.3,
    marginClass: '',
  })).join('');

  return `<div class="data-types-list premium-list-container u-mt-4">${items}</div>`;
}

export function renderStats(section, index) {
  const items = (section.items || []).map((item, i) => renderSectionBlock(`
    <span class="stat-card__icon">${item.icon}</span>
    <span class="stat-card__value">${escapeHtml(String(item.value))}</span>
    <span class="stat-card__label">${escapeHtml(item.label)}</span>
  `, {
    className: 'stat-card',
    animationClass: 'anim-scale-in',
    index: index + i,
    marginClass: '',
  })).join('');

  return `<div class="stats-grid u-mt-4">${items}</div>`;
}
