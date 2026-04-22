import { escapeHtml } from '../Utils.ts';
import type { RenderLabTable, TableDefinition, TableObservation, TableRelationship } from './types.ts';

export function getLabState(labId: string): TableDefinition[] {
  const lab = document.getElementById(labId);
  if (!lab) return [];
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!canvas) return [];

  return Array.from(canvas.querySelectorAll<HTMLElement>('.lab-table-item')).map((item) => {
    const tableName = item.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() || '';
    const wrapper = item.querySelector<HTMLElement>('.data-table-wrapper');
    if (!wrapper) {
      return { tableName, columns: [], rows: [] };
    }

    const columns = Array.from(wrapper.querySelectorAll<HTMLTableCellElement>('thead th'))
      .filter((th) => th.hasAttribute('data-col-index'))
      .map((th) => {
        const name = th.querySelector<HTMLElement>('.col-name-editable')?.textContent?.trim() || 'Col';
        const typeStr = th.querySelector<HTMLElement>('.col-type')?.textContent?.trim() || 'TEXT';
        const autoIncrement = typeStr.includes('AUTO');
        const cleanType = typeStr.split(' ')[0].trim();
        const isPK = th.querySelector<HTMLElement>('[data-action="toggle-pk"]')?.classList.contains('active');
        const isFK = th.querySelector<HTMLElement>('[data-action="toggle-fk"]')?.classList.contains('active');
        const references = th.querySelector<HTMLSelectElement>('.ref-picker')?.value || null;
        const cardinality = th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim() || '1:N';
        const placeholder = th.querySelector<HTMLElement>('[data-placeholder]')?.getAttribute('data-placeholder') || undefined;
        return { name, type: cleanType, autoIncrement, isPK, isFK, references, cardinality, placeholder };
      });

    const rows = Array.from(wrapper.querySelectorAll<HTMLTableRowElement>('tbody tr')).map((tr) => {
      return Array.from(tr.querySelectorAll<HTMLTableCellElement>('td[data-col]')).map((td) => td.textContent?.trim() || '');
    });

    return { tableName, columns, rows };
  });
}

export function renderCanvas(labId: string, tables: TableDefinition[], renderLabTable: RenderLabTable): void {
  const lab = document.getElementById(labId);
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!lab || !canvas) return;

  const lessonId = lab.dataset.lessonId || '';
  canvas.innerHTML = tables.map((table, index) => renderLabTable(table, index, lessonId, tables)).join('');
  updateRelationships(labId);
}

function normalizeCardinality(value: string | undefined): string {
  const normalized = (value || '1:N').replace(/\s+/g, '').toUpperCase();
  if (normalized === '1:1') return '1:1';
  if (normalized === '1:N') return '1:N';
  return '1:N';
}

function describeRoles(cardinality: string): { sourceRole: string; targetRole: string } {
  if (cardinality === '1:1') {
    return { sourceRole: 'FK', targetRole: 'Referencia sugerida' };
  }

  return { sourceRole: 'Detalle', targetRole: 'Maestra' };
}

function isAcronym(value: string): boolean {
  return /^[A-Z0-9]{2,}$/.test(value);
}

function isCamelCaseLike(value: string): boolean {
  return /^[a-z][A-Za-z0-9]*$/.test(value);
}

