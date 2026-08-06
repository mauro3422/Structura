import {
  buildStageTransformString,
  computeAnchorZoomTransform,
  computeFitTransform,
  type StagePoint,
  type StageSize,
  type StageTransform,
} from './geometry.ts';

export interface StageViewportOptions {
  initialTransform?: Partial<StageTransform>;
  minScale?: number;
  maxScale?: number;
  wheelZoomStep?: number;
  fitPadding?: number;
  autoFit?: boolean;
}

export interface StageViewportController {
  getTransform(): StageTransform;
  setTransform(next: Partial<StageTransform>): void;
  zoomBy(factor: number, anchor?: StagePoint): void;
  panBy(dx: number, dy: number): void;
  reset(): void;
  fitToContent(): void;
  destroy(): void;
}

const controllers = new WeakMap<HTMLElement, StageViewportController>();
const scheduleFrame =
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0);

function readSize(element: HTMLElement): StageSize {
  return {
    width: element.offsetWidth || element.clientWidth || 0,
    height: element.offsetHeight || element.clientHeight || 0,
  };
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element
    ? Boolean(
        target.closest(
          'button, input, select, textarea, a, label, [contenteditable="true"], [data-viewport-ignore-pan="true"], [data-stage-drag-handle], [data-stage-node]',
        ),
      )
    : false;
}

function createTransform(state: StageTransform, surface: HTMLElement, zoomLabel?: HTMLElement | null): void {
  surface.style.transform = buildStageTransformString(state);
  surface.dataset.viewportScale = String(state.scale);
  surface.dataset.viewportX = String(state.x);
  surface.dataset.viewportY = String(state.y);

  if (zoomLabel) {
    zoomLabel.textContent = `${Math.round(state.scale * 100)}%`;
  }
}

export function createGraphViewportController(stage: HTMLElement, options: StageViewportOptions = {}): StageViewportController | null {
  const frame = stage.querySelector<HTMLElement>('.graph-stage__frame');
  const surface = stage.querySelector<HTMLElement>('.graph-stage__surface');
  if (!frame || !surface) return null;

  const zoomLabel = stage.querySelector<HTMLElement>('[data-viewport-zoom]');
  const limits = {
    minScale: options.minScale ?? 0.35,
    maxScale: options.maxScale ?? 2.5,
  };
  const wheelZoomStep = options.wheelZoomStep ?? 0.00125;
  const fitPadding = options.fitPadding ?? 72;

  const initialTransform: StageTransform = {
    x: options.initialTransform?.x ?? 0,
    y: options.initialTransform?.y ?? 0,
    scale: options.initialTransform?.scale ?? 1,
  };

  const state: StageTransform = { ...initialTransform };
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOrigin: StageTransform = { ...state };

  const apply = (next: Partial<StageTransform>) => {
    state.x = next.x ?? state.x;
    state.y = next.y ?? state.y;
    state.scale = next.scale ?? state.scale;
    createTransform(state, surface, zoomLabel);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    event.preventDefault();
    apply({
      x: dragOrigin.x + (event.clientX - dragStartX),
      y: dragOrigin.y + (event.clientY - dragStartY),
    });
  };

  const stopDragging = () => {
    dragging = false;
    frame.classList.remove('is-panning');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stopDragging);
    window.removeEventListener('pointercancel', stopDragging);
  };

  const startDragging = (event: PointerEvent) => {
    if (event.button !== 0 || isInteractiveTarget(event.target)) return;
    dragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragOrigin = { ...state };
    frame.classList.add('is-panning');
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
  };

  const zoomAt = (factor: number, anchor?: StagePoint) => {
    const frameRect = frame.getBoundingClientRect();
    const viewportAnchor = anchor || {
      x: frameRect.width / 2,
      y: frameRect.height / 2,
    };

    apply(
      computeAnchorZoomTransform(state, factor, viewportAnchor, limits),
    );
  };

  const onWheel = (event: WheelEvent) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();

    const frameRect = frame.getBoundingClientRect();
    const anchor = {
      x: event.clientX - frameRect.left,
      y: event.clientY - frameRect.top,
    };
    const factor = Math.exp(-event.deltaY * wheelZoomStep);
    zoomAt(factor, anchor);
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>('[data-viewport-action]');
    if (!button) return;

    const action = button.dataset.viewportAction;
    if (!action) return;

    event.preventDefault();

    if (action === 'zoom-in') {
      zoomAt(1.12);
      return;
    }

    if (action === 'zoom-out') {
      zoomAt(1 / 1.12);
      return;
    }

    if (action === 'reset') {
      apply({ ...initialTransform });
      return;
    }

    if (action === 'fit') {
      controller.fitToContent();
    }
  };

  const controller: StageViewportController = {
    getTransform() {
      return { ...state };
    },
    setTransform(next: Partial<StageTransform>) {
      apply(next);
    },
    zoomBy(factor: number, anchor?: StagePoint) {
      zoomAt(factor, anchor);
    },
    panBy(dx: number, dy: number) {
      apply({ x: state.x + dx, y: state.y + dy });
    },
    reset() {
      apply({ ...initialTransform });
    },
    fitToContent() {
      const contentSize = readSize(surface);
      const frameSize = readSize(frame);
      const next = computeFitTransform(contentSize, frameSize, fitPadding, limits);
      apply(next);
    },
    destroy() {
      stopDragging();
      frame.removeEventListener('pointerdown', startDragging);
      frame.removeEventListener('wheel', onWheel);
      stage.removeEventListener('click', onClick);
      controllers.delete(stage);
    },
  };

  createTransform(state, surface, zoomLabel);
  frame.addEventListener('pointerdown', startDragging);
  frame.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener('click', onClick);

  if (options.autoFit) {
    scheduleFrame(() => {
      if (controllers.get(stage) !== controller) return;
      controller.fitToContent();
    });
  }

  controllers.set(stage, controller);
  return controller;
}

export function setupGraphViewports(): void {
  document.querySelectorAll<HTMLElement>('[data-graph-stage]').forEach((stage) => {
    if (controllers.has(stage)) return;
    createGraphViewportController(stage, {
      autoFit: stage.dataset.viewportAutoFit === 'true',
    });
  });
}
