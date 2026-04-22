import { escapeHtml } from '../Utils.ts';
import { renderSectionBlock } from '../../templates.ts';
import {
  renderAddColumnHeader,
  renderAddRowButton,
  renderInteractiveHeaderCell,
  renderInteractiveRows,
  renderLabTableToolbar,
  renderLabTableWarning,
  renderStaticHeaderCell,
  renderStaticRows,
  renderTableCaption,
} from './markup.ts';
import { createTableId, resolveLabTables } from './state.ts';
import type { RenderLabTable, TableDefinition, TableSection } from './types.ts';

function renderLaboratoryRulesPanel(labId: string): string {
  return `
    <div class="lab-rules-panel" id="${labId}-rules" aria-live="polite">
      <div class="lab-rules-panel__header">
        <div>
          <div class="lab-rules-panel__title">Reglas del laboratorio</div>
          <div class="lab-rules-panel__subtitle">Lo obligatorio, lo sugerido y lo que dejamos para una fase posterior</div>
        </div>
      </div>
      <div class="lab-rules-grid">
        <article class="lab-rule-card lab-rule-card--required">
          <div class="lab-rule-card__label">Obligatorio</div>
          <div class="lab-rule-card__title">La verdad del modelo vive en la FK y su destino</div>
          <ul class="lab-rule-card__list">
            <li>La FK debe apuntar a una tabla real.</li>
            <li>Cada tabla necesita una PK visible.</li>
            <li>Los nombres de tabla no deberían repetirse.</li>
          </ul>
        </article>
        <article class="lab-rule-card lab-rule-card--suggested">
          <div class="lab-rule-card__label">Sugerido</div>
          <div class="lab-rule-card__title">Usar nombres claros sin bloquear minúsculas</div>
          <ul class="lab-rule-card__list">
            <li>snake_case o camelCase son válidos.</li>
            <li>El sistema solo sugiere ordenar nombres inconsistentes.</li>
            <li>1:N puede repetirse en detalle sin problema.</li>
          </ul>
        </article>
        <article class="lab-rule-card lab-rule-card--future">
          <div class="lab-rule-card__label">Fase 2</div>
          <div class="lab-rule-card__title">Reglas más estrictas para modelado avanzado</div>
          <ul class="lab-rule-card__list">
            <li>PK compuestas.</li>
            <li>Muchos a muchos con tabla puente.</li>
            <li>FK únicas reales para 1:1 estricta.</li>
          </ul>
        </article>
      </div>
    </div>
  `;
}

export function renderTableExample(section: TableSection, index: number): string {
  const headers = (section.columns || []).map((col) => renderStaticHeaderCell(col)).join('');
  const rows = renderStaticRows(section.rows || [], index);

  return renderSectionBlock(
    `
    ${renderTableCaption('📋', section.tableName)}
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead><tr>${headers}</tr></thead>
        <tbody id="table-example-${index}-body">${rows}</tbody>
      </table>
    </div>
  `,
    {
      className: 'data-table-example',
      index,
    },
  );
}

export function renderInteractiveTable(section: TableSection, index: number, lessonId: string): string {
  const tableId = `interactive-table-${lessonId}-${index}`;
  const canAddCols = section.canAddColumns !== false;
  const columns = section.columns || [];
  const headers = columns.map((col) => renderInteractiveHeaderCell(col)).join('');
  const addColHeader = canAddCols ? renderAddColumnHeader(tableId, columns.length) : '';
  const rows = renderInteractiveRows(section.initialRows || [], columns, { canAddCols });

  return renderSectionBlock(
    `
    ${renderTableCaption('✏️', section.tableName)}
    <div class="data-table-wrapper" id="${tableId}" data-table-name="${escapeHtml(section.tableName || '')}">
      <table class="data-table" id="${tableId}-table">
        <thead><tr id="${tableId}-header">${headers}${addColHeader}</tr></thead>
        <tbody id="${tableId}-body">${rows}</tbody>
      </table>
      ${section.canAddRows !== false ? renderAddRowButton(tableId, columns, section.initialRows?.length || 0, canAddCols) : ''}
    </div>
  `,
    {
      className: 'data-table-container',
      index,
    },
  );
}

