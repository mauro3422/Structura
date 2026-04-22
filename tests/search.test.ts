import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { runBinarySearch, runLinearSearch } from '../src/components/widgets/search/logic.ts';
import { renderSearchAnimation } from '../src/components/widgets/search/renderer.ts';

describe('Search widgets', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a search animation block with stable metadata', () => {
    const html = renderSearchAnimation(
      {
        type: 'search-animation',
        algorithm: 'linear',
        data: [1, 2, 3],
        target: 2,
      },
      0,
      'lesson-1',
    );

    expect(html).toContain('search-anim-lesson-1-0');
    expect(html).toContain('data-algorithm="linear"');
    expect(html).toContain('Buscando: 2');
    expect(html).toContain('Tocá "Iniciar" para ver el algoritmo en acción');
  });

  it('marks the found cell during linear search', async () => {
    const animId = 'search-anim-test';
    document.body.innerHTML = `
      <div>
        <div id="${animId}-cell-0" class="search-cell">1</div>
        <div id="${animId}-cell-1" class="search-cell">2</div>
        <div id="${animId}-cell-2" class="search-cell">3</div>
        <div id="${animId}-status"></div>
      </div>
    `;

    const status = document.getElementById(`${animId}-status`);
    const promise = runLinearSearch(animId, [1, 2, 3], 2, status);
    await vi.advanceTimersByTimeAsync(1200);
    await promise;

    expect(document.getElementById(`${animId}-cell-1`)?.className).toContain('search-cell--found');
    expect(status?.textContent).toContain('Encontrado en la posición 1');
  });

  it('marks the found cell during binary search', async () => {
    const animId = 'search-anim-binary';
    document.body.innerHTML = `
      <div>
        <div id="${animId}-cell-0" class="search-cell">1</div>
        <div id="${animId}-cell-1" class="search-cell">3</div>
        <div id="${animId}-cell-2" class="search-cell">5</div>
        <div id="${animId}-cell-3" class="search-cell">7</div>
        <div id="${animId}-status"></div>
      </div>
    `;

    const status = document.getElementById(`${animId}-status`);
    const promise = runBinarySearch(animId, [1, 3, 5, 7], 5, status);
    await vi.runAllTimersAsync();
    await promise;

    expect(document.getElementById(`${animId}-cell-2`)?.className).toContain('search-cell--found');
    expect(status?.textContent).toContain('Encontrado en la posición 2');
  });
});
