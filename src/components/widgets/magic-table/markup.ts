import { escapeHtml } from '../Utils.ts';
import { renderSectionBlock } from '../../templates.ts';

export interface MagicTableFrameProps {
  tableId: string;
  index: number;
  lessonId: string;
  tableName: string;
  isNarrative: boolean;
  definition: string;
  headersHtml: string;
  rowsHtml: string;
}

export interface MagicColumn {
  name: string;
  type: string;
}

export type MagicRow = Array<string | number | boolean | null>;

export function renderMagicTableFrame({
  tableId,
  index,
  lessonId,
  tableName,
  isNarrative,
  definition,
  headersHtml,
  rowsHtml,
}: MagicTableFrameProps): string {
  return renderSectionBlock(`
    <div class="magic-table-card__blueprint"></div>
    <div class="magic-table-card__grid-lines"></div>

    <div class="magic-table__evolution-nodes">
      <div class="node-evolution" data-evolution="1" data-id="core" title="Crear el contenedor">
        <div class="node-aura"></div>
        <div class="node-icon">📦</div>
        <div class="node-tag">El contenedor</div>
      </div>

      <div class="node-evolution" data-evolution="2" data-id="scheme" title="Poner etiquetas">
        <div class="node-aura"></div>
        <div class="node-icon">🏷️</div>
        <div class="node-tag">Las etiquetas</div>
      </div>

      <div class="node-evolution" data-evolution="3" data-id="data" title="Llenar con datos">
        <div class="node-aura"></div>
        <div class="node-icon">📝</div>
        <div class="node-tag">El contenido</div>
      </div>
    </div>

    <div class="magic-table-card__content">
      <div class="blueprint-morph-target"></div>

      <div class="magic-table-card__header reveal-frame">
        <span class="magic-table-card__icon">📊</span>
        <span class="magic-table-card__label">${escapeHtml(tableName)}</span>
      </div>

      <div class="magic-table__definition reveal-frame">
        <strong>Definición:</strong> ${escapeHtml(definition)}
      </div>

      <div class="magic-assembly-area">
        <table class="magic-table-struct">
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>
  `, {
    className: `magic-table-card ${isNarrative ? 'is-narrative-mode' : ''}`,
    attrs: `id="${tableId}" data-index="${index}" data-table-name="${tableName}" data-lesson-id="${lessonId}" data-evolution-state="0"`,
    marginClass: '',
    animate: false,
  });
}

export function renderMagicHeader(columns: MagicColumn[] = []): string {
  return columns.map((col) => `
    <th class="reveal-headers">
      ${escapeHtml(col.name)}
      <span class="col-type">${escapeHtml(col.type)}</span>
    </th>
  `).join('');
}

export function renderMagicRows(rows: MagicRow[] = []): string {
  return rows.map((row, ri) => `
    <tr class="reveal-row-${ri}">
      ${row.map((cell) => `
        <td>${escapeHtml(String(cell))}</td>
      `).join('')}
    </tr>
  `).join('');
}
