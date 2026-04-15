/**
 * DataLab - Lesson Renderer
 * Renders all content types: text, tables, quizzes, code, timelines, etc.
 */
import { registry } from '../modules/index.js';

export function renderLesson(params) {
  const lessonId = params.id;
  const lessonObj = registry.getLesson(lessonId);
  const mod = registry.getModuleForLesson(lessonId);

  if (!lessonObj || !mod) {
    return '<div class="page"><p>Lección no encontrada</p></div>';
  }

  const sectionsHtml = lessonObj.sections.map((section, i) =>
    renderSection(section, i, lessonId)
  ).join('');

  // Find next lesson
  const nextLesson = lessonObj.getNext();

  const nextBtn = nextLesson
    ? `<button class="btn btn-primary btn-block" onclick="window.markCompleted('${lessonId}'); window.location.hash='/lesson/${nextLesson.id}'" id="btn-next-lesson">
        Siguiente Lección →
      </button>`
    : `<button class="btn btn-secondary btn-block" onclick="window.markCompleted('${lessonId}'); window.location.hash='/module/${mod.id}'" id="btn-back-to-module">
        ✓ Módulo completado — Volver
      </button>`;

  return `
    <div class="page" id="page-lesson-${lessonId}">
      <button class="back-btn" onclick="window.location.hash='/module/${mod.id}'" id="btn-back-module">
        ‹ ${mod.title}
      </button>
      <div class="page-header">
        <h1 class="page-title">${lessonObj.title}</h1>
        <div style="display:flex; gap:8px; margin-top:8px">
          <span class="badge badge-primary">${lessonObj.duration || ''}</span>
          <span class="badge badge-secondary">Lección ${lessonObj.index + 1}/${mod.lessons.length}</span>
        </div>
      </div>
      <div class="lesson-content">
        ${sectionsHtml}
      </div>
      <div class="lesson-nav" style="margin-top:var(--sp-8)">
        ${nextBtn}
      </div>
    </div>
  `;
}

function renderSection(section, index, lessonId) {
  switch (section.type) {
    case 'text':
      return `<p style="animation: fadeIn 0.4s both ${index * 0.05}s">${section.content}</p>`;

    case 'heading':
      return `<h2 style="animation: fadeIn 0.4s both ${index * 0.05}s">${section.content}</h2>`;

    case 'info':
      return renderInfoBox(section, index);

    case 'concept-cards':
      return renderConceptCards(section, index);

    case 'table-example':
      return renderTableExample(section, index);

    case 'interactive-table':
      return renderInteractiveTable(section, index, lessonId);

    case 'data-types':
      return renderDataTypes(section, index);

    case 'code':
      return renderCodeBlock(section, index);

    case 'quiz':
      return renderQuiz(section, index, lessonId);

    case 'timeline':
      return renderTimeline(section, index);

    case 'stats':
      return renderStats(section, index);

    case 'search-animation':
      return renderSearchAnimation(section, index, lessonId);

    default:
      return '';
  }
}

function renderInfoBox(section, index) {
  return `
    <div class="info-box info-box--${section.variant || 'primary'}" 
         style="animation: slideUp 0.4s both ${index * 0.05}s; margin: var(--sp-4) 0">
      <span class="info-box__icon">${section.icon || '💡'}</span>
      ${section.content}
    </div>
  `;
}

function renderConceptCards(section, index) {
  const cards = section.items.map((item, i) => `
    <div class="card concept-card" style="animation: slideUp 0.4s both ${(index + i) * 0.08}s">
      <div class="concept-card__header">
        <span class="concept-card__icon concept-card__icon--${item.color || 'primary'}">${item.icon}</span>
        <span class="concept-card__title">${item.title}</span>
      </div>
      <p class="concept-card__desc">${item.description}</p>
    </div>
  `).join('');

  return `<div class="concept-cards-grid">${cards}</div>`;
}

