// Widget Library API Export
// To add a new widget, copy `src/components/widgets/_template/index.ts`,
// rename it, and export its render/setup functions here.
export * from './tree/index.ts';
export * from './table/index.ts';
export * from './search/index.ts';
export * from './code/index.ts';
export * from './quiz/index.ts';
export * from './card/index.ts';
export * from './term/index.ts';
export * from './magic-table/index.ts';

import { setupInteractiveTables } from './table/index.ts';
import { setupSearchAnimations } from './search/index.ts';
import { setupTreeWidgetInteractivity } from './tree/index.ts';
import { setupMagicTableInteractivity } from './magic-table/index.ts';

const widgetInteractionSetups = [
  setupInteractiveTables,
  setupSearchAnimations,
  setupTreeWidgetInteractivity,
  setupMagicTableInteractivity,
];

// Global setup for all widget interactions
export function initWidgetInteractions() {
  widgetInteractionSetups.forEach((setup) => setup());
}
