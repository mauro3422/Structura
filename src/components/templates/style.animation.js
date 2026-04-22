import { cssVar, styleAttr } from './style.attrs.js';

export function animStyle({ delay = null, duration = null } = {}) {
  const parts = [];
  if (delay !== null && delay !== undefined) {
    parts.push(cssVar('--anim-delay', typeof delay === 'number' ? `${delay}s` : delay));
  }
  if (duration !== null && duration !== undefined) {
    parts.push(cssVar('--anim-duration', typeof duration === 'number' ? `${duration}s` : duration));
  }
  return styleAttr(parts);
}
