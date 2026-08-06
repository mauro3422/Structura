import { buildGraphEdgeRoute, buildRoundedOrthogonalPath, rectToLocal } from '../stage/index.ts';

export { buildRoundedOrthogonalPath } from '../stage/index.ts';

interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface PointLike {
  x: number;
  y: number;
}

type DirectionKey = 'horizontal:right' | 'horizontal:left' | 'vertical:bottom' | 'vertical:top';
type TreeDirection = 'down' | 'up' | 'left' | 'right';

interface RouteOptions {
  sourceAnchorRect?: RectLike;
  targetAnchorRect?: RectLike;
  obstacles?: RectLike[];
  laneOffset?: number;
  sharedHubPoint?: PointLike;
  sourceSide?: 'left' | 'right' | 'top' | 'bottom';
  targetSide?: 'left' | 'right' | 'top' | 'bottom';
}

function getPortAnchorRect(cell: HTMLElement, role: 'source' | 'target'): HTMLElement | null {
  return cell.querySelector<HTMLElement>(`[data-graph-port="${role}"]`);
}

function rectFromElement(element: Element, surfaceRect: RectLike, scale: number): RectLike {
  return rectToLocal(element.getBoundingClientRect(), surfaceRect, scale);
}

function getCenter(rect: RectLike): PointLike {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  if (min > max) return (min + max) / 2;
  return Math.min(Math.max(value, min), max);
}

function getBounds(rects: RectLike[]): RectLike {
  if (rects.length === 0) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    };
  }

  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

function expandRect(rect: RectLike, padding: number): RectLike {
  return {
    left: rect.left - padding,
    top: rect.top - padding,
    right: rect.right + padding,
    bottom: rect.bottom + padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function pathIntersectsAny(points: PointLike[], obstacles: RectLike[]): boolean {
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];

    for (const rect of obstacles) {
      const vertical = start.x === end.x;
      const horizontal = start.y === end.y;

      if (vertical) {
        const x = start.x;
        if (x < rect.left || x > rect.right) continue;
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);
        if (maxY >= rect.top && minY <= rect.bottom) return true;
        continue;
      }

      if (horizontal) {
        const y = start.y;
        if (y < rect.top || y > rect.bottom) continue;
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        if (maxX >= rect.left && minX <= rect.right) return true;
      }
    }
  }

  return false;
}

function normalizePoint(point: PointLike): PointLike {
  return {
    x: Number.isFinite(point.x) ? Math.round(point.x * 1000) / 1000 : 0,
    y: Number.isFinite(point.y) ? Math.round(point.y * 1000) / 1000 : 0,
  };
}

function simplifyPolyline(points: PointLike[]): PointLike[] {
  const normalized: PointLike[] = [];

  points.forEach((point) => {
    const current = normalizePoint(point);
    const previous = normalized[normalized.length - 1];
    if (previous && previous.x === current.x && previous.y === current.y) return;
    normalized.push(current);
  });

  if (normalized.length <= 2) return normalized;

  const simplified: PointLike[] = [normalized[0]];

  for (let index = 1; index < normalized.length - 1; index += 1) {
    const previous = simplified[simplified.length - 1];
    const current = normalized[index];
    const next = normalized[index + 1];

    if ((previous.x === current.x && current.x === next.x) || (previous.y === current.y && current.y === next.y)) {
      continue;
    }

    simplified.push(current);
  }

  simplified.push(normalized[normalized.length - 1]);
  return simplified;
}

function pointAlongPath(points: PointLike[], ratio = 0.5): PointLike {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };

  const lengths: number[] = [];
  let total = 0;

  for (let index = 1; index < points.length; index += 1) {
    const length = Math.abs(points[index].x - points[index - 1].x) + Math.abs(points[index].y - points[index - 1].y);
    lengths.push(length);
    total += length;
  }

  if (total === 0) return { ...points[0] };

  const target = total * Math.max(0, Math.min(1, ratio));
  let walked = 0;

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const cur = points[index];
    const length = lengths[index - 1];

    if (walked + length >= target) {
      const local = length === 0 ? 0 : (target - walked) / length;
      return {
        x: prev.x + (cur.x - prev.x) * local,
        y: prev.y + (cur.y - prev.y) * local,
      };
    }

    walked += length;
  }

  return { ...points[points.length - 1] };
}

