import { escapeHtml } from '../Utils.ts';
import type { RenderLabTable, TableDefinition, TableObservation, TableRelationship } from './types.ts';

interface RelationshipRecord {
  sourceTableId: string;
  sourceTable: string;
  sourceColumn: string;
  targetTableId: string;
  targetTable: string;
  cardinality: string;
  sourceRole: string;
  targetRole: string;
  sourceIsPk: boolean;
  targetExists: boolean;
}

export function getLabState(labId: string): TableDefinition[] {
  const lab = document.getElementById(labId);
  if (!lab) return [];
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!canvas) return [];

  return Array.from(canvas.querySelectorAll<HTMLElement>('.lab-table-item')).map((item) => {
    const tableId = item.dataset.tableId || '';
    const tableName = item.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() || '';
    const wrapper = item.querySelector<HTMLElement>('.data-table-wrapper');
    if (!wrapper) {
      return { tableId, tableName, columns: [], rows: [] };
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

    return { tableId, tableName, columns, rows };
  });
}

export function renderCanvas(labId: string, tables: TableDefinition[], renderLabTable: RenderLabTable): void {
  const lab = document.getElementById(labId);
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!lab || !canvas) return;

  const lessonId = lab.dataset.lessonId || '';
  canvas.innerHTML = tables.map((table, index) => renderLabTable(table, index, lessonId, tables)).join('');
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

function getTableId(item: HTMLElement): string {
  return item.dataset.tableId || '';
}

function getTableName(item: HTMLElement): string {
  return item.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() || '';
}

function getCardinality(th: HTMLElement): string {
  return normalizeCardinality(th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim());
}

function collectRelationshipRecords(labId: string): RelationshipRecord[] {
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!canvas) return [];

  const tables = Array.from(canvas.querySelectorAll<HTMLElement>('.lab-table-item'));
  const tablesById = new Map(
    tables
      .map((item) => [getTableId(item), item] as const)
      .filter(([id]) => Boolean(id)),
  );

  const records: RelationshipRecord[] = [];

  tables.forEach((item) => {
    const sourceTableId = getTableId(item);
    const sourceTable = getTableName(item);
    const wrapper = item.querySelector<HTMLElement>('.data-table-wrapper');
    if (!wrapper) return;

    Array.from(wrapper.querySelectorAll<HTMLTableCellElement>('thead th[data-col-index]')).forEach((th) => {
      if (th.dataset.fk !== 'true') return;

      const sourceColumn = th.querySelector<HTMLElement>('.col-name-editable')?.textContent?.trim() || 'Columna';
      const targetTableId = th.querySelector<HTMLSelectElement>('.ref-picker')?.value?.trim() || '';
      const targetItem = tablesById.get(targetTableId);
      const targetTable = targetItem?.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() || targetTableId;
      const sourceIsPk = th.dataset.pk === 'true';
      const cardinality = getCardinality(th);
      const roles = describeRoles(cardinality);

      records.push({
        sourceTableId,
        sourceTable,
        sourceColumn,
        targetTableId,
        targetTable,
        cardinality,
        sourceRole: roles.sourceRole,
        targetRole: roles.targetRole,
        sourceIsPk,
        targetExists: Boolean(targetItem),
      });
    });
  });

  return records;
}

function clearObservationMarks(labId: string): void {
  const lab = document.getElementById(labId);
  if (!lab) return;

  lab.querySelectorAll<HTMLElement>('.lab-table-item').forEach((item) => {
    item.classList.remove('lab-table-item--observed-info', 'lab-table-item--observed-warning', 'lab-table-item--observed-error');
  });

  lab.querySelectorAll<HTMLElement>('.table-name-display').forEach((name) => {
    name.classList.remove('lab-table-name-observed', 'lab-table-name-observed--info', 'lab-table-name-observed--warning', 'lab-table-name-observed--error');
  });

  lab.querySelectorAll<HTMLElement>('.data-table__header-cell').forEach((th) => {
    th.classList.remove('lab-column-observed', 'lab-column-observed--info', 'lab-column-observed--warning', 'lab-column-observed--error');
  });
}

function markTableObserved(item: HTMLElement, kind: TableObservation['kind']): void {
  item.classList.add(`lab-table-item--observed-${kind}`);
}

