import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { renderSearchAnimation, setupSearchAnimations } from '../src/components/widgets/search/renderer.ts';

describe('Search interactions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs a linear search from the play button', async () => {
    document.body.innerHTML = renderSearchAnimation(
      {
        type: 'search-animation',
        algorithm: 'linear',
        data: [1, 2, 3],
        target: 2,
      },
      0,
      'lesson-1',
    );

    setupSearchAnimations();

    document.querySelector<HTMLButtonElement>('#search-anim-lesson-1-0-play')?.click();
    await vi.runAllTimersAsync();

    expect(document.querySelector('#search-anim-lesson-1-0-cell-1')?.className).toContain('search-cell--found');
    expect(document.querySelector('#search-anim-lesson-1-0-status')?.textContent).toContain('Encontrado en la posición 1');
  });
});
