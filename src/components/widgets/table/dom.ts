import { updateGraphStageBounds } from '../stage/index.ts';
import type { RenderLabTable, TableDefinition } from './types.ts';

export function renderCanvas(labId: string, tables: TableDefinition[], renderLabTable: RenderLabTable): void {
  const lab = document.getElementById(labId);
  const canvas = document.getElementById(`${labId}-canvas`);
  if (!lab || !canvas) return;

  const lessonId = lab.dataset.lessonId || '';
  const tablesHtml = tables.map((table, index) => renderLabTable(table, index, lessonId, tables)).join('');
  canvas.innerHTML = `
    <svg class="lab-svg-layer" id="${labId}-svg"></svg>
    ${tablesHtml}
  `;
  updateGraphStageBounds(`${labId}-stage`);
}

export { updateObservations } from './observationsView.ts';
export { updateRelationships } from './relationshipView.ts';
