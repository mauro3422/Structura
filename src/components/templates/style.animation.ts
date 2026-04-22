import { cssVar, styleAttr } from './style.attrs.ts';

export interface AnimStyleOptions {
  delay?: string | number | null;
  duration?: string | number | null;
}

export function animStyle({ delay = null, duration = null }: AnimStyleOptions = {}) {
  const parts: string[] = [];
  if (delay !== null && delay !== undefined) {
    parts.push(cssVar('--anim-delay', typeof delay === 'number' ? `${delay}s` : delay));
  }
  if (duration !== null && duration !== undefined) {
    parts.push(cssVar('--anim-duration', typeof duration === 'number' ? `${duration}s` : duration));
  }
  return styleAttr(parts);
}
