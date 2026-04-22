import { escapeHtml } from '../../widgets/Utils.js';
import { animStyle } from '../style.js';
import { moduleBadgeClass, moduleColorVar, progressBar } from './shared.js';

export function renderModuleCard(mod, {
  index = 0,
  href = `/module/${mod.id}`,
  idPrefix = 'module-card',
  showProgress = true,
  progress = 0,
  cardClass = '',
  animateDuration = 0.4,
} = {}) {
  const classes = ['card', 'module-card', 'anim-slide-up', cardClass].filter(Boolean).join(' ');
  const progressHtml = showProgress && progress > 0
    ? progressBar({
        value: progress,
        color: moduleColorVar(mod.color),
      })
    : '';

  return `
    <a class="${classes}" ${animStyle({ delay: index * 0.1, duration: animateDuration })} href="#${href}" id="${idPrefix}-${mod.id}">
      <div class="module-card__icon module-card__icon--${mod.color}">${mod.icon}</div>
      <div class="module-card__content">
        <div class="module-card__title">${escapeHtml(mod.title)}</div>
        <div class="module-card__desc">${escapeHtml(mod.description)}</div>
        <div class="u-mt-2">
          <span class="badge ${moduleBadgeClass(mod.color)}">${mod.lessons.length} lecciones</span>
        </div>
        ${progressHtml}
      </div>
      <span class="module-card__arrow">›</span>
    </a>
  `;
}