export function classifyTargetDirection(sourceRect: RectLike, targetRect: RectLike): DirectionKey {
  const sourceCenter = getCenter(sourceRect);
  const targetCenter = getCenter(targetRect);
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'horizontal:right' : 'horizontal:left';
  }

  return dy >= 0 ? 'vertical:bottom' : 'vertical:top';
}

function directionToTreeDirection(direction: DirectionKey): TreeDirection {
  switch (direction) {
    case 'horizontal:right':
      return 'right';
    case 'horizontal:left':
      return 'left';
    case 'vertical:top':
      return 'up';
    case 'vertical:bottom':
    default:
      return 'down';
  }
}

function directionToRouterSides(direction: DirectionKey): {
  sourceSide: 'left' | 'right' | 'top' | 'bottom';
  targetSide: 'left' | 'right' | 'top' | 'bottom';
  preferAxis: 'horizontal' | 'vertical';
} {
  switch (direction) {
    case 'horizontal:right':
      return { sourceSide: 'right', targetSide: 'left', preferAxis: 'horizontal' };
    case 'horizontal:left':
      return { sourceSide: 'left', targetSide: 'right', preferAxis: 'horizontal' };
    case 'vertical:top':
      return { sourceSide: 'top', targetSide: 'bottom', preferAxis: 'vertical' };
    case 'vertical:bottom':
    default:
      return { sourceSide: 'bottom', targetSide: 'top', preferAxis: 'vertical' };
  }
}

function chooseCandidateCoordinate(
  sourceRect: RectLike,
  targetRects: RectLike[],
  direction: TreeDirection,
  obstacles: RectLike[],
): number {
  const sourceCenter = getCenter(sourceRect);
  const targetCenters = targetRects.map(getCenter);
  const targetBounds = getBounds(targetRects);
  const candidates = new Set<number>();

  candidates.add(sourceCenter[direction === 'left' || direction === 'right' ? 'y' : 'x']);
  targetCenters.forEach((point) => {
    candidates.add(direction === 'left' || direction === 'right' ? point.y : point.x);
  });
  candidates.add(average(targetCenters.map((point) => (direction === 'left' || direction === 'right' ? point.y : point.x))));

  const corridorPadding = 56;
  const corridorStart = direction === 'down'
    ? sourceRect.bottom + corridorPadding
    : direction === 'up'
      ? targetBounds.bottom + corridorPadding
      : direction === 'right'
        ? sourceRect.right + corridorPadding
        : targetBounds.right + corridorPadding;
  const corridorEnd = direction === 'down'
    ? targetBounds.top - corridorPadding
    : direction === 'up'
      ? sourceRect.top - corridorPadding
      : direction === 'right'
        ? targetBounds.left - corridorPadding
        : sourceRect.left - corridorPadding;

  const minCorridor = Math.min(corridorStart, corridorEnd);
  const maxCorridor = Math.max(corridorStart, corridorEnd);
  const fallback = direction === 'down' || direction === 'up' ? sourceCenter.x : sourceCenter.y;

  const score = (candidate: number): number => {
    const lineHits = obstacles.reduce((count, rect) => {
      if (direction === 'down' || direction === 'up') {
        const withinX = candidate >= rect.left && candidate <= rect.right;
        const intersectsY = maxCorridor >= rect.top && minCorridor <= rect.bottom;
        return count + (withinX && intersectsY ? 1 : 0);
      }

      const withinY = candidate >= rect.top && candidate <= rect.bottom;
      const intersectsX = maxCorridor >= rect.left && minCorridor <= rect.right;
      return count + (withinY && intersectsX ? 1 : 0);
    }, 0);

    const spread = direction === 'down' || direction === 'up'
      ? Math.abs(candidate - average(targetCenters.map((point) => point.x)))
      : Math.abs(candidate - average(targetCenters.map((point) => point.y)));
    const sourceGap = Math.abs(candidate - fallback);

    return lineHits * 1000 + spread * 2 + sourceGap;
  };

  const sorted = Array.from(candidates).sort((a, b) => score(a) - score(b));
  return sorted[0] ?? fallback;
}

