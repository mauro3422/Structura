import { escapeAttr, escapeHtml } from '../Utils.ts';
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

type LabRuleChip = {
  label: string;
  helpTitle: string;
  helpText: string;
};

function renderLabRuleChip(cardId: string, chip: LabRuleChip, index: number): string {
  return `
    <li>
      <button
        type="button"
        class="lab-rule-chip"
        data-action="rule-help"
        data-rule-help-card="${escapeAttr(cardId)}"
        data-rule-help-title="${escapeAttr(chip.helpTitle)}"
        data-rule-help-text="${escapeAttr(chip.helpText)}"
        title="${escapeAttr(`${chip.helpTitle}. ${chip.helpText}`)}"
        aria-label="${escapeAttr(`${chip.helpTitle}. ${chip.helpText}`)}"
        aria-pressed="false"
        data-rule-chip-index="${index}"
      >
        ${escapeHtml(chip.label)}
      </button>
    </li>
  `;
}

type LabRuleCard = {
  kind: 'required' | 'suggested' | 'future';
  label: string;
  title: string;
  toggle: string;
  description: string;
  chips: LabRuleChip[];
  helperLabel: string;
  helperText: string;
};

function renderLabRuleCard(card: LabRuleCard, cardId: string): string {
  return `
    <details class="lab-rule-card lab-rule-card--${card.kind}" data-rule-card="${escapeAttr(cardId)}">
      <summary class="lab-rule-card__summary">
        <span class="lab-rule-card__label">${escapeHtml(card.label)}</span>
        <span class="lab-rule-card__title">${escapeHtml(card.title)}</span>
        <span class="lab-rule-card__toggle">Ver</span>
      </summary>
      <div class="lab-rule-card__body">
        <p class="lab-rule-card__description">${escapeHtml(card.description)}</p>
        <div class="lab-rule-card__helper" data-rule-help-panel>
          <div class="lab-rule-card__helper-kicker">Ayuda rápida</div>
          <div class="lab-rule-card__helper-title" data-rule-help-title>${escapeHtml(card.helperLabel)}</div>
          <div class="lab-rule-card__helper-text" data-rule-help-text>${escapeHtml(card.helperText)}</div>
        </div>
        <div class="lab-rule-card__toolbar">
          <span class="lab-rule-card__toolbar-label">Pistas</span>
          <span class="lab-rule-card__toolbar-copy">Pasa el mouse o tocá un chip para ver su explicación.</span>
        </div>
        <ul class="lab-rule-card__list">
          ${card.chips.map((chip, index) => renderLabRuleChip(cardId, chip, index)).join('')}
        </ul>
      </div>
    </details>
  `;
}

