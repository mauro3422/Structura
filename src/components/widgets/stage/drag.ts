import { clamp } from './geometry.ts';
import { updateGraphStageBounds } from './layout.ts';

interface DragState {
  stage: HTMLElement;
  node: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

interface NodeDropDetail {
  stageId: string;
  nodeId: string;
  x: number;
  y: number;
}

const dragControllers = new WeakMap<HTMLElement, { destroy(): void }>();
const scheduleFrame =
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0);
const cancelFrame =
  typeof window.cancelAnimationFrame === 'function'
    ? window.cancelAnimationFrame.bind(window)
    : (handle: number) => window.clearTimeout(handle);

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element
    ? Boolean(target.closest('button:not([data-stage-drag-handle]), input, select, textarea, a, label, [contenteditable="true"], [data-viewport-ignore-pan="true"]'))
    : false;
}

function getScale(stage: HTMLElement): number {
  const surface = stage.querySelector<HTMLElement>('.graph-stage__surface');
  const scale = Number.parseFloat(surface?.dataset.viewportScale || '');
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

function getNodePosition(node: HTMLElement): { x: number; y: number } {
  const x = Number.parseFloat(node.dataset.stageX || node.style.left || '0');
  const y = Number.parseFloat(node.dataset.stageY || node.style.top || '0');
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
  };
}

function setNodePosition(node: HTMLElement, x: number, y: number): void {
  node.dataset.stageX = String(x);
  node.dataset.stageY = String(y);
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
}

function emitNodeEvent(stage: HTMLElement, type: string, detail: NodeDropDetail): void {
  stage.dispatchEvent(
    new CustomEvent(type, {
      bubbles: true,
      detail,
    }),
  );
}

export function setupGraphNodeDragging(): void {
  document.querySelectorAll<HTMLElement>('[data-graph-stage]').forEach((stage) => {
    if (dragControllers.has(stage)) return;

    let activeDrag: DragState | null = null;
    let rafId = 0;
    let pendingBounds = false;

    const flushBounds = () => {
      pendingBounds = false;
      updateGraphStageBounds(stage.id);
    };

    const scheduleBounds = () => {
      if (pendingBounds) return;
      pendingBounds = true;
      rafId = scheduleFrame(flushBounds);
    };

    const stopDrag = () => {
      if (!activeDrag) return;

      const { stage: activeStage, node } = activeDrag;
      const { x, y } = getNodePosition(node);
      node.classList.remove('is-dragging');
      document.body.classList.remove('is-node-dragging');
      activeDrag = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
      if (rafId) cancelFrame(rafId);
      updateGraphStageBounds(activeStage.id);
      emitNodeEvent(activeStage, 'graph-stage-node-drop', {
        stageId: activeStage.id,
        nodeId: node.dataset.stageNodeId || node.dataset.tableId || '',
        x,
        y,
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();

      const scale = getScale(activeDrag.stage);
      const nextX = clamp(activeDrag.originX + (event.clientX - activeDrag.startX) / scale, 16, Number.POSITIVE_INFINITY);
      const nextY = clamp(activeDrag.originY + (event.clientY - activeDrag.startY) / scale, 16, Number.POSITIVE_INFINITY);

      setNodePosition(activeDrag.node, nextX, nextY);
      activeDrag.node.classList.add('is-dragging');
      scheduleBounds();

      emitNodeEvent(activeDrag.stage, 'graph-stage-node-move', {
        stageId: activeDrag.stage.id,
        nodeId: activeDrag.node.dataset.stageNodeId || activeDrag.node.dataset.tableId || '',
        x: nextX,
        y: nextY,
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.button !== 0 || isInteractiveTarget(event.target)) return;

      const node = target?.closest<HTMLElement>('[data-stage-node]');
      if (!node) return;

      event.preventDefault();
      event.stopPropagation();
      const { x, y } = getNodePosition(node);

      activeDrag = {
        stage,
        node,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: x,
        originY: y,
      };

      node.classList.add('is-dragging');
      document.body.classList.add('is-node-dragging');
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', stopDrag);
      window.addEventListener('pointercancel', stopDrag);
    };

    const controller = {
      destroy() {
        if (rafId) cancelFrame(rafId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopDrag);
        window.removeEventListener('pointercancel', stopDrag);
        stage.removeEventListener('pointerdown', onPointerDown);
        dragControllers.delete(stage);
      },
    };

    stage.addEventListener('pointerdown', onPointerDown);
    dragControllers.set(stage, controller);
  });
}
