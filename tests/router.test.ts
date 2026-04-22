import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { Router } from '../src/router.ts';

describe('Router', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'main-content';
    document.body.appendChild(container);

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
  });

  it('renders a static route into the container', async () => {
    const router = new Router();
    router.setContainer(container);
    router.on('/', () => '<h1>Home</h1>');

    window.location.hash = '';
    router.handleRoute();
    await vi.advanceTimersByTimeAsync(200);

    expect(container.innerHTML).toContain('Home');
  });

  it('passes params to dynamic routes', async () => {
    const router = new Router();
    router.setContainer(container);

    let receivedId = '';
    router.on('/module/:id', (params) => {
      receivedId = params.id;
      return `<h1>${params.id}</h1>`;
    });

    window.location.hash = '#/module/dns';
    router.handleRoute();
    await vi.advanceTimersByTimeAsync(200);

    expect(receivedId).toBe('dns');
    expect(container.innerHTML).toContain('dns');
  });
});
