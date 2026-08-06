export { renderTableExample, renderInteractiveTable, renderTableLaboratory, renderLabTable } from './renderers.ts';
export {
  createDefaultLabTable,
  createDefaultLabTables,
} from './defaults.ts';
export {
  renderTableCaption,
  renderStaticHeaderCell,
  renderInteractiveHeaderCell,
  renderStaticRows,
  renderInteractiveRows,
  renderAddColumnHeader,
  renderAddRowButton,
  renderLabTableToolbar,
  renderLabTableWarning,
} from './markup.ts';
export {
  getLabState,
  resolveLabTables,
  syncLabState,
  renderCanvas,
  updateRelationships,
  mutateLabState,
} from './state.ts';
export { runValidation } from './validation.ts';
export { showStatus } from './feedback.ts';
import { renderLabTable } from './renderers.ts';
import { setupInteractiveTables as setupTableInteractions } from './interactions.ts';
import { setupGraphNodeDragging, setupGraphViewports, updateGraphStageBounds } from '../stage/index.ts';

function refreshGraphStageBounds(): void {
  document.querySelectorAll<HTMLElement>('[data-graph-stage]').forEach((stage) => {
    updateGraphStageBounds(stage.id);
  });
}

export function setupInteractiveTables() {
  setupTableInteractions(renderLabTable);
  refreshGraphStageBounds();
  setupGraphViewports();
  setupGraphNodeDragging();
  queueMicrotask(refreshGraphStageBounds);
}
