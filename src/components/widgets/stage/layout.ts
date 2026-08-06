import type { StageSize } from './geometry.ts';

interface StageNodeLike {
  offsetWidth: number;
  offsetHeight: number;
  dataset: DOMStringMap;
  style: CSSStyleDeclaration;
}

interface StageSurfaceLike extends HTMLElement {
  style: CSSStyleDeclaration;
}

function readNumber(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getNodePosition(node: StageNodeLike): { left: number; top: number } {
  const left = readNumber(node.dataset.stageX, readNumber(node.style.left, 0));
  const top = readNumber(node.dataset.stageY, readNumber(node.style.top, 0));
  return { left, top };
}

function getStageSurface(stage: HTMLElement): StageSurfaceLike | null {
  return stage.querySelector<StageSurfaceLike>('.graph-stage__surface');
}

export function measureGraphStageContent(stage: HTMLElement): StageSize {
  const nodes = Array.from(stage.querySelectorAll<HTMLElement>('[data-stage-node]'));
  const padding = 96;

  if (nodes.length === 0) {
    return {
      width: padding * 2,
      height: padding * 2,
    };
  }

  let maxRight = 0;
  let maxBottom = 0;

  nodes.forEach((node) => {
    const { left, top } = getNodePosition(node);
    const width = node.offsetWidth || 0;
    const height = node.offsetHeight || 0;

    maxRight = Math.max(maxRight, left + width);
    maxBottom = Math.max(maxBottom, top + height);
  });

  return {
    width: Math.max(maxRight + padding, padding * 2),
    height: Math.max(maxBottom + padding, padding * 2),
  };
}

export function updateGraphStageBounds(stageId: string): void {
  const stage = document.getElementById(stageId);
  if (!stage) return;

  const surface = getStageSurface(stage);
  if (!surface) return;

  const size = measureGraphStageContent(stage);
  surface.style.width = `${Math.ceil(size.width)}px`;
  surface.style.height = `${Math.ceil(size.height)}px`;
}
