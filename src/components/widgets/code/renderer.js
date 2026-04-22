import { escapeHtml } from '../Utils.js';
import { renderSectionBlock } from '../../templates.js';
import { highlightPseudocode, highlightSQL } from './syntax.js';

export function renderCodeBlock(section, index) {
  let code = escapeHtml(section.code);

  if (section.language === 'sql') {
    code = highlightSQL(code);
  } else if (section.language === 'pseudocode') {
    code = highlightPseudocode(code);
  }

  return renderSectionBlock(`
      <div class="code-block__language">
        ${escapeHtml(section.language)}
      </div>
      <pre class="code-block__pre"><code>${code}</code></pre>
  `, {
    className: 'code-block',
    animationClass: 'anim-scale-in',
    index,
  });
}

export function renderDiagram(section, index) {
  return renderSectionBlock(`
      <div class="diagram-canvas">
        <pre class="mermaid">${escapeHtml(section.code)}</pre>
      </div>
  `, {
    className: 'diagram-wrapper',
    animationClass: 'anim-slide-up',
    index,
  });
}
