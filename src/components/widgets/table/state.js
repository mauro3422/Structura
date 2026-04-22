import { createDefaultLabTables } from './markup.js';

export function getDefaultLabTables() {
  return createDefaultLabTables();
}

export function resolveLabTables(section, lessonId) {
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

export function getLabState(labId) {
  const lab = document.getElementById(labId);
  if (!lab) return [];
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!canvas) return [];

  return Array.from(canvas.querySelectorAll('.lab-table-item')).map(item => {
    const tableName = item.querySelector('.table-name-display')?.textContent.trim() || '';
    const wrapper = item.querySelector('.data-table-wrapper');

    const columns = Array.from(wrapper.querySelectorAll('thead th'))
      .filter(th => th.hasAttribute('data-col-index'))
      .map(th => {
        const name = th.querySelector('.col-name-editable')?.textContent.trim() || 'Col';
        const typeStr = th.querySelector('.col-type')?.textContent.trim() || 'TEXT';
        const autoIncrement = typeStr.includes('AUTO');
        const cleanType = typeStr.split(' ')[0].trim();
        const isPK = th.querySelector('[data-action="toggle-pk"]')?.classList.contains('active');
        const isFK = th.querySelector('[data-action="toggle-fk"]')?.classList.contains('active');
        const references = th.querySelector('.ref-picker')?.value || null;
        const cardinality = th.querySelector('.cardinality-toggle')?.textContent || '1:N';
        return { name, type: cleanType, autoIncrement, isPK, isFK, references, cardinality };
      });

    const rows = Array.from(wrapper.querySelectorAll('tbody tr')).map(tr => {
      return Array.from(tr.querySelectorAll('td[data-col]')).map(td => td.textContent.trim());
    });

    return { tableName, columns, rows };
  });
}

export function syncLabState(labId, tables) {
  const lab = document.getElementById(labId);
  if (!lab) return;
  const lessonId = lab.dataset.lessonId;

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`datalab_lab_${lessonId}`, JSON.stringify(tables));
  }

  const indicator = lab.querySelector('.lab-autosave-indicator');
  if (indicator) {
    indicator.textContent = 'Guardado';
    clearTimeout(lab._autosaveStatusTimer);
    lab._autosaveStatusTimer = setTimeout(() => {
      indicator.textContent = 'Guardado automático';
    }, 1200);
  }

  runValidation(labId);
}

export function mutateLabState(labId, renderLabTable, mutator) {
  const tables = getLabState(labId);
  const result = mutator(tables);
  if (result === false) return tables;
  renderCanvas(labId, tables, renderLabTable);
  syncLabState(labId, tables);
  return tables;
}

export function renderCanvas(labId, tables, renderLabTable) {
  const lab = document.getElementById(labId);
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!lab || !canvas) return;

  const lessonId = lab.dataset.lessonId;
  canvas.innerHTML = tables.map((t, i) => renderLabTable(t, i, lessonId, tables)).join('');
  updateRelationships(labId);
}

export function updateRelationships(labId) {
  const svg = document.getElementById(`${labId}-svg`);
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!svg || !canvas) return;

  svg.innerHTML = '';
  const canvasRect = canvas.getBoundingClientRect();
  const tables = Array.from(canvas.querySelectorAll('.lab-table-item'));

  tables.forEach((item) => {
    const wrapper = item.querySelector('.data-table-wrapper');
    const ths = Array.from(wrapper.querySelectorAll('thead th[data-col-index]'));

    ths.forEach((th) => {
      if (th.dataset.fk === 'true') {
        const picker = th.querySelector('.ref-picker');
        const targetName = picker?.value;
        if (targetName) {
          const targetTable = tables.find(t => t.querySelector('.table-name-display').textContent.trim() === targetName);
          if (targetTable) {
            const srcR = th.getBoundingClientRect();
            const trgR = targetTable.querySelector('.lab-table-header').getBoundingClientRect();

            const x1 = srcR.left + srcR.width - canvasRect.left;
            const y1 = srcR.top + srcR.height / 2 - canvasRect.top;
            const x2 = trgR.left - canvasRect.left;
            const y2 = trgR.top + trgR.height / 2 - canvasRect.top;

            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', `M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`);
            p.setAttribute('class', 'rel-line');
            svg.appendChild(p);

            const card = th.querySelector('.cardinality-toggle')?.textContent || '1:N';
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', (x1 + x2) / 2);
            t.setAttribute('y', (y1 + y2) / 2 - 5);
            t.setAttribute('class', 'rel-label');
            t.setAttribute('text-anchor', 'middle');
            t.textContent = card;
            svg.appendChild(t);
          }
        }
      }
    });
  });
}

export function runValidation(labId) {
  const lab = document.getElementById(labId);
  if (!lab) return;

  lab.querySelectorAll('.lab-table-item').forEach(item => {
    const pks = item.querySelectorAll('.meta-toggle[data-action="toggle-pk"].active');
    const warning = item.querySelector('.lab-table-warning');
    if (warning) {
      if (pks.length === 0) warning.classList.add('visible');
      else warning.classList.remove('visible');
    }
  });

  updateRelationships(labId);
}

export function showStatus(labId, msg) {
  const status = document.getElementById(`${labId}-status`);
  if (!status) return;
  status.textContent = msg;
  status.style.opacity = '1';
  status.style.transform = 'translateY(0)';
  setTimeout(() => {
    status.style.opacity = '0';
    status.style.transform = 'translateY(10px)';
  }, 2000);
}
