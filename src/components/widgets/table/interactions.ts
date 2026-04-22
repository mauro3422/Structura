import { showConfirm } from '../Utils.ts';
import { getLabState, mutateLabState, runValidation, showStatus, syncLabState, updateRelationships } from './state.ts';
import type { RenderLabTable, TableColumn } from './types.ts';

function updateLab(renderLabTable: RenderLabTable, labId: string, mutator: (tables: ReturnType<typeof getLabState>) => boolean | void): void {
  mutateLabState(labId, renderLabTable, mutator);
}

function getTargetLab(target: HTMLElement): HTMLElement | null {
  return target.closest('.table-laboratory') as HTMLElement | null;
}

export function setupInteractiveTables(renderLabTable: RenderLabTable): void {
  const container = document.getElementById('main-content');
  if (!container) return;

  const installListeners = container.dataset.labListenersBound !== 'true';
  if (installListeners) {
    container.dataset.labListenersBound = 'true';
  }

  if (installListeners) {
    container.addEventListener('click', async (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const target = event.target;
      const lab = getTargetLab(target);
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
            const tableItem = delTableBtn.closest('.lab-table-item') as HTMLElement | null;
            if (!tableItem) return;
            const ti = Number.parseInt(tableItem.dataset.index || '0', 10);
            tables.splice(ti, 1);
          });
        }
        return;
      }

      const tableItem = target.closest('.lab-table-item') as HTMLElement | null;
      if (tableItem) {
        const ti = Number.parseInt(tableItem.dataset.index || '0', 10);
        const tables = getLabState(labId);
        const table = tables[ti];
        if (!table) return;

        if (target.closest('.data-table__add-col')) {
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            liveTable.columns.push({ name: `Col_${liveTable.columns.length + 1}`, type: 'TEXT' });
            liveTable.rows.forEach((row) => row.push(''));
          });
          return;
        }

        const delColBtn = target.closest('.lab-col-delete');
        if (delColBtn) {
          const th = delColBtn.closest('th') as HTMLElement | null;
          if (!th) return;
          const ci = Number.parseInt(th.dataset.colIndex || '0', 10);
          const col = table.columns[ci];
          if (table.columns.length <= 1) {
            showStatus(labId, 'La tabla necesita al menos una columna');
            return;
          }
          if (
            col?.isPK &&
            !(await showConfirm(
              '¿Eliminar clave primaria?',
              'Esta columna identifica los registros. Si la eliminas, la tabla quedará sin PK hasta que marques otra.',
            ))
          ) {
            return;
          }
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            liveTable.columns.splice(ci, 1);
            liveTable.rows.forEach((row) => row.splice(ci, 1));
          });
          return;
        }

        if (target.closest('.data-table__add-row')) {
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            const newRow = liveTable.columns.map((column) => (column.autoIncrement ? (liveTable.rows.length + 1).toString() : ''));
            liveTable.rows.push(newRow);
          });
          return;
        }

        const delRowBtn = target.closest('.lab-row-delete');
        if (delRowBtn) {
          const tr = delRowBtn.closest('tr') as HTMLElement | null;
          if (!tr) return;
          const ri = Number.parseInt(tr.dataset.row || '0', 10);
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            liveTable.rows.splice(ri, 1);
          });
          return;
        }

        const meta = target.closest('.meta-toggle');
        if (meta) {
          event.preventDefault();
          const action = meta.getAttribute('data-action');
          const th = meta.closest('th') as HTMLElement | null;
          if (!th) return;
          const ci = Number.parseInt(th.dataset.colIndex || '0', 10);

          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            const col = liveTable.columns[ci] as TableColumn | undefined;
            if (!col) return;
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
          const th = cardBtn.closest('th') as HTMLElement | null;
          if (!th) return;
          const ci = Number.parseInt(th.dataset.colIndex || '0', 10);
          updateLab(renderLabTable, labId, (liveTables) => {
            const liveTable = liveTables[ti];
            const col = liveTable.columns[ci] as TableColumn | undefined;
            if (!col) return;
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

    container.addEventListener('change', (event: Event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const lab = event.target.closest('.table-laboratory') as HTMLElement | null;
      if (lab) syncLabState(lab.id, getLabState(lab.id));
    });

    container.addEventListener('input', (event: Event) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.target.hasAttribute('contenteditable')) {
        const lab = event.target.closest('.table-laboratory') as HTMLElement | null;
        if (lab) {
          clearTimeout(container._saveTo);
          container._saveTo = setTimeout(() => syncLabState(lab.id, getLabState(lab.id)), 1000);
        }
      }
    });
  }

  const activeLab = container.querySelector<HTMLElement>('.table-laboratory');
  if (activeLab) {
    runValidation(activeLab.id);
    requestAnimationFrame(() => updateRelationships(activeLab.id));
    if (!container._labResizeHandler) {
      container._labResizeHandler = () => {
        document.querySelectorAll<HTMLElement>('.table-laboratory').forEach((lab) => updateRelationships(lab.id));
      };
      window.addEventListener('resize', container._labResizeHandler);
    }
  }
}