function chooseHubPoint(
  sourceRect: RectLike,
  targetRects: RectLike[],
  direction: TreeDirection,
  obstacles: RectLike[],
): PointLike {
  const sourceCenter = getCenter(sourceRect);
  const targetBounds = getBounds(targetRects);
  const candidateCoord = chooseCandidateCoordinate(sourceRect, targetRects, direction, obstacles);
  const baseDistance = Math.max(64, Math.min(120, Math.abs((direction === 'down' || direction === 'up' ? targetBounds.top - sourceRect.bottom : targetBounds.left - sourceRect.right) * 0.35) || 88));

  if (direction === 'down') {
    return {
      x: candidateCoord,
      y: sourceRect.bottom + baseDistance,
    };
  }

  if (direction === 'up') {
    return {
      x: candidateCoord,
      y: sourceRect.top - baseDistance,
    };
  }

  if (direction === 'right') {
    return {
      x: sourceRect.right + baseDistance,
      y: candidateCoord,
    };
  }

  return {
    x: sourceRect.left - baseDistance,
    y: candidateCoord,
  };
}

function buildRoute(
  sourceRect: RectLike,
  targetRect: RectLike,
  canvasRect: RectLike,
  directionKey: DirectionKey,
  options: RouteOptions = {},
): ReturnType<typeof buildGraphEdgeRoute> {
  if (directionKey === 'vertical:bottom' || directionKey === 'vertical:top') {
    return buildVerticalColumnRoute(sourceRect, targetRect, directionKey, options);
  }

  const { sourceSide, targetSide, preferAxis } = directionToRouterSides(directionKey);
  const direction = directionToTreeDirection(directionKey);
  const sourceAnchorRect = options.sourceAnchorRect || sourceRect;
  const targetAnchorRect = options.targetAnchorRect || targetRect;
  const obstacles = (options.obstacles || []).map((rect) => expandRect(rect, 18));
  const sharedHubPoint = options.sharedHubPoint || chooseHubPoint(sourceRect, [targetRect], direction, obstacles);

  return buildGraphEdgeRoute({
    sourceRect,
    targetRect,
    canvasRect,
    sourceAnchorRect,
    targetAnchorRect,
    sourceSide,
    targetSide,
    sharedHubPoint,
    obstacles,
    laneOffset: options.laneOffset || 0,
    portGap: 20,
    obstaclePadding: 18,
    preferAxis,
  });
}

function buildVerticalColumnRoute(
  sourceRect: RectLike,
  targetRect: RectLike,
  directionKey: Extract<DirectionKey, 'vertical:bottom' | 'vertical:top'>,
  options: RouteOptions = {},
): ReturnType<typeof buildGraphEdgeRoute> {
  const sourceAnchor = options.sourceAnchorRect || sourceRect;
  const targetAnchor = options.targetAnchorRect || targetRect;
  const sourceCenter = getCenter(sourceAnchor);
  const targetCenter = getCenter(targetAnchor);
  const laneOffset = options.laneOffset || 0;
  const gap = 20;

  const isDown = directionKey === 'vertical:bottom';
  const sourcePoint = normalizePoint({
    x: clamp(sourceCenter.x + laneOffset * 0.35, sourceRect.left + 18, sourceRect.right - 18),
    y: isDown ? sourceRect.bottom + gap : sourceRect.top - gap,
  });
  const targetPoint = normalizePoint({
    x: clamp(targetCenter.x, targetRect.left + 18, targetRect.right - 18),
    y: isDown ? targetRect.top - gap : targetRect.bottom + gap,
  });

  const corridorStart = isDown ? sourceRect.bottom : targetRect.bottom;
  const corridorEnd = isDown ? targetRect.top : sourceRect.top;
  const corridorSize = Math.abs(corridorEnd - corridorStart);
  const preferredBus = isDown
    ? sourceRect.bottom + Math.max(46, corridorSize * 0.48) + laneOffset
    : sourceRect.top - Math.max(46, corridorSize * 0.48) - laneOffset;
  const minBus = Math.min(sourcePoint.y, targetPoint.y) + 28;
  const maxBus = Math.max(sourcePoint.y, targetPoint.y) - 28;
  const busY = normalizePoint({ x: 0, y: clamp(preferredBus, minBus, maxBus) }).y;

  const points = simplifyPolyline([
    sourcePoint,
    { x: sourcePoint.x, y: busY },
    { x: targetPoint.x, y: busY },
    targetPoint,
  ]);
  const labelPoint = pointAlongPath(points, 0.58);

  return {
    d: buildRoundedOrthogonalPath(points, 18),
    labelX: Math.round(labelPoint.x * 1000) / 1000,
    labelY: Math.round((labelPoint.y - 10) * 1000) / 1000,
    textAnchor: 'middle',
    points,
  };
}

