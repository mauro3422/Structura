import { animStyle } from './style.js';

export function renderAnimatedElement(tag, content, {
  index = 0,
  className = '',
  animationClass = 'anim-fade-in',
  delayStep = 0.05,
  duration = null,
} = {}) {
  const classes = [animationClass, className].filter(Boolean).join(' ');
  const classAttr = classes ? ` class="${classes}"` : '';
  return `
    <${tag}${classAttr} ${animStyle({ delay: index * delayStep, duration })}>${content}</${tag}>
  `;
}

export function renderSectionBlock(content, {
  tag = 'div',
  className = '',
  animationClass = 'anim-scale-in',
  index = 0,
  delayStep = 0.05,
  duration = null,
  attrs = '',
  marginClass = 'u-mt-4',
  animate = true,
} = {}) {
  const classes = [animationClass, className, marginClass].filter(Boolean).join(' ');
  const classAttr = classes ? `class="${classes}"` : '';
  const styleAttrValue = animate ? ` ${animStyle({ delay: index * delayStep, duration })}` : '';
  return `
    <${tag} ${classAttr} ${attrs}${styleAttrValue}>
      ${content}
    </${tag}>
  `;
}

export function renderPageShell(content, { id = '', className = '' } = {}) {
  const classes = ['page', className].filter(Boolean).join(' ');
  const idAttr = id ? ` id="${id}"` : '';
  return `<div class="${classes}"${idAttr}>${content}</div>`;
}

export function renderPageHeader(title, subtitle = '', { className = '', children = '' } = {}) {
  const classes = ['page-header', className].filter(Boolean).join(' ');
  return `
    <div class="${classes}">
      ${title ? `<h1 class="page-title">${title}</h1>` : ''}
      ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
      ${children}
    </div>
  `;
}

export function renderBackButton(label, { id = '', href = '', className = '' } = {}) {
  const classes = ['back-btn', className].filter(Boolean).join(' ');
  const idAttr = id ? ` id="${id}"` : '';
  const onclick = href ? ` onclick="window.location.hash='${href}'"` : '';
  return `<button class="${classes}"${idAttr}${onclick}>‹ ${label}</button>`;
}
