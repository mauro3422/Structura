import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultLabTable } from '../src/components/widgets/table/markup.ts';
import { renderTableLaboratory } from '../src/components/widgets/table/renderers.ts';
import { setupInteractiveTables } from '../src/components/widgets/table/index.ts';

describe('Table interactions', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main-content"></main>';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a new table from the laboratory toolbar', async () => {
    const main = document.getElementById('main-content') as HTMLElement;
    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [createDefaultLabTable()],
      },
      0,
      'lesson-1',
    );

    setupInteractiveTables();

    expect(main.querySelectorAll('.lab-table-item')).toHaveLength(1);

    document.querySelector<HTMLButtonElement>('#table-lab-lesson-1-add-table')?.click();
    await vi.runAllTimersAsync();

    expect(main.querySelectorAll('.lab-table-item').length).toBeGreaterThan(1);
    expect(main.textContent).toContain('NuevaTabla_2');
  });
});
