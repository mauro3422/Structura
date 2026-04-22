import { styleAttr, cssVar } from '../style.ts';

export function moduleBadgeClass(color: string) {
  if (color === 'secondary') return 'badge-secondary';
  if (color === 'accent') return 'badge-accent';
  if (color === 'danger') return 'badge-danger';
  return 'badge-primary';
}

export function moduleColorVar(color: string) {
  return `var(--color-${color})`;
}

export interface ProgressBarOptions {
  value: number | string;
  color: string;
  size?: string;
  className?: string;
}

export function progressBar({ value, color, size = 'sm', className = '' }: ProgressBarOptions) {
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
