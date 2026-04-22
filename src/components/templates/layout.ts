import { animStyle } from './style.ts';

export interface AnimatedElementOptions {
  index?: number;
  className?: string;
  animationClass?: string;
  delayStep?: number;
  duration?: string | number | null;
}

export function renderAnimatedElement(tag: string, content: string, {
  index = 0,
  className = '',
  animationClass = 'anim-fade-in',
  delayStep = 0.05,
  duration = null,
}: AnimatedElementOptions = {}) {
  const classes = [animationClass, className].filter(Boolean).join(' ');
  const classAttr = classes ? ` class="${classes}"` : '';
  return `
    <${tag}${classAttr} ${animStyle({ delay: index * delayStep, duration })}>${content}</${tag}>
  `;
}

export interface SectionBlockOptions extends AnimatedElementOptions {
  tag?: string;
  attrs?: string;
  marginClass?: string;
  animate?: boolean;
}

export function renderSectionBlock(content: string, {
  tag = 'div',
  className = '',
  animationClass = 'anim-scale-in',
  index = 0,
  delayStep = 0.05,
  duration = null,
  attrs = '',
  marginClass = 'u-mt-4',
  animate = true,
}: SectionBlockOptions = {}) {
  const classes = [animationClass, className, marginClass].filter(Boolean).join(' ');
  const classAttr = classes ? `class="${classes}"` : '';
  const styleAttrValue = animate ? ` ${animStyle({ delay: index * delayStep, duration })}` : '';
  return `
    <${tag} ${classAttr} ${attrs}${styleAttrValue}>
      ${content}
    </${tag}>
  `;
}

export interface PageShellOptions {
  id?: string;
  className?: string;
}

export function renderPageShell(content: string, { id = '', className = '' }: PageShellOptions = {}) {
  const classes = ['page', className].filter(Boolean).join(' ');
  const idAttr = id ? ` id="${id}"` : '';
  return `<div class="${classes}"${idAttr}>${content}</div>`;
}

export interface PageHeaderOptions {
  className?: string;
  children?: string;
}

export function renderPageHeader(title: string, subtitle = '', { className = '', children = '' }: PageHeaderOptions = {}) {
  const classes = ['page-header', className].filter(Boolean).join(' ');
  return `
    <div class="${classes}">
      ${title ? `<h1 class="page-title">${title}</h1>` : ''}
      ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
      ${children}
    </div>
  `;
}

export interface BackButtonOptions {
  id?: string;
  href?: string;
  className?: string;
}

export function renderBackButton(label: string, { id = '', href = '', className = '' }: BackButtonOptions = {}) {
  const classes = ['back-btn', className].filter(Boolean).join(' ');
  const idAttr = id ? ` id="${id}"` : '';
  const onclick = href ? ` onclick="window.location.hash='${href}'"` : '';
  return `<button class="${classes}"${idAttr}${onclick}>‹ ${label}</button>`;
}
