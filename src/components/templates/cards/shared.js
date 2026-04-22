import { styleAttr, cssVar } from '../style.js';

export function moduleBadgeClass(color) {
  if (color === 'secondary') return 'badge-secondary';
  if (color === 'accent') return 'badge-accent';
  if (color === 'danger') return 'badge-danger';
  return 'badge-primary';
}

export function moduleColorVar(color) {
  return `var(--color-${color})`;
}

export function progressBar({ value, color, size = 'sm', className = '' } = {}) {
  const classes = ['progress-track', `progress-track--${size}`, className].filter(Boolean).join(' ');
  return `
    <div class="${classes}">
      <div class="progress-track__bar" ${styleAttr(
        cssVar('--progress', `${value}%`),
        cssVar('--progress-color', color)
      )}></div>
    </div>
  `;
}