function toCamelCase(value: string): string {
  const parts = value
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return value;

  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function collectObservations(labId: string): TableObservation[] {
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!canvas) return [];

  const tables = Array.from(canvas.querySelectorAll<HTMLElement>('.lab-table-item'));
  const observations: TableObservation[] = [];
  const tableNames = new Map<string, number>();

  tables.forEach((item) => {
    const tableName = item.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() || '';
    if (!tableName) {
      observations.push({
        kind: 'error',
        title: 'Nombre de tabla vacío',
        message: 'Cada tabla debería tener un nombre visible.',
        hint: 'Poné un nombre corto y claro, por ejemplo clientes o pedidos.',
      });
    } else {
      tableNames.set(tableName, (tableNames.get(tableName) || 0) + 1);
      if (tableName.includes('_') || tableName.includes(' ')) {
        observations.push({
          kind: 'info',
          title: 'Sugerencia de nombre de tabla',
          message: `La tabla "${tableName}" funciona, pero podrías escribirla con camelCase para mantener el estilo.`,
          hint: `Sugerencia: ${toCamelCase(tableName)}`,
          subject: tableName,
        });
      }
    }

    const wrapper = item.querySelector<HTMLElement>('.data-table-wrapper');
    if (!wrapper) return;

    const columns = Array.from(wrapper.querySelectorAll<HTMLTableCellElement>('thead th[data-col-index]'));
    const seenColumns = new Set<string>();
    let hasPk = false;

    columns.forEach((th) => {
      const colName = th.querySelector<HTMLElement>('.col-name-editable')?.textContent?.trim() || '';
      const isPk = th.dataset.pk === 'true';
      const isFk = th.dataset.fk === 'true';
      const targetTable = th.querySelector<HTMLSelectElement>('.ref-picker')?.value?.trim() || '';
      const cardinality = normalizeCardinality(th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim());
      const sourceIsPk = isPk;

      if (isPk) hasPk = true;

      if (colName) {
        if (seenColumns.has(colName)) {
          observations.push({
            kind: 'error',
            title: 'Columna duplicada',
            message: `La columna "${colName}" se repite dentro de la misma tabla.`,
            hint: 'Usá un nombre único para cada campo.',
            subject: colName,
          });
        }
        seenColumns.add(colName);

        if (!isAcronym(colName) && !isCamelCaseLike(colName)) {
          observations.push({
            kind: 'info',
            title: 'Sugerencia camelCase',
            message: `La columna "${colName}" se entiende, pero camelCase suele ser más consistente para variables.`,
            hint: `Sugerencia: ${toCamelCase(colName)}`,
            subject: colName,
          });
        }
      }

      if (isFk && !targetTable) {
        observations.push({
          kind: 'error',
          title: 'Relación inválida',
          message: `La columna "${colName || 'sin nombre'}" está marcada como FK pero no apunta a ninguna tabla.`,
          hint: 'Elegí una tabla destino para cerrar el enlace.',
          subject: colName || undefined,
        });
      }

      if (isFk && targetTable && cardinality === '1:1' && !sourceIsPk) {
        observations.push({
          kind: 'warning',
          title: '1:1 a revisar',
          message: `La relación "${colName || 'FK'} → ${targetTable}" parece 1:1, pero la FK no es PK.`,
          hint: 'Si querés 1:1 estricta, la FK debería ser única o compartir la PK.',
          subject: colName || undefined,
        });
      }
    });

    if (!hasPk) {
      observations.push({
        kind: 'warning',
        title: 'Falta clave primaria',
        message: `La tabla "${tableName || 'sin nombre'}" no tiene PK marcada.`,
        hint: 'Una tabla base normalmente debería tener una clave primaria.',
        subject: tableName || undefined,
      });
    }
  });

  tableNames.forEach((count, name) => {
    if (count > 1) {
      observations.push({
        kind: 'error',
        title: 'Nombre de tabla duplicado',
        message: `Hay ${count} tablas con el nombre "${name}".`,
        hint: 'Cada tabla debería tener un nombre distinto para evitar confusiones.',
        subject: name,
      });
    }
  });

  return observations;
}

function renderObservationItem(observation: TableObservation): string {
  return `
    <div class="lab-observation-item lab-observation-item--${observation.kind}">
      <div class="lab-observation-item__head">
        <span class="lab-observation-item__title">${escapeHtml(observation.title)}</span>
        <span class="lab-observation-item__kind">${escapeHtml(observation.kind)}</span>
      </div>
      <div class="lab-observation-item__message">${escapeHtml(observation.message)}</div>
      ${observation.hint ? `<div class="lab-observation-item__hint">${escapeHtml(observation.hint)}</div>` : ''}
      ${observation.subject ? `<div class="lab-observation-item__subject">${escapeHtml(observation.subject)}</div>` : ''}
    </div>
  `;
}