export function buildRelationshipRoute(
  sourceRect: RectLike,
  targetRect: RectLike,
  canvasRect: RectLike,
  options: RouteOptions = {},
): ReturnType<typeof buildGraphEdgeRoute> {
  const directionKey = classifyTargetDirection(sourceRect, targetRect);
  return buildRoute(sourceRect, targetRect, canvasRect, directionKey, options);
}

function drawPath(svg: SVGSVGElement, route: ReturnType<typeof buildGraphEdgeRoute>, relId: string, relIndex: number): void {
  const toneClass = `rel-line--tone-${(relIndex % 4) + 1}`;
  const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shadow.setAttribute('d', route.d);
  shadow.setAttribute('class', `rel-line rel-line--shadow ${toneClass}`);
  shadow.setAttribute('data-rel-id', relId);
  svg.appendChild(shadow);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', route.d);
  path.setAttribute('class', `rel-line ${toneClass}`);
  path.setAttribute('data-rel-id', relId);
  path.setAttribute('marker-end', 'url(#arrowhead)');
  svg.appendChild(path);
}

function drawLabel(svg: SVGSVGElement, route: ReturnType<typeof buildGraphEdgeRoute>, text: string): void {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'rel-label-group');

  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('class', 'rel-label-bg');

  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('x', String(route.labelX));
  label.setAttribute('y', String(route.labelY));
  label.setAttribute('class', 'rel-label');
  label.setAttribute('text-anchor', route.textAnchor);
  label.setAttribute('dominant-baseline', 'middle');
  label.textContent = text;

  group.append(background, label);
  svg.appendChild(group);

  let box: { x: number; y: number; width: number; height: number };
  try {
    box = label.getBBox();
  } catch {
    box = {
      x: route.labelX - text.length * 3.6,
      y: route.labelY - 6,
      width: text.length * 7.2,
      height: 12,
    };
  }
  const paddingX = 9;
  const paddingY = 5;
  background.setAttribute('x', String(box.x - paddingX));
  background.setAttribute('y', String(box.y - paddingY));
  background.setAttribute('width', String(box.width + paddingX * 2));
  background.setAttribute('height', String(box.height + paddingY * 2));
  background.setAttribute('rx', '8');
  background.setAttribute('ry', '8');
}

