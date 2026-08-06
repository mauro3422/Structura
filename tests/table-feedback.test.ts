import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderTableLaboratory } from '../src/components/widgets/table/renderers.ts';
import { showStatus } from '../src/components/widgets/table/feedback.ts';
import { updateObservations } from '../src/components/widgets/table/observationsView.ts';
import { updateRelationships } from '../src/components/widgets/table/relationshipView.ts';

describe('Table feedback', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('keeps the compact feedback summary in sync with observations and relationships', () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [
          {
            tableId: 'users',
            tableName: 'Usuarios',
            columns: [
              { name: 'ID', type: 'INT', isPK: true, autoIncrement: true },
              { name: 'profile_id', type: 'INT', isFK: true, references: 'profiles', cardinality: '1:1' },
            ],
            rows: [[1, 10]],
          },
          {
            tableId: 'profiles',
            tableName: 'Perfiles',
            columns: [{ name: 'ID', type: 'INT', isPK: true, autoIncrement: true }],
            rows: [[10]],
          },
        ],
      },
      0,
      'lesson-feedback',
    );

    const labId = 'table-lab-lesson-feedback';

    updateObservations(labId);
    updateRelationships(labId);

    const feedback = document.getElementById(`${labId}-feedback`);
    expect(feedback).not.toBeNull();
    expect(feedback?.textContent).toContain('Pistas rápidas');
    expect(feedback?.textContent).toContain('avisos');
    expect(feedback?.textContent).toContain('relaciones');
    expect(feedback?.textContent).toContain('pendientes');
    expect(feedback?.className).toContain('is-updated');
    expect(feedback?.querySelector('.lab-feedback__banner')?.classList.contains('lab-feedback__banner--warning')).toBe(true);
  });

  it('shows a compact toast for status messages and removes it automatically', async () => {
    document.body.innerHTML = '<main id="main-content"></main>';
    const main = document.getElementById('main-content') as HTMLElement;

    main.innerHTML = renderTableLaboratory(
      {
        type: 'table-laboratory',
        initialTables: [],
      },
      0,
      'lesson-toast',
    );

    const labId = 'table-lab-lesson-toast';

    showStatus(labId, 'Tu trabajo quedó guardado.');

    const toast = document.querySelector(`#${labId}-toasts .lab-toast`);
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toContain('Guardado');
    expect(toast?.textContent).toContain('Tu trabajo quedó guardado.');

    await vi.advanceTimersByTimeAsync(3600);

    expect(document.querySelector(`#${labId}-toasts .lab-toast`)).toBeNull();
  });
});
