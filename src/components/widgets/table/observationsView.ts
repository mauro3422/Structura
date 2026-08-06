import { TableLabAnalyzer } from './analyzer.ts';
import { updateLabFeedbackSummary } from './feedback.ts';
import { getLabState as readLabState } from './reader.ts';
import { renderObservationsPanel } from './panels.ts';
import type { TableObservation } from './types.ts';

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

function applyObservationMarks(labId: string, observations: TableObservation[]): void {
  const lab = document.getElementById(labId);
  if (!lab) return;

  clearObservationMarks(labId);

  const tableItems = Array.from(lab.querySelectorAll<HTMLElement>('.lab-table-item'));

  const resolveTargets = (observation: TableObservation): HTMLElement[] => {
    if (observation.tableIds && observation.tableIds.length > 0) {
      return observation.tableIds
        .map((tableId) => tableItems.find((item) => item.dataset.tableId === tableId))
        .filter((item): item is HTMLElement => Boolean(item));
    }

    if (observation.tableId) {
      const byId = tableItems.find((item) => item.dataset.tableId === observation.tableId);
      if (byId) return [byId];
    }

    if (observation.tableName) {
      return tableItems.filter((item) => item.querySelector<HTMLElement>('.table-name-display')?.textContent?.trim() === observation.tableName);
    }

    return [];
  };

  observations.forEach((observation) => {
    const targets = resolveTargets(observation);

    targets.forEach((item) => {
      markTableObserved(item, observation.kind);
      markTableNameObserved(item, observation.kind);

      if (typeof observation.columnIndex === 'number') {
        const header = item.querySelectorAll<HTMLElement>('.data-table__header-cell')[observation.columnIndex];
        if (header) {
          markColumnObserved(header, observation.kind);
        }
      }
    });
  });
}

export function updateObservations(labId: string): void {
  const analyzer = new TableLabAnalyzer(readLabState(labId));
  const observations = analyzer.getObservations();
  updateLabFeedbackSummary(labId, {
    observationCount: observations.length,
    observationWarningCount: observations.filter((item) => item.kind === 'warning').length,
    observationErrorCount: observations.filter((item) => item.kind === 'error').length,
  });
  applyObservationMarks(labId, observations);
  renderObservationsPanel(labId, observations);
}
