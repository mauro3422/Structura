import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/app/mermaid.ts', () => ({
  initializeMermaid: vi.fn(),
  renderMermaidDiagrams: vi.fn(),
}));

vi.mock('../src/app/interactions/index.ts', () => ({
  bindInteractions: vi.fn(),
}));

import { initApp } from '../src/app/bootstrap.ts';

describe('App smoke flow', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.useFakeTimers();
    vi.stubGlobal('scrollTo', vi.fn());
    vi.stubGlobal(
      'requestAnimationFrame',
      ((callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      }) as typeof requestAnimationFrame,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('boots and navigates to a lesson route', async () => {
    window.location.hash = '#/lesson/direcciones-ip';

    initApp();
    await vi.runAllTimersAsync();

    const main = document.getElementById('main-content');
    expect(main?.innerHTML).toContain('page-lesson-direcciones-ip');
    expect(main?.innerHTML).toContain('lesson-content');
    expect(document.querySelector('.navbar')).toBeTruthy();
  });
});
