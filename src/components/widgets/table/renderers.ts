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
import { resolveLabTables } from './state.ts';
import type { TableDefinition, TableSection, RenderLabTable } from './types.ts';

export function renderTableExample(section: TableSection, index: number): string {
  const headers = (section.columns || []).map((col) => renderStaticHeaderCell(col)).join('');
  const rows = renderStaticRows(section.rows || [], index);

  return renderSectionBlock(`
    ${renderTableCaption('📋', section.tableName)}
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead><tr>${headers}</tr></thead>
        <tbody id="table-example-${index}-body">${rows}</tbody>
      </table>
    </div>
  `, {
    className: 'data-table-example',
    index,
  });
}

export function renderInteractiveTable(section: TableSection, index: number, lessonId: string): string {
  const tableId = `interactive-table-${lessonId}-${index}`;
  const canAddCols = section.canAddColumns !== false;
  const columns = section.columns || [];
  const headers = columns.map((col) => renderInteractiveHeaderCell(col)).join('');
  const addColHeader = canAddCols ? renderAddColumnHeader(tableId, columns.length) : '';
  const rows = renderInteractiveRows(section.initialRows || [], columns, { canAddCols });

  return renderSectionBlock(`
    ${renderTableCaption('✏️', section.tableName)}
    <div class="data-table-wrapper" id="${tableId}" data-table-name="${escapeHtml(section.tableName || '')}">
      <table class="data-table" id="${tableId}-table">
        <thead><tr id="${tableId}-header">${headers}${addColHeader}</tr></thead>
        <tbody id="${tableId}-body">${rows}</tbody>
      </table>
      ${section.canAddRows !== false ? renderAddRowButton(tableId, columns, section.initialRows?.length || 0, canAddCols) : ''}
    </div>
  `, {
    className: 'data-table-container',
    index,
  });
}

export function renderTableLaboratory(section: TableSection, index: number, lessonId: string): string {
  const labId = `table-lab-${lessonId}`;
  const tables = resolveLabTables(section, lessonId);
  const tablesHtml = tables.map((table, ti) => renderLabTable(table, ti, lessonId, tables)).join('');

  return `
    <div class="table-laboratory" id="${labId}" data-lesson-id="${lessonId}">
      ${renderLabTableToolbar(labId)}
      <div class="lab-canvas-wrapper">
        <svg class="lab-svg-layer" id="${labId}-svg"></svg>
        <div class="lab-canvas" id="${labId}-canvas">
          ${tablesHtml}
        </div>
      </div>
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
  const tableId = `lab-table-${lessonId}-${ti}`;
  const columns = table.columns || [];
  const rows = table.rows || [];

  const headers = columns.map((col, ci) => `
    <th class="data-table__header-cell" data-pk="${col.isPK || false}" data-fk="${col.isFK || false}" data-col-index="${ci}">
      <div contenteditable="true" class="col-name-editable">${escapeHtml(col.name)}</div>
      <span class="col-type">${escapeHtml(col.type)}${col.autoIncrement ? ' AUTO' : ''}</span>
      <div class="col-metadata-toggles">
        <button class="meta-toggle ${col.isPK ? 'active' : ''}" data-action="toggle-pk" title="Clave primaria">🔑</button>
        <button class="meta-toggle is-fk ${col.isFK ? 'active' : ''}" data-action="toggle-fk" title="Clave foránea">🔗</button>
        ${col.isFK ? `
          <button class="cardinality-toggle" data-action="toggle-cardinality" title="Alternar cardinalidad" aria-label="Alternar cardinalidad de ${escapeHtml(col.name)}">${col.cardinality || '1:N'}</button>
        ` : ''}
      </div>
      ${col.isFK ? `
        <div class="ref-picker-container">
          <select class="ref-picker" data-action="change-ref" aria-label="Tabla referenciada por ${escapeHtml(col.name)}">
            <option value="">Ref: [Seleccionar]</option>
            ${allTables
              .filter((candidate) => candidate.tableName !== table.tableName)
              .map((candidate) => `<option value="${escapeHtml(candidate.tableName)}" ${col.references === candidate.tableName ? 'selected' : ''}>${escapeHtml(candidate.tableName)}</option>`)
              .join('')}
          </select>
        </div>
      ` : ''}
      <button class="lab-col-delete" data-action="delete-col" title="Eliminar columna">×</button>
    </th>
  `).join('');

  const bodyRows = rows.map((row, ri) => `
    <tr data-row="${ri}">
      ${row.map((cell, ci) => `
        <td ${ci > 0 || !columns[ci]?.autoIncrement ? 'contenteditable="true"' : ''} data-col="${ci}">${escapeHtml(String(cell))}</td>
      `).join('')}
      <td class="data-table__extra-col-cell"></td>
      <td class="lab-row-delete-cell"><button class="lab-row-delete" data-action="delete-row">×</button></td>
    </tr>
  `).join('');

  return renderSectionBlock(`
    <div class="lab-table-header">
      <span class="table-name-display" contenteditable="true">${escapeHtml(table.tableName)}</span>
      <span class="edit-icon">✎</span>
      <button class="lab-table-delete" title="Eliminar tabla">×</button>
    </div>
    ${renderLabTableWarning(`${tableId}-warning`)}
    <div class="data-table-wrapper" id="${tableId}" data-table-name="${escapeHtml(table.tableName)}">
      <table class="data-table">
        <thead><tr id="${tableId}-header">${headers}<th class="data-table__add-col-th"><button class="data-table__add-col" data-table-id="${tableId}" data-col-count="${columns.length}">+</button></th></tr></thead>
        <tbody id="${tableId}-body">${bodyRows}</tbody>
      </table>
      <button class="data-table__add-row" data-table-id="${tableId}" data-columns='${JSON.stringify(columns)}' data-row-count="${rows.length}" data-has-extra-col="true">
        + Agregar fila
      </button>
    </div>
  `, {
    className: 'lab-table-item',
    animationClass: 'anim-slide-up',
    index: ti,
    marginClass: '',
    attrs: `data-index="${ti}"`,
  });
}