function renderTableExample(section, index) {
  const headers = section.columns.map(col => `
    <th>
      ${col.name}
      ${col.isPK ? '<span class="key-icon">🔑</span>' : ''}
      ${col.isFK ? '<span class="key-icon">🔗</span>' : ''}
      <span class="col-type">${col.type}</span>
    </th>
  `).join('');

  const rows = section.rows.map((row, ri) => `
    <tr style="animation: rowSlideIn 0.4s both ${(index + ri) * 0.1}s">
      ${row.map(cell => `<td>${cell}</td>`).join('')}
    </tr>
  `).join('');

  return `
    <div style="margin: var(--sp-4) 0; animation: scaleIn 0.4s both ${index * 0.05}s">
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--sp-2);font-weight:600">
        📋 ${section.tableName}
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderInteractiveTable(section, index, lessonId) {
  const tableId = `interactive-table-${lessonId}-${index}`;
  const canAddCols = section.canAddColumns !== false;

  const headers = section.columns.map(col => `
    <th data-type="${col.type}" data-pk="${col.isPK || false}">
      ${col.name}
      ${col.isPK ? '<span class="key-icon">🔑</span>' : ''}
      <span class="col-type">${col.type}${col.autoIncrement ? ' AUTO' : ''}</span>
    </th>
  `).join('');

  const addColHeader = canAddCols ? `
    <th class="data-table__add-col-th">
      <button class="data-table__add-col" id="${tableId}-add-col" data-table-id="${tableId}" data-col-count="${section.columns.length}">
        <span class="plus-icon-sm">+</span>
      </button>
    </th>
  ` : '';

  const rows = (section.initialRows || []).map((row, ri) => `
    <tr data-row="${ri}" style="animation: rowSlideIn 0.4s both ${ri * 0.1}s">
      ${row.map((cell, ci) => `
        <td ${ci > 0 || !section.columns[ci]?.autoIncrement ? 'contenteditable="true"' : ''} 
            data-col="${ci}"
            data-placeholder="${section.columns[ci]?.placeholder || ''}">${cell}</td>
      `).join('')}
      ${canAddCols ? '<td class="data-table__extra-col-cell"></td>' : ''}
    </tr>
  `).join('');

  return `
    <div style="margin: var(--sp-4) 0; animation: scaleIn 0.4s both ${index * 0.05}s">
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--sp-2);font-weight:600">
        ✏️ ${section.tableName}
      </div>
      <div class="data-table-wrapper" id="${tableId}">
        <table class="data-table" id="${tableId}-table">
          <thead><tr id="${tableId}-header">${headers}${addColHeader}</tr></thead>
          <tbody id="${tableId}-body">${rows}</tbody>
        </table>
        ${section.canAddRows ? `
          <button class="data-table__add-row" id="${tableId}-add" data-table-id="${tableId}" data-columns='${JSON.stringify(section.columns)}' data-row-count="${section.initialRows?.length || 0}" data-has-extra-col="${canAddCols}">
            <span class="plus-icon">+</span>
            Agregar fila
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function renderDataTypes(section, index) {
  const items = section.items.map((item, i) => `
    <div class="data-type-item" style="animation: slideUp 0.3s both ${(index + i) * 0.08}s">
      <span class="data-type-item__icon">${item.icon}</span>
      <div class="data-type-item__content">
        <span class="data-type-item__name">${item.name}</span>
        <code class="data-type-item__type">${item.type}</code>
      </div>
      <span class="data-type-item__example">${item.example}</span>
    </div>
  `).join('');

  return `<div class="data-types-list" style="margin: var(--sp-4) 0">${items}</div>`;
}

function renderCodeBlock(section, index) {
  // Simple syntax highlighting
  let code = escapeHtml(section.code);

  if (section.language === 'sql') {
    code = highlightSQL(code);
  } else if (section.language === 'pseudocode') {
    code = highlightPseudocode(code);
  }

  return `
    <div class="code-block" style="margin: var(--sp-4) 0; animation: scaleIn 0.4s both ${index * 0.05}s">
      <div style="font-size:0.6rem;color:var(--text-dimmed);margin-bottom:var(--sp-2);text-transform:uppercase;letter-spacing:0.1em">
        ${section.language}
      </div>
      <pre style="margin:0;white-space:pre-wrap;word-break:break-word"><code>${code}</code></pre>
    </div>
  `;
}

function renderQuiz(section, index, lessonId) {
  const quizId = `quiz-${lessonId}-${index}`;

  const options = section.options.map((opt, i) => {
    const letter = String.fromCharCode(65 + i);
    return `
      <div class="quiz__option" data-quiz-id="${quizId}" data-option="${i}" data-correct="${section.correctIndex}" id="${quizId}-opt-${i}">
        <span class="quiz__option-letter">${letter}</span>
        <span>${opt}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="quiz" id="${quizId}" style="animation: slideUp 0.4s both ${index * 0.05}s" data-explanation="${escapeAttr(section.explanation)}">
      <div class="quiz__question">🧠 ${section.question}</div>
      <div class="quiz__options">
        ${options}
      </div>
      <div class="quiz__feedback-container" id="${quizId}-feedback"></div>
    </div>
  `;
}

function renderTimeline(section, index) {
  const events = section.events.map((event, i) => `
    <div class="timeline-event" style="animation: slideUp 0.4s both ${i * 0.1}s">
      <div class="timeline-event__marker">
        <span class="timeline-event__icon">${event.icon}</span>
        <div class="timeline-event__line"></div>
      </div>
      <div class="timeline-event__content">
        <span class="timeline-event__year">${event.year}</span>
        <h3 class="timeline-event__title">${event.title}</h3>
        <p class="timeline-event__desc">${event.description}</p>
      </div>
    </div>
  `).join('');

  return `<div class="timeline" style="margin: var(--sp-4) 0">${events}</div>`;
}

function renderStats(section, index) {
  const items = section.items.map((item, i) => `
    <div class="stat-card" style="animation: scaleIn 0.4s both ${(index + i) * 0.1}s">
      <span class="stat-card__icon">${item.icon}</span>
      <span class="stat-card__value">${item.value}</span>
      <span class="stat-card__label">${item.label}</span>
    </div>
  `).join('');

  return `<div class="stats-grid" style="margin: var(--sp-4) 0">${items}</div>`;
}

function renderSearchAnimation(section, index, lessonId) {
  const animId = `search-anim-${lessonId}-${index}`;

  const cells = section.data.map((val, i) => `
    <div class="search-cell" id="${animId}-cell-${i}" data-value="${val}">${val}</div>
  `).join('');

  return `
    <div class="search-animation" id="${animId}" data-algorithm="${section.algorithm}" data-target="${section.target}" data-values="${section.data.join(',')}" style="margin: var(--sp-4) 0; animation: scaleIn 0.4s both ${index * 0.05}s">
      <div class="search-animation__header">
        <span class="badge badge-primary">Buscando: ${section.target}</span>
        <button class="btn btn-sm btn-secondary" id="${animId}-play" data-anim-id="${animId}">
          ▶ Iniciar
        </button>
      </div>
      <div class="search-animation__cells" id="${animId}-cells">
        ${cells}
      </div>
      <div class="search-animation__status" id="${animId}-status">
        Tocá "Iniciar" para ver el algoritmo en acción
      </div>
    </div>
  `;
}

// --- Helpers ---
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function highlightSQL(code) {
  const keywords = ['CREATE', 'TABLE', 'INSERT', 'INTO', 'VALUES', 'SELECT', 'FROM', 'WHERE', 'PRIMARY', 'KEY', 'AUTO_INCREMENT', 'INT', 'VARCHAR', 'FLOAT', 'DATE', 'BOOLEAN', 'NOT', 'NULL'];
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    code = code.replace(regex, `<span class="code-block__keyword">$1</span>`);
  });
  // Strings
  code = code.replace(/'([^']*)'/g, `<span class="code-block__string">'$1'</span>`);
  // Comments
  code = code.replace(/(--.*)/g, `<span class="code-block__comment">$1</span>`);
  // Numbers
  code = code.replace(/\b(\d+)\b/g, `<span class="code-block__number">$1</span>`);
  return code;
}

function highlightPseudocode(code) {
  const keywords = ['FUNCIÓN', 'FIN', 'PARA', 'DESDE', 'HASTA', 'SI', 'ENTONCES', 'SINO', 'RETORNAR', 'MIENTRAS', 'FIN SI', 'FIN PARA', 'FIN MIENTRAS', 'FIN FUNCIÓN'];
  keywords.sort((a, b) => b.length - a.length);
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    code = code.replace(regex, `<span class="code-block__keyword">$1</span>`);
  });
  // Comments
  code = code.replace(/(\/\/.*)/g, `<span class="code-block__comment">$1</span>`);
  return code;
}
