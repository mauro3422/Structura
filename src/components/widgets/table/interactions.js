import { showConfirm } from '../Utils.js';
import { getLabState, mutateLabState, runValidation, showStatus, syncLabState, updateRelationships } from './state.js';

function updateLab(renderLabTable, labId, mutator) {
  mutateLabState(labId, renderLabTable, mutator);
}

export function setupInteractiveTables(renderLabTable) {
  const container = document.getElementById('main-content');
  if (!container) return;

  const installListeners = container.dataset.labListenersBound !== 'true';
  if (installListeners) {
    container.dataset.labListenersBound = 'true';
  }

  if (installListeners) {
    container.addEventListener('click', async (e) => {
      const target = e.target;
      const lab = target.closest('.table-laboratory');
      if (!lab) return;
      const labId = lab.id;

      if (target.closest('[id$="-add-table"]')) {
        updateLab(renderLabTable, labId, (tables) => {
          tables.push({
            tableName: `NuevaTabla_${tables.length + 1}`,
            columns: [
              { name: 'ID', type: 'INT', isPK: true, autoIncrement: true },
              { name: 'C1', type: 'TEXT' },
            ],
            rows: [['1', '']],
          });
        });
        return;
      }

      const delTableBtn = target.closest('.lab-table-delete');
      if (delTableBtn) {
        if (await showConfirm('¿Eliminar tabla?', 'Se borrarán todos sus datos y columnas.')) {
          updateLab(renderLabTable, labId, (tables) => {
            const tableItem = delTableBtn.closest('.lab-table-item');
            const ti = parseInt(tableItem.dataset.index, 10);
            tables.splice(ti, 1);
          });
        }
        return;
      }

      const tableItem = target.closest('.lab-table-item');
      if (tableItem) {
        const ti = parseInt(tableItem.dataset.index, 10);
        const tables = getLabState(labId);
        const table = tables[ti];

        if (target.closest('.data-table__add-col')) {
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            liveTable.columns.push({ name: `Col_${liveTable.columns.length + 1}`, type: 'TEXT' });
            liveTable.rows.forEach(r => r.push(''));
          });
          return;
        }

        const delColBtn = target.closest('.lab-col-delete');
        if (delColBtn) {
          const th = delColBtn.closest('th');
          const ci = parseInt(th.dataset.colIndex, 10);
          const col = table.columns[ci];
          if (table.columns.length <= 1) {
            showStatus(labId, 'La tabla necesita al menos una columna');
            return;
          }
          if (col?.isPK && !(await showConfirm('¿Eliminar clave primaria?', 'Esta columna identifica los registros. Si la eliminas, la tabla quedará sin PK hasta que marques otra.'))) {
            return;
          }
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            liveTable.columns.splice(ci, 1);
            liveTable.rows.forEach(r => r.splice(ci, 1));
          });
          return;
        }

        if (target.closest('.data-table__add-row')) {
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            const newRow = liveTable.columns.map(c => c.autoIncrement ? (liveTable.rows.length + 1).toString() : '');
            liveTable.rows.push(newRow);
          });
          return;
        }

        const delRowBtn = target.closest('.lab-row-delete');
        if (delRowBtn) {
          const tr = delRowBtn.closest('tr');
          const ri = parseInt(tr.dataset.row, 10);
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            liveTable.rows.splice(ri, 1);
          });
          return;
        }

        const meta = target.closest('.meta-toggle');
        if (meta) {
          e.preventDefault();
          const action = meta.dataset.action;
          const th = meta.closest('th');
          const ci = parseInt(th.dataset.colIndex, 10);

          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            const col = liveTable.columns[ci];
            if (action === 'toggle-pk') {
              col.isPK = !col.isPK;
            } else if (action === 'toggle-fk') {
              col.isFK = !col.isFK;
            }
          });
          return;
        }

        const cardBtn = target.closest('.cardinality-toggle');
        if (cardBtn) {
          const th = cardBtn.closest('th');
          const ci = parseInt(th.dataset.colIndex, 10);
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            const col = liveTable.columns[ci];
            col.cardinality = col.cardinality === '1:1' ? '1:N' : '1:1';
          });
          return;
        }
      }

      if (target.closest('[id$="-save"]')) {
        syncLabState(labId, getLabState(labId));
        showStatus(labId, '✅ Guardado');
        return;
      }
    });

    container.addEventListener('change', (e) => {
      const lab = e.target.closest('.table-laboratory');
      if (lab) syncLabState(lab.id, getLabState(lab.id));
    });

    container.addEventListener('input', (e) => {
      if (e.target.hasAttribute('contenteditable')) {
        const lab = e.target.closest('.table-laboratory');
        if (lab) {
          clearTimeout(container._saveTo);
          container._saveTo = setTimeout(() => syncLabState(lab.id, getLabState(lab.id)), 1000);
        }
      }
    });
  }

  const activeLab = container.querySelector('.table-laboratory');
  if (activeLab) {
    runValidation(activeLab.id);
    requestAnimationFrame(() => updateRelationships(activeLab.id));
    if (!container._labResizeHandler) {
      container._labResizeHandler = () => {
        document.querySelectorAll('.table-laboratory').forEach(lab => updateRelationships(lab.id));
      };
      window.addEventListener('resize', container._labResizeHandler);
    }
  }
}
