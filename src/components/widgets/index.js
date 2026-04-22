// Widget Library API Export
// To add a new widget, copy `src/components/widgets/_template/index.js`,
// rename it, and export its render/setup functions here.
export * from './TreeWidget.js';
export * from './TableWidget.js';
export * from './SearchWidget.js';
export * from './CodeWidget.js';
export * from './QuizWidget.js';
export * from './CardWidget.js';
export * from './TermWidget.js';
export * from './MagicTableWidget.js';

import { setupInteractiveTables } from './TableWidget.js';
import { setupSearchAnimations } from './SearchWidget.js';
import { setupTreeWidgetInteractivity } from './TreeWidget.js';
import { setupMagicTableInteractivity } from './MagicTableWidget.js';

const widgetInteractionSetups = [
  setupInteractiveTables,
  setupSearchAnimations,
  setupTreeWidgetInteractivity,
  setupMagicTableInteractivity,
];

// Global setup for all widget interactions
export function initWidgetInteractions() {
  widgetInteractionSetups.forEach(setup => setup());
}
