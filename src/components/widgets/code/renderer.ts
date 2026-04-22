import { escapeHtml } from '../Utils.ts';
import { renderSectionBlock } from '../../templates.ts';
import { highlightPseudocode, highlightSQL } from './syntax.ts';

export function renderCodeBlock(section: any, index: number) {
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

export function renderDiagram(section: any, index: number) {
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
