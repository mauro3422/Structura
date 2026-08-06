import { dispatchLabClick } from './commands.ts';
import { getLabState, mutateLabState, syncLabState, updateRelationships } from './state.ts';
import { runValidation } from './validation.ts';
import type { RenderLabTable } from './types.ts';

const autosaveTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
const resizeHandlers = new WeakMap<HTMLElement, () => void>();
const relationshipRefreshTimers = new WeakMap<HTMLElement, number>();
const scheduleFrame =
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0);
const cancelFrame =
  typeof window.cancelAnimationFrame === 'function'
    ? window.cancelAnimationFrame.bind(window)
    : (handle: number) => window.clearTimeout(handle);

function getTargetLab(target: HTMLElement): HTMLElement | null {
  return target.closest('.table-laboratory') as HTMLElement | null;
}

function scheduleAutosave(container: HTMLElement, labId: string): void {
  const previousTimer = autosaveTimers.get(container);
  if (previousTimer) clearTimeout(previousTimer);

  const timer = setTimeout(() => {
    syncLabState(labId, getLabState(labId));
    autosaveTimers.delete(container);
  }, 1000);

  autosaveTimers.set(container, timer);
}

function ensureResizeHandler(container: HTMLElement): void {
  if (resizeHandlers.has(container)) return;

  const handler = () => {
    document.querySelectorAll<HTMLElement>('.table-laboratory').forEach((lab) => updateRelationships(lab.id));
  };

  resizeHandlers.set(container, handler);
  window.addEventListener('resize', handler);
}

function handleTableHover(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const metaFk = target.closest('.meta-toggle.is-fk');
  if (!metaFk) return;

  const th = metaFk.closest('th');
  const tableItem = metaFk.closest('.lab-table-item') as HTMLElement;
  if (!th || !tableItem) return;

  const relId = `rel-${tableItem.dataset.tableId}-${th.dataset.colIndex}`;
  const path = document.querySelector(`[data-rel-id="${relId}"]`);
  if (path) path.classList.add('is-active');
}

function clearRelationshipHover(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const metaFk = target.closest('.meta-toggle.is-fk');
  if (!metaFk) return;

  document.querySelectorAll('.rel-line.is-active').forEach((path) => path.classList.remove('is-active'));
}

function scheduleRelationshipRefresh(labId: string): void {
  const lab = document.getElementById(labId);
  if (!lab) return;

  const previous = relationshipRefreshTimers.get(lab);
  if (previous) cancelFrame(previous);

  const next = scheduleFrame(() => {
    relationshipRefreshTimers.delete(lab);
    updateRelationships(labId);
  });

  relationshipRefreshTimers.set(lab, next);
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
      const handled = await dispatchLabClick(target, lab.id, renderLabTable);
      if (handled) return;

      if (target.hasAttribute('contenteditable')) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });

    container.addEventListener('mouseover', handleTableHover);
    container.addEventListener('mouseout', clearRelationshipHover);

    container.addEventListener('change', (event: Event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const lab = event.target.closest('.table-laboratory') as HTMLElement | null;
      if (lab) syncLabState(lab.id, getLabState(lab.id));
    });

    container.addEventListener('input', (event: Event) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.target.hasAttribute('contenteditable')) {
        const lab = event.target.closest('.table-laboratory') as HTMLElement | null;
        if (lab) scheduleAutosave(container, lab.id);
      }
    });

    container.addEventListener('graph-stage-node-move', (event: Event) => {
      const customEvent = event as CustomEvent<{ stageId?: string }>;
      const stageId = customEvent.detail?.stageId;
      if (!stageId) return;
      const labId = stageId.replace(/-stage$/, '');
      scheduleRelationshipRefresh(labId);
    });

    container.addEventListener('graph-stage-node-drop', (event: Event) => {
      const customEvent = event as CustomEvent<{ stageId?: string; nodeId?: string; x?: number; y?: number }>;
      const stageId = customEvent.detail?.stageId;
      const nodeId = customEvent.detail?.nodeId;
      const x = customEvent.detail?.x;
      const y = customEvent.detail?.y;
      if (!stageId || !nodeId || typeof x !== 'number' || typeof y !== 'number') return;

      const labId = stageId.replace(/-stage$/, '');
      mutateLabState(labId, renderLabTable, (tables) => {
        const target = tables.find((table) => table.tableId === nodeId);
        if (!target) return false;
        target.x = Math.max(16, Math.round(x));
        target.y = Math.max(16, Math.round(y));
      });
      scheduleRelationshipRefresh(labId);
    });
  }

  const activeLab = container.querySelector<HTMLElement>('.table-laboratory');
  if (activeLab) {
    runValidation(activeLab.id);
    ensureResizeHandler(container);
  }
}