export function drawRelationshipLayer(labId: string): void {
  const svg = document.getElementById(`${labId}-svg`) as SVGSVGElement | null;
  const canvas = document.getElementById(`${labId}-canvas`) as HTMLElement | null;
  if (!canvas || !svg) return;

  if (!svg.querySelector('#arrowhead')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', 'var(--color-primary)');

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  }

  svg.querySelectorAll('.rel-line, .rel-label-group').forEach((el) => el.remove());
  canvas.querySelectorAll('.is-rel-source, .is-rel-target').forEach((el) => {
    el.classList.remove('is-rel-source', 'is-rel-target');
    el.removeAttribute('data-rel-tone');
  });

  const canvasRect = {
    left: 0,
    top: 0,
    width: canvas.offsetWidth || canvas.clientWidth || 0,
    height: canvas.offsetHeight || canvas.clientHeight || 0,
    right: canvas.offsetWidth || canvas.clientWidth || 0,
    bottom: canvas.offsetHeight || canvas.clientHeight || 0,
  };
  const surfaceRect = canvas.getBoundingClientRect();
  const scale = canvasRect.width > 0 ? surfaceRect.width / canvasRect.width : 1;
  const tables = Array.from(canvas.querySelectorAll<HTMLElement>('.lab-table-item'));
  svg.setAttribute('viewBox', `0 0 ${canvasRect.width} ${canvasRect.height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const tableFrames = new Map<string, RectLike>();

  tables.forEach((item) => {
    tableFrames.set(item.dataset.tableId || '', rectToLocal(item.getBoundingClientRect(), surfaceRect, scale));
  });

  tables.forEach((item) => {
    const wrapper = item.querySelector<HTMLElement>('.data-table-wrapper');
    if (!wrapper) return;

    const ths = Array.from(wrapper.querySelectorAll<HTMLTableCellElement>('thead th[data-col-index]'));
    const fkCells = ths.filter((th) => th.dataset.fk === 'true' && Boolean(th.querySelector<HTMLSelectElement>('.ref-picker')?.value));
    if (fkCells.length === 0) return;

    const sourceTableId = item.dataset.tableId || '';
    const sourceTableRect = tableFrames.get(sourceTableId);
    if (!sourceTableRect) return;

    const resolvedEdges = fkCells
      .map((th, laneIndex) => {
        const targetId = th.querySelector<HTMLSelectElement>('.ref-picker')?.value;
        if (!targetId) return null;

        const targetTable = tables.find((candidate) => candidate.dataset.tableId === targetId);
        if (!targetTable) return null;

        const targetTableId = targetTable.dataset.tableId || '';
        const targetTableRect = tableFrames.get(targetTableId);
        if (!targetTableRect) return null;

        const targetPK = Array.from(targetTable.querySelectorAll<HTMLElement>('thead th[data-col-index]')).find((pkTh) => pkTh.dataset.pk === 'true');
        const targetAnchor = targetPK || targetTable.querySelector<HTMLElement>('.lab-table-header');
        if (!targetAnchor) return null;

        const sourceAnchor = getPortAnchorRect(th, 'source') || th;
        const targetAnchorNode = getPortAnchorRect(targetAnchor, 'target') || targetAnchor;

        return {
          th,
          laneIndex,
          targetTable,
          targetAnchor,
          targetTableRect,
          sourceAnchorLocal: rectFromElement(sourceAnchor, surfaceRect, scale),
          targetAnchorLocal: rectFromElement(targetAnchorNode, surfaceRect, scale),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    if (resolvedEdges.length === 0) return;

    const groupedEdges = new Map<DirectionKey, typeof resolvedEdges>();
    resolvedEdges.forEach((entry) => {
      const key = classifyTargetDirection(sourceTableRect, entry.targetTableRect);
      const group = groupedEdges.get(key) || [];
      group.push(entry);
      groupedEdges.set(key, group);
    });

    groupedEdges.forEach((group, directionKey) => {
      const direction = directionToTreeDirection(directionKey);
      const targetRects = group.map((entry) => entry.targetTableRect);
      const obstacles = Array.from(tableFrames.entries())
        .filter(([tableId]) => tableId !== sourceTableId)
        .map(([, rect]) => rect);
      const sharedHubPoint = chooseHubPoint(sourceTableRect, targetRects, direction, obstacles);

      const sortedGroup = [...group].sort((a, b) => {
        const aCenter = getCenter(a.targetTableRect);
        const bCenter = getCenter(b.targetTableRect);

        if (direction === 'down' || direction === 'up') {
          return aCenter.x - bCenter.x || aCenter.y - bCenter.y;
        }

        return aCenter.y - bCenter.y || aCenter.x - bCenter.x;
      });

      const laneCount = sortedGroup.length;
      const laneSpacing = Math.max(18, Math.min(30, 14 + laneCount * 2));

      sortedGroup.forEach((entry, index) => {
        const relTone = String((index % 4) + 1);
        entry.th.classList.add('is-rel-source');
        entry.th.dataset.relTone = relTone;
        entry.targetAnchor.classList.add('is-rel-target');
        entry.targetAnchor.dataset.relTone = relTone;

        const route = buildRoute(sourceTableRect, entry.targetTableRect, canvasRect, directionKey, {
          sourceAnchorRect: entry.sourceAnchorLocal,
          targetAnchorRect: entry.targetAnchorLocal,
          obstacles: Array.from(tableFrames.entries())
            .filter(([tableId]) => tableId !== sourceTableId && tableId !== entry.targetTable.dataset.tableId)
            .map(([, rect]) => rect),
          laneOffset: (index - (laneCount - 1) / 2) * laneSpacing,
          sharedHubPoint,
        });

        if (pathIntersectsAny(route.points, obstacles.map((rect) => expandRect(rect, 12)))) {
          const fallback = buildRoute(sourceTableRect, entry.targetTableRect, canvasRect, directionKey, {
            sourceAnchorRect: entry.sourceAnchorLocal,
            targetAnchorRect: entry.targetAnchorLocal,
            obstacles: [],
            laneOffset: (index - (laneCount - 1) / 2) * laneSpacing,
            sharedHubPoint,
          });
          const relId = `rel-${sourceTableId}-${entry.th.dataset.colIndex}`;
          drawPath(svg, fallback, relId, index);
          const card = entry.th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim() || '1:N';
          drawLabel(svg, fallback, card);
          return;
        }

        const relId = `rel-${sourceTableId}-${entry.th.dataset.colIndex}`;
        drawPath(svg, route, relId, index);
        const card = entry.th.querySelector<HTMLElement>('.cardinality-toggle')?.textContent?.trim() || '1:N';
        drawLabel(svg, route, card);
      });
    });
  });
}