export function renderObservationsPanel(labId: string, observations: TableObservation[]): void {
  const panel = document.getElementById(`${labId}-observations`);
  if (!panel) return;

  const errorCount = observations.filter((item) => item.kind === 'error').length;
  const warningCount = observations.filter((item) => item.kind === 'warning').length;

  panel.innerHTML = `
    <div class="lab-observations-panel__header">
      <div>
        <div class="lab-observations-panel__title">Observaciones</div>
        <div class="lab-observations-panel__subtitle">Sugerencias y alertas para modelar mejor tus tablas</div>
      </div>
      <div class="lab-observations-panel__stats">
        <span class="lab-observations-panel__chip">${observations.length} total</span>
        ${warningCount > 0 ? `<span class="lab-observations-panel__chip is-warning">${warningCount} avisos</span>` : ''}
        ${errorCount > 0 ? `<span class="lab-observations-panel__chip is-danger">${errorCount} errores</span>` : ''}
      </div>
    </div>
    ${
      observations.length > 0
        ? `<div class="lab-observations-list">${observations.map((item) => renderObservationItem(item)).join('')}</div>`
        : `<div class="lab-observations-empty">No hay observaciones por ahora. Tu modelo está bastante limpio.</div>`
    }
  `;
}

function collectRelationships(labId: string): TableRelationship[] {
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!canvas) return [];

  const tables = Array.from(canvas.querySelectorAll<HTMLElement>('.lab-table-item'));
  const names = new Set(
    tables
      .map((item) => item.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() || '')
      .filter(Boolean),
  );

  const relationships: TableRelationship[] = [];

  tables.forEach((item) => {
    const sourceTable = item.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() || '';
    const wrapper = item.querySelector<HTMLElement>('.data-table-wrapper');
    if (!wrapper) return;

    Array.from(wrapper.querySelectorAll<HTMLTableCellElement>('thead th[data-col-index]')).forEach((th) => {
      if (th.dataset.fk !== 'true') return;

      const sourceColumn = th.querySelector<HTMLElement>('.col-name-editable')?.textContent?.trim() || 'Columna';
      const targetTable = th.querySelector<HTMLSelectElement>('.ref-picker')?.value?.trim() || '';
      const sourceIsPk = th.dataset.pk === 'true';
      const cardinality = normalizeCardinality(th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim());
      const roles = describeRoles(cardinality);

      if (!targetTable) {
        relationships.push({
          sourceTable,
          sourceColumn,
          targetTable: 'Sin destino',
          cardinality,
          sourceRole: 'Origen',
          targetRole: 'Pendiente',
          status: 'missing-reference',
          message: 'Relacion invalida: falta una tabla destino para cerrar el enlace.',
        });
        return;
      }

      const targetExists = names.has(targetTable);
      const caution = targetExists && cardinality === '1:1' && !sourceIsPk;

      relationships.push({
        sourceTable,
        sourceColumn,
        targetTable,
        cardinality,
        sourceRole: roles.sourceRole,
        targetRole: roles.targetRole,
        status: targetExists ? (caution ? 'caution' : 'linked') : 'missing-target',
        message: targetExists
          ? cardinality === '1:1'
            ? caution
              ? '1:1 detectada. Para que sea estricta, conviene que la FK sea unica o compartida con la PK.'
              : '1:1 detectada. La tabla destino funciona como referencia principal.'
            : '1:N detectada. La tabla destino actua como maestra y la actual como detalle. Repetir la misma FK en varias filas es normal.'
          : 'Relacion invalida: la tabla destino no esta disponible en el laboratorio.',
      });
    });
  });

  return relationships;
}

function renderRelationshipItem(item: TableRelationship): string {
  const stateLabel =
    item.status === 'linked'
      ? 'OK'
      : item.status === 'caution'
        ? 'Revisar'
        : item.status === 'missing-target'
          ? 'Destino ausente'
          : 'Falta destino';

  return `
    <div class="lab-relation-item lab-relation-item--${item.status}">
      <div class="lab-relation-item__top">
        <span class="lab-relation-item__pair">${escapeHtml(item.sourceTable)}.${escapeHtml(item.sourceColumn)} → ${escapeHtml(item.targetTable)}</span>
        <span class="lab-relation-item__badge">${escapeHtml(item.cardinality)}</span>
      </div>
      <div class="lab-relation-item__roles">
        <span class="lab-relation-item__role lab-relation-item__role--source">${escapeHtml(item.sourceRole)}</span>
        <span class="lab-relation-item__role lab-relation-item__role--target">${escapeHtml(item.targetRole)}</span>
      </div>
      <div class="lab-relation-item__bottom">
        <span class="lab-relation-item__state">${escapeHtml(stateLabel)}</span>
        <span class="lab-relation-item__message">${escapeHtml(item.message)}</span>
      </div>
    </div>
  `;
}

