import { escapeHtml } from '../Utils.ts';
import { renderSectionBlock } from '../../templates.ts';

export interface TreeEvent {
  year?: string | number;
  title?: string;
  description?: string;
  icon?: string;
}

export function renderTreeNode(event: TreeEvent, index: number, isFirst = false): string {
  return renderSectionBlock(`
    ${index > 0 ? '<div class="tree-line"></div>' : ''}
    <div class="tree-content">
      <button class="tree-icon-btn glow-effect" data-target="${index + 1}">
        <span class="tree-icon">${escapeHtml(event.icon || '•')}</span>
        <span class="tree-peek-year">${escapeHtml(String(event.year || ''))}</span>
      </button>
      <div class="tree-card">
        <div class="tree-year">${escapeHtml(String(event.year || ''))}</div>
        <h3 class="tree-title">${escapeHtml(event.title || '')}</h3>
        <p class="tree-desc">${escapeHtml(event.description || '')}</p>
      </div>
    </div>
  `, {
    className: `tree-node ${isFirst ? 'visible focused' : ''}`,
    attrs: `data-index="${index}"`,
    animate: false,
    marginClass: '',
  });
}

export function renderTreeWidgetBody(nodesHtml: string, treeId: string): string {
  return renderSectionBlock(`
    <p class="tree-hint">Toca un icono para expandir el árbol 👇</p>
    <div class="tree-container">
      ${nodesHtml}
    </div>
  `, {
    className: 'interactive-tree',
    attrs: `id="${treeId}"`,
    animate: false,
    marginClass: '',
  });
}