export function renderTableLaboratory(section: TableSection, index: number, lessonId: string): string {
  const labId = `table-lab-${lessonId}`;
  const tables = resolveLabTables(section, lessonId);
  const tablesHtml = tables.map((table, ti) => renderLabTable(table, ti, lessonId, tables)).join('');

  return `
    <div class="table-laboratory" id="${labId}" data-lesson-id="${lessonId}">
      ${renderLabTableToolbar(labId)}
      ${renderLaboratoryRulesPanel(labId)}
      <div class="lab-observations-panel" id="${labId}-observations" aria-live="polite"></div>
      <div class="lab-canvas-wrapper">
        <svg class="lab-svg-layer" id="${labId}-svg"></svg>
        <div class="lab-canvas" id="${labId}-canvas">
          ${tablesHtml}
        </div>
      </div>
      <div class="lab-relations-panel" id="${labId}-relations" aria-live="polite"></div>
      <div id="${labId}-status" class="lab-status"></div>
    </div>
  `;
}

export function renderLabTable(
  table: TableDefinition,
  ti: number,
  lessonId: string,
  allTables: TableDefinition[] = [],
): string {
  const tableId = table.tableId || createTableId(lessonId, ti);
  const columns = table.columns || [];
  const rows = table.rows || [];

  const headers = columns
    .map(
      (col, ci) => `
    <th class="data-table__header-cell" data-pk="${col.isPK || false}" data-fk="${col.isFK || false}" data-col-index="${ci}">
      <div contenteditable="true" class="col-name-editable" autocapitalize="off" autocorrect="off" spellcheck="false">${escapeHtml(col.name)}</div>
      <span class="col-type">${escapeHtml(col.type)}${col.autoIncrement ? ' AUTO' : ''}</span>
      <div class="col-metadata-toggles">
        <button class="meta-toggle ${col.isPK ? 'active' : ''}" data-action="toggle-pk" title="Clave primaria">🔑</button>
        <button class="meta-toggle is-fk ${col.isFK ? 'active' : ''}" data-action="toggle-fk" title="Clave foránea">🔗</button>
        ${
          col.isFK
            ? `
          <button class="cardinality-toggle" data-action="toggle-cardinality" title="Alternar cardinalidad" aria-label="Alternar cardinalidad de ${escapeHtml(col.name)}">${col.cardinality || '1:N'}</button>
        `
            : ''
        }
      </div>
      ${
        col.isFK
          ? `
        <div class="ref-picker-container">
          <select class="ref-picker" data-action="change-ref" aria-label="Tabla referenciada por ${escapeHtml(col.name)}">
            <option value="">Ref: [Seleccionar]</option>
            ${allTables
              .map((candidate, candidateIndex) => {
                const candidateId = candidate.tableId || createTableId(lessonId, candidateIndex);
                if (candidateId === tableId) return '';
                return `<option value="${escapeHtml(candidateId)}" ${col.references === candidateId ? 'selected' : ''}>${escapeHtml(candidate.tableName)}</option>`;
              })
              .join('')}
          </select>
        </div>
      `
          : ''
      }
      <button class="lab-col-delete" data-action="delete-col" title="Eliminar columna">×</button>
    </th>
  `,
    )
    .join('');

  const bodyRows = rows
    .map(
      (row, ri) => `
    <tr data-row="${ri}">
      ${row
        .map(
          (cell, ci) => `
        <td ${ci > 0 || !columns[ci]?.autoIncrement ? 'contenteditable="true"' : ''} data-col="${ci}">${escapeHtml(String(cell))}</td>
      `,
        )
        .join('')}
      <td class="data-table__extra-col-cell"></td>
      <td class="lab-row-delete-cell"><button class="lab-row-delete" data-action="delete-row">×</button></td>
    </tr>
  `,
    )
    .join('');

  return renderSectionBlock(
    `
    <div class="lab-table-header">
      <span class="table-name-display" contenteditable="true" autocapitalize="off" autocorrect="off" spellcheck="false">${escapeHtml(table.tableName)}</span>
      <span class="edit-icon">✎</span>
      <button class="lab-table-delete" title="Eliminar tabla">×</button>
    </div>
    ${renderLabTableWarning(`${tableId}-warning`)}
    <div class="data-table-wrapper" id="${tableId}" data-table-name="${escapeHtml(table.tableName)}" data-table-id="${escapeHtml(tableId)}">
      <table class="data-table">
        <thead><tr id="${tableId}-header">${headers}<th class="data-table__add-col-th"><button class="data-table__add-col" data-table-id="${tableId}" data-col-count="${columns.length}">+</button></th></tr></thead>
        <tbody id="${tableId}-body">${bodyRows}</tbody>
      </table>
      <button class="data-table__add-row" data-table-id="${tableId}" data-columns='${JSON.stringify(columns)}' data-row-count="${rows.length}" data-has-extra-col="true">
        + Agregar fila
      </button>
    </div>
  `,
    {
      className: 'lab-table-item',
      animationClass: 'anim-slide-up',
      index: ti,
      marginClass: '',
      attrs: `data-index="${ti}" data-table-id="${escapeHtml(tableId)}"`,
    },
  );
}
