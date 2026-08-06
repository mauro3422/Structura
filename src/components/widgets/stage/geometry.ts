export interface StagePoint {
  x: number;
  y: number;
}

export interface StageRectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface StageSize {
  width: number;
  height: number;
}

export interface StageTransform {
  x: number;
  y: number;
  scale: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function buildStageTransformString(transform: StageTransform): string {
  return `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`;
}

export function rectToLocal(rect: StageRectLike, origin: StageRectLike, scale: number): StageRectLike {
  const safeScale = scale > 0 ? scale : 1;
  const left = (rect.left - origin.left) / safeScale;
  const top = (rect.top - origin.top) / safeScale;
  const width = rect.width / safeScale;
  const height = rect.height / safeScale;

  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}

export function computeAnchorZoomTransform(
  transform: StageTransform,
  factor: number,
  anchor: StagePoint,
  limits: { minScale: number; maxScale: number },
): StageTransform {
  const nextScale = clamp(transform.scale * factor, limits.minScale, limits.maxScale);
  const appliedScale = nextScale / transform.scale;

  return {
    scale: nextScale,
    x: anchor.x - (anchor.x - transform.x) * appliedScale,
    y: anchor.y - (anchor.y - transform.y) * appliedScale,
  };
}

export function computeFitTransform(
  contentSize: StageSize,
  frameSize: StageSize,
  padding = 48,
  limits: { minScale: number; maxScale: number } = { minScale: 0.35, maxScale: 2.5 },
): StageTransform {
  const contentWidth = Math.max(contentSize.width, 1);
  const contentHeight = Math.max(contentSize.height, 1);
  const availableWidth = Math.max(frameSize.width - padding * 2, 1);
  const availableHeight = Math.max(frameSize.height - padding * 2, 1);
  const rawScale = Math.min(availableWidth / contentWidth, availableHeight / contentHeight, 1);
  const scale = clamp(Number.isFinite(rawScale) ? rawScale : 1, limits.minScale, limits.maxScale);

  return {
    scale,
    x: (frameSize.width - contentWidth * scale) / 2,
    y: (frameSize.height - contentHeight * scale) / 2,
  };
}