export function renderRelationshipsPanel(labId: string, relationships: TableRelationship[]): void {
  const panel = document.getElementById(`${labId}-relations`);
  if (!panel) return;

  const linkedCount = relationships.filter((item) => item.status === 'linked').length;
  const cautionCount = relationships.filter((item) => item.status === 'caution').length;
  const missingCount = relationships.length - linkedCount - cautionCount;

  panel.innerHTML = `
    <div class="lab-relations-panel__header">
      <div>
        <div class="lab-relations-panel__title">Panel de relaciones</div>
        <div class="lab-relations-panel__subtitle">Detecta FKs, destinos, cardinalidad y rol sugerido</div>
      </div>
      <div class="lab-relations-panel__stats">
        <span class="lab-relations-panel__chip">${relationships.length} total</span>
        <span class="lab-relations-panel__chip ${missingCount > 0 || cautionCount > 0 ? 'is-warning' : 'is-ok'}">${linkedCount} vinculadas</span>
        ${cautionCount > 0 ? `<span class="lab-relations-panel__chip is-warning">${cautionCount} a revisar</span>` : ''}
      </div>
    </div>
    ${
      relationships.length > 0
        ? `
          <div class="lab-relations-list">
            ${relationships.map((item) => renderRelationshipItem(item)).join('')}
          </div>
        `
        : `
          <div class="lab-relations-empty">
            No hay relaciones definidas todavia. Marca una columna como FK y elige su tabla destino para empezar.
          </div>
        `
    }
  `;
}

export function updateObservations(labId: string): void {
  renderObservationsPanel(labId, collectObservations(labId));
}

export function updateRelationships(labId: string): void {
  const svg = document.getElementById(`${labId}-svg`) as SVGSVGElement | null;
  const canvas = document.getElementById(`${labId}-canvas`) as HTMLElement | null;
  if (!canvas) return;

  if (svg) {
    svg.innerHTML = '';
  }
  const canvasRect = canvas.getBoundingClientRect();
  const tables = Array.from(canvas.querySelectorAll<HTMLElement>('.lab-table-item'));

  tables.forEach((item) => {
    const wrapper = item.querySelector<HTMLElement>('.data-table-wrapper');
    if (!wrapper) return;

    const ths = Array.from(wrapper.querySelectorAll<HTMLTableCellElement>('thead th[data-col-index]'));

    ths.forEach((th) => {
      if (th.dataset.fk === 'true') {
        const picker = th.querySelector<HTMLSelectElement>('.ref-picker');
        const targetName = picker?.value;
        if (targetName) {
          const targetTable = tables.find((candidate) => candidate.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() === targetName);
          if (targetTable) {
            const header = targetTable.querySelector<HTMLElement>('.lab-table-header');
            if (!header) return;

            const srcR = th.getBoundingClientRect();
            const trgR = header.getBoundingClientRect();

            const x1 = srcR.left + srcR.width - canvasRect.left;
            const y1 = srcR.top + srcR.height / 2 - canvasRect.top;
            const x2 = trgR.left - canvasRect.left;
            const y2 = trgR.top + trgR.height / 2 - canvasRect.top;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`);
            path.setAttribute('class', 'rel-line');
            svg?.appendChild(path);

            const card = th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim() || '1:N';
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', String((x1 + x2) / 2));
            label.setAttribute('y', String((y1 + y2) / 2 - 5));
            label.setAttribute('class', 'rel-label');
            label.setAttribute('text-anchor', 'middle');
            label.textContent = card;
            svg?.appendChild(label);
          }
        }
      }
    });
  });

  renderRelationshipsPanel(labId, collectRelationships(labId));
}
