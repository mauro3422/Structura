import { escapeHtml } from '../Utils.js';
import { renderSectionBlock } from '../../templates.js';

export function createDefaultLabTable() {
  return {
    tableName: 'MiTabla1',
    columns: [
      { name: 'ID', type: 'INT', autoIncrement: true, isPK: true },
      { name: 'Nombre', type: 'TEXT' },
    ],
    rows: [['1', 'Ejemplo']],
  };
}

export function createDefaultLabTables() {
  return [createDefaultLabTable()];
}

export function renderTableCaption(icon, title) {
  return `
    <div class="table-caption">
      ${icon ? `${icon} ` : ''}
      ${escapeHtml(title)}
    </div>
  `;
}

export function renderStaticHeaderCell(col) {
  return `
    <th>
      ${escapeHtml(col.name)}
      ${col.isPK ? '<span class="key-icon">🔑</span>' : ''}
      ${col.isFK ? '<span class="key-icon">🔗</span>' : ''}
      <span class="col-type">${escapeHtml(col.type)}</span>
    </th>
  `;
}

export function renderInteractiveHeaderCell(col) {
  return `
    <th data-type="${escapeHtml(col.type)}" data-pk="${col.isPK || false}">
      ${escapeHtml(col.name)}
      ${col.isPK ? '<span class="key-icon">🔑</span>' : ''}
      <span class="col-type">${escapeHtml(col.type)}${col.autoIncrement ? ' AUTO' : ''}</span>
    </th>
  `;
}

export function renderStaticRows(rows, index) {
  return rows.map((row, ri) => renderSectionBlock(`
    ${row.map(cell => `<td>${escapeHtml(String(cell))}</td>`).join('')}
  `, {
    tag: 'tr',
    animationClass: 'anim-row-slide-in',
    index: index + ri,
    delayStep: 0.1,
    marginClass: '',
  })).join('');
}

export function renderInteractiveRows(rows, columns, { canAddCols = false } = {}) {
  return (rows || []).map((row, ri) => renderSectionBlock(`
    ${row.map((cell, ci) => `
      <td ${ci > 0 || !columns[ci]?.autoIncrement ? 'contenteditable="true"' : ''}
          data-col="${ci}"
          data-placeholder="${escapeHtml(columns[ci]?.placeholder || '')}">${escapeHtml(String(cell))}</td>
    `).join('')}
    ${canAddCols ? '<td class="data-table__extra-col-cell"></td>' : ''}
  `, {
    tag: 'tr',
    attrs: `data-row="${ri}"`,
    animationClass: 'anim-row-slide-in',
    index: ri,
    delayStep: 0.1,
    marginClass: '',
  })).join('');
}

export function renderAddColumnHeader(tableId, columnCount) {
  return `
    <th class="data-table__add-col-th">
      <button class="data-table__add-col" id="${tableId}-add-col" data-table-id="${tableId}" data-col-count="${columnCount}">
        <span class="plus-icon-sm">+</span>
      </button>
    </th>
  `;
}

export function renderAddRowButton(tableId, columns, rowCount, canAddCols) {
  return `
    <button class="data-table__add-row" id="${tableId}-add" data-table-id="${tableId}" data-columns='${JSON.stringify(columns)}' data-row-count="${rowCount}" data-has-extra-col="${canAddCols}">
      + Agregar fila
    </button>
  `;
}

export function renderLabTableToolbar(labId) {
  return `
    <div class="lab-toolbar">
      <button class="btn btn-primary btn-sm" id="${labId}-add-table" aria-label="Crear nueva tabla">
        + Nueva Tabla
      </button>
      <button class="btn btn-accent btn-sm" id="${labId}-save" aria-label="Guardar laboratorio ahora">
        💾 Guardar Laboratorio
      </button>
      <span class="lab-autosave-indicator" aria-live="polite">Guardado automático</span>
    </div>
  `;
}

export function renderLabTableWarning(warningId) {
  return `
    <div class="lab-table-warning" id="${warningId}">
      ⚠️ Esta tabla no tiene una Clave Primaria (PK) definida.
    </div>
  `;
}
