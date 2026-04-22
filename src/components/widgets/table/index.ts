export { renderTableExample, renderInteractiveTable, renderTableLaboratory, renderLabTable } from './renderers.ts';
export {
  createDefaultLabTable,
  createDefaultLabTables,
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
  runValidation,
  showStatus,
  mutateLabState,
} from './state.ts';
import { renderLabTable } from './renderers.ts';
import { setupInteractiveTables as setupTableInteractions } from './interactions.ts';

export function setupInteractiveTables() {
  setupTableInteractions(renderLabTable);
}