function markTableNameObserved(item: HTMLElement, kind: TableObservation['kind']): void {
  const name = item.querySelector<HTMLElement>('.table-name-display');
  if (!name) return;
  name.classList.add('lab-table-name-observed', `lab-table-name-observed--${kind}`);
}

function markColumnObserved(th: HTMLElement, kind: TableObservation['kind']): void {
  th.classList.add('lab-column-observed', `lab-column-observed--${kind}`);
}

function isAcronym(value: string): boolean {
  return /^[A-Z0-9]{2,}$/.test(value);
}

function isCamelCaseLike(value: string): boolean {
  return /^[a-z][A-Za-z0-9]*$/.test(value);
}

function isSnakeCaseLike(value: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(value);
}

function shouldSuggestCamelCase(value: string): boolean {
  if (!value || isAcronym(value) || isCamelCaseLike(value) || isSnakeCaseLike(value)) {
    return false;
  }

  return /[\s-]/.test(value) || /[A-Z]/.test(value) || /[^A-Za-z0-9_]/.test(value);
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

  clearObservationMarks(labId);

  const tables = Array.from(canvas.querySelectorAll<HTMLElement>('.lab-table-item'));
  const observations: TableObservation[] = [];
  const tableNames = new Map<string, number>();
  const tableItemsByName = new Map<string, HTMLElement[]>();

  tables.forEach((item) => {
    const tableName = item.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() || '';
    if (!tableName) {
      observations.push({
        kind: 'error',
        title: 'Nombre de tabla vacío',
        message: 'Cada tabla debería tener un nombre visible.',
        hint: 'Poné un nombre corto y claro, por ejemplo clientes o pedidos.',
        subject: 'Tabla sin nombre',
      });
      markTableObserved(item, 'error');
      markTableNameObserved(item, 'error');
    } else {
      tableNames.set(tableName, (tableNames.get(tableName) || 0) + 1);
      const list = tableItemsByName.get(tableName) || [];
      list.push(item);
      tableItemsByName.set(tableName, list);
    }

    const wrapper = item.querySelector<HTMLElement>('.data-table-wrapper');
    if (!wrapper) return;

    const columns = Array.from(wrapper.querySelectorAll<HTMLTableCellElement>('thead th[data-col-index]'));
    const seenColumns = new Set<string>();
    let hasPk = false;
    let pkCount = 0;
    const fkTargets = new Set<string>();
    const fkColumns: string[] = [];

    columns.forEach((th) => {
      const colName = th.querySelector<HTMLElement>('.col-name-editable')?.textContent?.trim() || '';
      const isPk = th.dataset.pk === 'true';
      const isFk = th.dataset.fk === 'true';
      const targetTable = th.querySelector<HTMLSelectElement>('.ref-picker')?.value?.trim() || '';
      const cardinality = normalizeCardinality(th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim());
      const sourceIsPk = isPk;

      if (isPk) {
        hasPk = true;
        pkCount += 1;
      }

      if (colName) {
        if (seenColumns.has(colName)) {
          observations.push({
            kind: 'error',
            title: 'Columna duplicada',
            message: `La columna "${colName}" se repite dentro de la misma tabla.`,
            hint: 'Usá un nombre único para cada campo.',
            subject: colName,
          });
          markColumnObserved(th, 'error');
        }
        seenColumns.add(colName);

        if (shouldSuggestCamelCase(colName)) {
          observations.push({
            kind: 'info',
            title: 'Sugerencia de nombre',
            message: `La columna "${colName}" se entiende, pero un formato uniforme facilita leer el modelo.`,
            hint: `Sugerencia: ${toCamelCase(colName)}`,
            subject: colName,
          });
          markColumnObserved(th, 'info');
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
        markColumnObserved(th, 'error');
      } else if (isFk && targetTable) {
        fkTargets.add(targetTable);
        fkColumns.push(colName || 'FK');
      }

      if (isFk && targetTable && cardinality === '1:1' && !sourceIsPk) {
        observations.push({
          kind: 'warning',
          title: '1:1 a revisar',
          message: `La relación "${colName || 'FK'} → ${targetTable}" parece 1:1, pero la FK no es PK.`,
          hint: 'Si querés 1:1 estricta, la FK debería ser única o compartir la PK.',
          subject: colName || undefined,
        });
        markColumnObserved(th, 'warning');
      }
    });

    if (fkColumns.length === 2 && fkTargets.size === 2) {
      const bridgeTargets = Array.from(fkTargets);
      observations.push({
        kind: 'info',
        title: 'Tabla puente candidata',
        message: `La tabla "${tableName || 'sin nombre'}" conecta ${bridgeTargets[0]} y ${bridgeTargets[1]}.`,
        hint: 'Esto suele representar una relacion N:N a traves de una tabla intermedia.',
        subject: tableName || undefined,
      });
      markTableObserved(item, 'info');
      markTableNameObserved(item, 'info');
    }

    if (pkCount > 1) {
      observations.push({
        kind: 'info',
        title: 'Clave primaria compuesta',
        message: `La tabla "${tableName || 'sin nombre'}" usa ${pkCount} columnas como PK.`,
        hint: 'Eso puede ser valido si la identidad real depende de mas de una columna.',
        subject: tableName || undefined,
      });
      markTableObserved(item, 'info');
      markTableNameObserved(item, 'info');
    }

    if (!hasPk) {
      observations.push({
        kind: 'warning',
        title: 'Falta clave primaria',
        message: `La tabla "${tableName || 'sin nombre'}" no tiene PK marcada.`,
        hint: 'Una tabla base normalmente debería tener una clave primaria.',
        subject: tableName || undefined,
      });
      markTableObserved(item, 'warning');
      markTableNameObserved(item, 'warning');
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
      tableItemsByName.get(name)?.forEach((item) => {
        markTableObserved(item, 'error');
        markTableNameObserved(item, 'error');
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

function deriveManyToManyRelationships(records: RelationshipRecord[]): TableRelationship[] {
  const recordsBySource = new Map<string, RelationshipRecord[]>();

  records.forEach((record) => {
    if (!record.targetExists || !record.targetTableId) return;
    const list = recordsBySource.get(record.sourceTableId) || [];
    list.push(record);
    recordsBySource.set(record.sourceTableId, list);
  });

  const derived: TableRelationship[] = [];

  recordsBySource.forEach((sourceRecords) => {
    const uniqueTargets = Array.from(
      sourceRecords.reduce((map, record) => map.set(record.targetTableId, record), new Map<string, RelationshipRecord>()).values(),
    );

    if (sourceRecords.length !== 2 || uniqueTargets.length !== 2) {
      return;
    }

    const [left, right] = uniqueTargets;
    const bridgeTable = left.sourceTable;
    const bridgeLabel = bridgeTable || 'Tabla puente';

    derived.push({
      relationshipKind: 'derived',
      sourceTable: left.targetTable,
      sourceColumn: 'Relación puente',
      targetTable: right.targetTable,
      bridgeTable: bridgeLabel,
      cardinality: 'N:N',
      sourceRole: 'N',
      targetRole: 'N',
      status: 'derived',
      message: `N:N inferida vía ${bridgeLabel}. La tabla puente conecta ambos lados.`,
    });
  });

  return derived;
}

function collectRelationships(labId: string): TableRelationship[] {
  const records = collectRelationshipRecords(labId);
  const directRelationships = records.map((record) => {
    if (!record.targetTableId) {
      return {
        relationshipKind: 'direct',
        sourceTable: record.sourceTable,
        sourceColumn: record.sourceColumn,
        targetTable: 'Sin destino',
        cardinality: record.cardinality,
        sourceRole: 'Origen',
        targetRole: 'Pendiente',
        status: 'missing-reference',
        message: 'Relacion invalida: falta una tabla destino para cerrar el enlace.',
      } satisfies TableRelationship;
    }

    const caution = record.targetExists && record.cardinality === '1:1' && !record.sourceIsPk;

    return {
      relationshipKind: 'direct',
      sourceTable: record.sourceTable,
      sourceColumn: record.sourceColumn,
      targetTable: record.targetTable,
      cardinality: record.cardinality,
      sourceRole: record.sourceRole,
      targetRole: record.targetRole,
      status: record.targetExists ? (caution ? 'caution' : 'linked') : 'missing-target',
      message: record.targetExists
        ? record.cardinality === '1:1'
          ? caution
            ? '1:1 detectada. Para que sea estricta, conviene que la FK sea unica o compartida con la PK.'
            : '1:1 detectada. La tabla destino funciona como referencia principal.'
          : '1:N detectada. La tabla destino actua como maestra y la actual como detalle. Repetir la misma FK en varias filas es normal.'
        : 'Relacion invalida: la tabla destino no esta disponible en el laboratorio.',
    } satisfies TableRelationship;
  });

  return [...directRelationships, ...deriveManyToManyRelationships(records)];
}

function renderRelationshipItem(item: TableRelationship): string {
  const stateLabel =
    item.status === 'linked'
      ? 'OK'
      : item.status === 'derived'
        ? 'N:N inferida'
        : item.status === 'caution'
          ? 'Revisar'
          : item.status === 'missing-target'
            ? 'Destino ausente'
            : 'Falta destino';

  const pairLabel =
    item.relationshipKind === 'derived'
      ? `${item.sourceTable} ↔ ${item.targetTable}`
      : `${item.sourceTable}.${item.sourceColumn} → ${item.targetTable}`;

  return `
    <div class="lab-relation-item lab-relation-item--${item.status} lab-relation-item--${item.relationshipKind}">
      <div class="lab-relation-item__top">
        <span class="lab-relation-item__pair">${escapeHtml(pairLabel)}</span>
        <span class="lab-relation-item__badge">${escapeHtml(item.cardinality)}</span>
      </div>
      ${item.bridgeTable ? `<div class="lab-relation-item__bridge">Vía ${escapeHtml(item.bridgeTable)}</div>` : ''}
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

function renderRelationshipGroup(title: string, items: TableRelationship[]): string {
  if (items.length === 0) return '';

  return `
    <section class="lab-relations-group">
      <div class="lab-relations-group__title">${escapeHtml(title)}</div>
      <div class="lab-relations-list">
        ${items.map((item) => renderRelationshipItem(item)).join('')}
      </div>
    </section>
  `;
}

export function renderRelationshipsPanel(labId: string, relationships: TableRelationship[]): void {
  const panel = document.getElementById(`${labId}-relations`); 
  if (!panel) return;

  const directRelationships = relationships.filter((item) => item.relationshipKind === 'direct');
  const derivedRelationships = relationships.filter((item) => item.relationshipKind === 'derived');
  const linkedCount = relationships.filter((item) => item.status === 'linked' || item.status === 'derived').length;
  const derivedCount = relationships.filter((item) => item.status === 'derived').length;
  const cautionCount = relationships.filter((item) => item.status === 'caution').length;
  const missingCount = relationships.length - linkedCount - cautionCount;

  panel.innerHTML = `
    <div class="lab-relations-panel__header">
      <div>
        <div class="lab-relations-panel__title">Panel de relaciones</div>
        <div class="lab-relations-panel__subtitle">Detecta FKs, destinos, cardinalidad, N:N y rol sugerido</div>
      </div>
      <div class="lab-relations-panel__stats">
        <span class="lab-relations-panel__chip">${relationships.length} total</span>
        <span class="lab-relations-panel__chip is-ok">${directRelationships.length} directas</span>
        <span class="lab-relations-panel__chip ${missingCount > 0 || cautionCount > 0 ? 'is-warning' : 'is-ok'}">${linkedCount} vinculadas</span>
        ${derivedCount > 0 ? `<span class="lab-relations-panel__chip is-derived">${derivedCount} N:N</span>` : ''}
        ${cautionCount > 0 ? `<span class="lab-relations-panel__chip is-warning">${cautionCount} a revisar</span>` : ''}
      </div>
    </div>
    ${
      relationships.length > 0
        ? `
          ${renderRelationshipGroup('Relaciones directas', directRelationships)}
          ${renderRelationshipGroup('Relaciones derivadas', derivedRelationships)}
        `
        : `
          <div class="lab-relations-empty">
            No hay relaciones definidas todavia. Marca una columna como FK y elige su tabla destino para empezar. Si una tabla conecta dos FKs distintas, el laboratorio la puede interpretar como puente.
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
        const targetId = picker?.value;
        if (targetId) {
          const targetTable = tables.find((candidate) => candidate.dataset.tableId === targetId);
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
