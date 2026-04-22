import { createDefaultLabTables } from './markup.ts';
import type { RenderLabTable, TableDefinition, TableSection } from './types.ts';

export function getDefaultLabTables(): TableDefinition[] {
  return createDefaultLabTables();
}

export function resolveLabTables(section: TableSection, lessonId: string): TableDefinition[] {
  if (typeof localStorage === 'undefined') {
    return section.initialTables && section.initialTables.length > 0
      ? section.initialTables
      : getDefaultLabTables();
  }

  try {
    const saved = localStorage.getItem(`datalab_lab_${lessonId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultLabTables();
    }
  } catch (error) {
    // Fall back to the lesson-provided data or the default starter table.
  }

  return section.initialTables && section.initialTables.length > 0
    ? section.initialTables
    : getDefaultLabTables();
}

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
        const references = (th.querySelector<HTMLSelectElement>('.ref-picker')?.value) || null;
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

export function syncLabState(labId: string, tables: TableDefinition[]): void {
  const lab = document.getElementById(labId);
  if (!lab) return;
  const lessonId = lab.dataset.lessonId || '';

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`datalab_lab_${lessonId}`, JSON.stringify(tables));
  }

  const indicator = lab.querySelector<HTMLElement>('.lab-autosave-indicator');
  if (indicator) {
    indicator.textContent = 'Guardado';
    clearTimeout(lab._autosaveStatusTimer);
    lab._autosaveStatusTimer = setTimeout(() => {
      indicator.textContent = 'Guardado automático';
    }, 1200);
  }

  runValidation(labId);
}

export function mutateLabState(
  labId: string,
  renderLabTable: RenderLabTable,
  mutator: (tables: TableDefinition[]) => boolean | void,
): TableDefinition[] {
  const tables = getLabState(labId);
  const result = mutator(tables);
  if (result === false) return tables;
  renderCanvas(labId, tables, renderLabTable);
  syncLabState(labId, tables);
  return tables;
}

export function renderCanvas(labId: string, tables: TableDefinition[], renderLabTable: RenderLabTable): void {
  const lab = document.getElementById(labId);
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!lab || !canvas) return;

  const lessonId = lab.dataset.lessonId || '';
  canvas.innerHTML = tables.map((table, index) => renderLabTable(table, index, lessonId, tables)).join('');
  updateRelationships(labId);
}

export function updateRelationships(labId: string): void {
  const svg = document.getElementById(`${labId}-svg`) as SVGSVGElement | null;
  const canvas = document.getElementById(`${labId}-canvas`) as HTMLElement | null;
  if (!svg || !canvas) return;

  svg.innerHTML = '';
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
            svg.appendChild(path);

            const card = th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim() || '1:N';
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', String((x1 + x2) / 2));
            label.setAttribute('y', String((y1 + y2) / 2 - 5));
            label.setAttribute('class', 'rel-label');
            label.setAttribute('text-anchor', 'middle');
            label.textContent = card;
            svg.appendChild(label);
          }
        }
      }
    });
  });
}

export function runValidation(labId: string): void {
  const lab = document.getElementById(labId);
  if (!lab) return;

  lab.querySelectorAll<HTMLElement>('.lab-table-item').forEach((item) => {
    const pks = item.querySelectorAll('.meta-toggle[data-action="toggle-pk"].active');
    const warning = item.querySelector<HTMLElement>('.lab-table-warning');
    if (warning) {
      if (pks.length === 0) warning.classList.add('visible');
      else warning.classList.remove('visible');
    }
  });

  updateRelationships(labId);
}

export function showStatus(labId: string, msg: string): void {
  const status = document.getElementById(`${labId}-status`) as HTMLElement | null;
  if (!status) return;
  status.textContent = msg;
  status.style.opacity = '1';
  status.style.transform = 'translateY(0)';
  setTimeout(() => {
    status.style.opacity = '0';
    status.style.transform = 'translateY(10px)';
  }, 2000);
}
