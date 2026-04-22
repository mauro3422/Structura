export { renderTableExample, renderInteractiveTable, renderTableLaboratory, renderLabTable } from './renderers.js';
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
} from './markup.js';
export {
  getLabState,
  resolveLabTables,
  syncLabState,
  renderCanvas,
  updateRelationships,
  runValidation,
  showStatus,
  mutateLabState,
} from './state.js';
import { renderLabTable } from './renderers.js';
import { setupInteractiveTables as setupTableInteractions } from './interactions.js';

export function setupInteractiveTables() {
  setupTableInteractions(renderLabTable);
}
