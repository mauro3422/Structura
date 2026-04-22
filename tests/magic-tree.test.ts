import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { renderMagicTable } from '../src/components/widgets/magic-table/renderer.ts';
import { setupMagicTableInteractivity } from '../src/components/widgets/magic-table/interactions.ts';
import { renderTreeWidget } from '../src/components/widgets/tree/renderer.ts';
import { setupTreeWidgetInteractivity } from '../src/components/widgets/tree/interactions.ts';

describe('Magic table and tree widgets', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
    vi.stubGlobal('scrollTo', vi.fn());
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal('requestAnimationFrame', ((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    }) as typeof requestAnimationFrame);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    window.magicTableListenerBound = false;
  });

  it('renders the magic table frame with metadata and headers', () => {
    const html = renderMagicTable(
      {
        type: 'magic-table',
        tableName: 'Usuarios',
        columns: [{ name: 'ID', type: 'INT' }],
        rows: [['1']],
        definition: 'Una tabla simple',
        interactive: true,
        narrative: false,
      },
      0,
      'lesson-1',
    );

    expect(html).toContain('magic-table-lesson-1-0');
    expect(html).toContain('data-table-name="Usuarios"');
    expect(html).toContain('magic-table-card');
    expect(html).toContain('magic-table-struct');
  });

  it('advances magic table evolution when a node is clicked', () => {
    document.body.innerHTML = `
      <div class="magic-table-card" data-table-name="Usuarios" data-evolution-state="0">
        <button class="node-evolution" data-evolution="2"></button>
      </div>
    `;

    setupMagicTableInteractivity();

    document.querySelector<HTMLButtonElement>('.node-evolution')?.click();

    const card = document.querySelector<HTMLElement>('.magic-table-card');
    expect(card?.dataset.evolutionState).toBe('2');
    expect(card?.classList.contains('show-frame')).toBe(true);
    expect(card?.classList.contains('show-headers')).toBe(true);
  });

  it('renders a tree widget body with visible nodes', () => {
    const html = renderTreeWidget(
      {
        type: 'timeline',
        events: [
          { year: '1990', title: 'Inicio', description: 'Primero' },
          { year: '2000', title: 'Crecimiento', description: 'Segundo' },
        ],
      },
      0,
    );

    expect(html).toContain('interactive-tree');
    expect(html).toContain('tree-node');
    expect(html).toContain('tree-hint');
  });

  it('reveals the next tree node when its icon button is clicked', async () => {
    document.body.innerHTML = `
      <div class="interactive-tree">
        <div class="tree-node visible focused" data-index="0">
          <div class="tree-content">
            <button class="tree-icon-btn" data-target="1"><span class="tree-icon">A</span></button>
          </div>
        </div>
        <div class="tree-node" data-index="1">
          <div class="tree-content">
            <button class="tree-icon-btn" data-target="2"><span class="tree-icon">B</span></button>
          </div>
        </div>
        <div class="tree-node" data-index="2">
          <div class="tree-content">
            <button class="tree-icon-btn" data-target="3"><span class="tree-icon">C</span></button>
          </div>
        </div>
        <div class="tree-node" data-index="3">
          <div class="tree-content">
            <button class="tree-icon-btn" data-target="0"><span class="tree-icon">D</span></button>
          </div>
        </div>
      </div>
    `;

    setupTreeWidgetInteractivity();

    const nextButton = document.querySelectorAll<HTMLButtonElement>('.tree-icon-btn')[0];
    nextButton.click();
    await vi.runAllTimersAsync();

    const nextNode = document.querySelector<HTMLElement>('.tree-node[data-index="1"]');
    expect(nextNode?.classList.contains('visible')).toBe(true);
    expect(nextNode?.classList.contains('focused')).toBe(true);
  });
});