function renderLaboratoryRulesPanel(labId: string): string {
  const cards: LabRuleCard[] = [
    {
      kind: 'required',
      label: 'Obligatorio',
      title: 'FK real y PK visible',
      toggle: 'Ver',
      description:
        'Sin una FK que apunte a una tabla real, la relación queda incompleta. Cada tabla debería mostrar una PK visible para identificar filas.',
      chips: [
        {
          label: 'FK → tabla real',
          helpTitle: 'FK real',
          helpText: 'La clave foránea debe apuntar a una tabla que exista y que el usuario haya elegido, no a un nombre suelto.',
        },
        {
          label: 'PK visible por tabla',
          helpTitle: 'PK visible',
          helpText: 'Cada tabla necesita una clave primaria clara para distinguir filas y entender qué registro es cuál.',
        },
        {
          label: 'Nombre único',
          helpTitle: 'Nombre único',
          helpText: 'Dos tablas con el mismo nombre confunden el modelo y vuelven ambiguas las relaciones.',
        },
      ],
      helperLabel: 'Elegí una pista',
      helperText: 'Tocá un chip para leer qué se espera en esta regla.',
    },
    {
      kind: 'suggested',
      label: 'Sugerido',
      title: 'Nombres claros',
      toggle: 'Ver',
      description:
        'Podés usar minúsculas, snake_case o camelCase. El laboratorio solo sugiere ordenar nombres inconsistentes y te ayuda a leer mejor el modelo.',
      chips: [
        {
          label: 'snake_case o camelCase',
          helpTitle: 'Formato sugerido',
          helpText: 'No se bloquean los nombres simples; solo se intenta mantener una convención legible.',
        },
        {
          label: 'Nombres consistentes',
          helpTitle: 'Consistencia',
          helpText: 'Usar el mismo estilo de nombres ayuda a leer tablas, columnas y claves sin perderse.',
        },
        {
          label: 'Varias PK = compuesta',
          helpTitle: 'PK compuesta',
          helpText: 'Si más de una columna forma la identidad de la fila, el laboratorio lo interpreta como clave compuesta.',
        },
        {
          label: '1:N repite detalle',
          helpTitle: 'Relación 1:N',
          helpText: 'La tabla detalle puede repetir la misma FK muchas veces; eso es normal en una relación uno a muchos.',
        },
        {
          label: 'N:N vía tabla puente',
          helpTitle: 'Relación N:N',
          helpText: 'Cuando dos tablas se conectan a través de una tercera, el laboratorio lo toma como una tabla puente.',
        },
      ],
      helperLabel: 'Elegí una pista',
      helperText: 'Tocá un chip para ver una guía corta, no una solución completa.',
    },
    {
      kind: 'future',
      label: 'Fase 2',
      title: 'Reglas estrictas',
      toggle: 'Ver',
      description:
        'Acá irán las reglas de modelado avanzado: PK compuestas reales, FK única para 1:1 y tablas puente con atributos para representar N:N con más rigor.',
      chips: [
        {
          label: 'PK compuestas reales',
          helpTitle: 'PK compuesta estricta',
          helpText: 'La identidad de una fila depende de varias columnas y el laboratorio debería validarlo con más rigor.',
        },
        {
          label: 'FK única para 1:1',
          helpTitle: '1:1 estricta',
          helpText: 'Para una relación uno a uno real, la FK debería ser única o compartir la PK de la tabla relacionada.',
        },
        {
          label: 'Puentes con atributos',
          helpTitle: 'Tabla puente',
          helpText: 'Una relación muchos a muchos suele necesitar una tabla intermedia que también tenga datos propios.',
        },
      ],
      helperLabel: 'Pendiente',
      helperText: 'Estas reglas quedarán para una fase más avanzada del laboratorio.',
    },
  ];

  return `
    <div class="lab-rules-panel" id="${labId}-rules" aria-live="polite">
      <div class="lab-rules-panel__header">
        <div>
          <div class="lab-rules-panel__title">Reglas del laboratorio</div>
          <div class="lab-rules-panel__subtitle">Lo obligatorio, lo sugerido y lo que dejamos para una fase posterior</div>
          <div class="lab-rules-panel__hint">Tocá una tarjeta o un chip para ver qué significa y cómo aplicarlo.</div>
        </div>
      </div>
      <div class="lab-rules-grid">
        ${cards.map((card) => renderLabRuleCard(card, `${labId}-${card.kind}`)).join('')}
      </div>
    </div>
  `;
}
export function renderTableExample(section: TableSection, index: number): string {
  const headers = (section.columns || []).map((col) => renderStaticHeaderCell(col)).join('');
  const rows = renderStaticRows(section.rows || [], index);

  return renderSectionBlock(
    `
    ${renderTableCaption('Ã°Å¸â€œâ€¹', section.tableName)}
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
    ${renderTableCaption('Ã¢Å“ÂÃ¯Â¸Â', section.tableName)}
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
        <button class="meta-toggle ${col.isPK ? 'active' : ''}" data-action="toggle-pk" title="Clave primaria">Ã°Å¸â€â€˜</button>
        <button class="meta-toggle is-fk ${col.isFK ? 'active' : ''}" data-action="toggle-fk" title="Clave forÃƒÂ¡nea">Ã°Å¸â€â€”</button>
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
      <button class="lab-col-delete" data-action="delete-col" title="Eliminar columna">Ãƒâ€”</button>
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
      <td class="lab-row-delete-cell"><button class="lab-row-delete" data-action="delete-row">Ãƒâ€”</button></td>
    </tr>
  `,
    )
    .join('');

  return renderSectionBlock(
    `
    <div class="lab-table-header">
      <span class="table-name-display" contenteditable="true" autocapitalize="off" autocorrect="off" spellcheck="false">${escapeHtml(table.tableName)}</span>
      <span class="edit-icon">Ã¢Å“Å½</span>
      <button class="lab-table-delete" title="Eliminar tabla">Ãƒâ€”</button>
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

