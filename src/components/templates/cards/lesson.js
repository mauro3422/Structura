import { escapeHtml } from '../../widgets/Utils.js';
import { animStyle } from '../style.js';

export function renderLessonCard(lesson, {
  index = 0,
  href = `/lesson/${lesson.id}`,
  completed = false,
  routeClass = '',
} = {}) {
  const classes = [
    'card',
    'lesson-card',
    'anim-slide-up',
    completed ? 'lesson-card--completed' : '',
    routeClass,
  ].filter(Boolean).join(' ');

  const statusHtml = completed
    ? '<span class="lesson-card__status lesson-card__status--completed">✅</span>'
    : `<span class="lesson-card__status">${escapeHtml(lesson.duration || '')}</span>`;

  return `
    <a class="${classes}" ${animStyle({ delay: index * 0.08 })} href="#${href}" id="lesson-card-${lesson.id}">
      <div class="lesson-card__number">${index + 1}</div>
      <div class="module-card__content">
        <div class="module-card__title">${escapeHtml(lesson.title)}</div>
        <div class="module-card__desc">${escapeHtml(lesson.description || '')}</div>
      </div>
      ${statusHtml}
    </a>
  `;
}
