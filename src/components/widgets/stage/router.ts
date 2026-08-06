import { clamp } from './geometry.ts';

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphRectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export type GraphSide = 'left' | 'right' | 'top' | 'bottom';
export type GraphAxis = 'horizontal' | 'vertical';

export interface GraphRoute {
  d: string;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'middle' | 'end';
  points: GraphPoint[];
}

export interface GraphRouteOptions {
  sourceRect: GraphRectLike;
  targetRect: GraphRectLike;
  canvasRect: GraphRectLike;
  sourceAnchorRect?: GraphRectLike;
  targetAnchorRect?: GraphRectLike;
  sharedHubPoint?: GraphPoint;
  sourceSide?: GraphSide;
  targetSide?: GraphSide;
  obstacles?: GraphRectLike[];
  laneOffset?: number;
  portGap?: number;
  obstaclePadding?: number;
  preferAxis?: GraphAxis;
}

function getCenter(rect: GraphRectLike): GraphPoint {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function normalize(value: number): number {
  return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : 0;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getBounds(rects: GraphRectLike[]): GraphRectLike {
  if (rects.length === 0) {
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
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

function pointKey(point: GraphPoint): string {
  return `${normalize(point.x)}:${normalize(point.y)}`;
}

function pathIntersectsAny(points: GraphPoint[], obstacles: GraphRectLike[]): boolean {
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];

    if (obstacles.some((rect) => segmentIntersectsRect(start, end, rect))) {
      return true;
    }
  }

  return false;
}

function simplifyPolyline(points: GraphPoint[]): GraphPoint[] {
  const normalized: GraphPoint[] = [];

  points.forEach((point) => {
    const current = { x: normalize(point.x), y: normalize(point.y) };
    const previous = normalized[normalized.length - 1];
    if (previous && previous.x === current.x && previous.y === current.y) return;
    normalized.push(current);
  });

  if (normalized.length <= 2) return normalized;

  const simplified: GraphPoint[] = [normalized[0]];

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

function expandRect(rect: GraphRectLike, padding: number): GraphRectLike {
  return {
    left: rect.left - padding,
    top: rect.top - padding,
    right: rect.right + padding,
    bottom: rect.bottom + padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function rectContainsPoint(rect: GraphRectLike, point: GraphPoint): boolean {
  return point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom;
}

function segmentIntersectsRect(start: GraphPoint, end: GraphPoint, rect: GraphRectLike): boolean {
  if (start.x === end.x) {
    const x = start.x;
    if (x < rect.left || x > rect.right) return false;
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    return maxY >= rect.top && minY <= rect.bottom;
  }

  if (start.y === end.y) {
    const y = start.y;
    if (y < rect.top || y > rect.bottom) return false;
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    return maxX >= rect.left && minX <= rect.right;
  }

  return false;
}

function segmentClear(start: GraphPoint, end: GraphPoint, obstacles: GraphRectLike[]): boolean {
  return !obstacles.some((rect) => segmentIntersectsRect(start, end, rect));
}

function pathDistance(points: GraphPoint[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.abs(points[index].x - points[index - 1].x) + Math.abs(points[index].y - points[index - 1].y);
  }
  return total;
}

function pointAlongPath(points: GraphPoint[], ratio = 0.5): GraphPoint {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };

  const total = pathDistance(points);
  if (total === 0) return { ...points[0] };

  const target = total * clamp(ratio, 0, 1);
  let walked = 0;

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const cur = points[index];
    const segment = Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);

    if (walked + segment >= target) {
      const local = segment === 0 ? 0 : (target - walked) / segment;
      return {
        x: prev.x + (cur.x - prev.x) * local,
        y: prev.y + (cur.y - prev.y) * local,
      };
    }

    walked += segment;
  }

  return { ...points[points.length - 1] };
}

function offsetPoint(points: GraphPoint[], ratio: number, offset = 0): GraphPoint {
  const point = pointAlongPath(points, ratio);
  if (offset === 0 || points.length < 2) return point;

  const total = pathDistance(points);
  if (total === 0) return point;

  const target = total * clamp(ratio, 0, 1);
  let walked = 0;

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const cur = points[index];
    const segment = Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);

    if (walked + segment >= target) {
      const horizontal = prev.y === cur.y;
      if (horizontal) {
        const direction = Math.sign(cur.y - prev.y) || 1;
        return { x: point.x, y: point.y + direction * offset };
      }

      const direction = Math.sign(cur.x - prev.x) || 1;
      return { x: point.x + direction * offset, y: point.y };
    }

    walked += segment;
  }

  return point;
}

function insertPoint(points: Map<string, GraphPoint>, point: GraphPoint): void {
  points.set(pointKey(point), { x: normalize(point.x), y: normalize(point.y) });
}

function buildVisibilityPath(start: GraphPoint, end: GraphPoint, obstacles: GraphRectLike[]): GraphPoint[] {
  const points = new Map<string, GraphPoint>();
  insertPoint(points, start);
  insertPoint(points, end);

  const xValues = new Set<number>([normalize(start.x), normalize(end.x)]);
  const yValues = new Set<number>([normalize(start.y), normalize(end.y)]);

  obstacles.forEach((rect) => {
    xValues.add(normalize(rect.left));
    xValues.add(normalize(rect.right));
    yValues.add(normalize(rect.top));
    yValues.add(normalize(rect.bottom));
  });

  const xList = Array.from(xValues).sort((a, b) => a - b);
  const yList = Array.from(yValues).sort((a, b) => a - b);

  xList.forEach((x) => {
    yList.forEach((y) => {
      const point = { x, y };
      if (obstacles.some((rect) => rectContainsPoint(rect, point))) return;
      insertPoint(points, point);
    });
  });

  const nodes = Array.from(points.values());
  const adjacency = new Map<string, Set<string>>();

  const connect = (from: GraphPoint, to: GraphPoint) => {
    const fromKey = pointKey(from);
    const toKey = pointKey(to);
    const existing = adjacency.get(fromKey) || new Set<string>();
    existing.add(toKey);
    adjacency.set(fromKey, existing);
  };

  const byX = new Map<string, GraphPoint[]>();
  const byY = new Map<string, GraphPoint[]>();

  nodes.forEach((point) => {
    const xKey = normalize(point.x).toString();
    const yKey = normalize(point.y).toString();
    const row = byX.get(xKey) || [];
    row.push(point);
    byX.set(xKey, row);
    const column = byY.get(yKey) || [];
    column.push(point);
    byY.set(yKey, column);
  });

  byX.forEach((column) => {
    column.sort((a, b) => a.y - b.y);
    for (let index = 1; index < column.length; index += 1) {
      const prev = column[index - 1];
      const cur = column[index];
      if (segmentClear(prev, cur, obstacles)) {
        connect(prev, cur);
        connect(cur, prev);
      }
    }
  });

  byY.forEach((row) => {
    row.sort((a, b) => a.x - b.x);
    for (let index = 1; index < row.length; index += 1) {
      const prev = row[index - 1];
      const cur = row[index];
      if (segmentClear(prev, cur, obstacles)) {
        connect(prev, cur);
        connect(cur, prev);
      }
    }
  });

  const startKey = pointKey(start);
  const endKey = pointKey(end);
  const open = new Map<string, number>([[startKey, 0]]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);

  const heuristic = (point: GraphPoint): number =>
    Math.abs(point.x - end.x) + Math.abs(point.y - end.y);

  while (open.size > 0) {
    let currentKey: string | null = null;
    let currentScore = Number.POSITIVE_INFINITY;

    open.forEach((score, key) => {
      if (score < currentScore) {
        currentScore = score;
        currentKey = key;
      }
    });

    if (!currentKey) break;
    const currentId = currentKey;
    if (currentId === endKey) {
      const path: GraphPoint[] = [];
      let cursor: string | undefined = currentId;
      while (cursor) {
        const point = points.get(cursor);
        if (point) path.unshift(point);
        cursor = cameFrom.get(cursor);
      }
      return path;
    }

    open.delete(currentId);
    const currentPoint = points.get(currentId);
    if (!currentPoint) continue;

    const neighbors = adjacency.get(currentId);
    if (!neighbors) continue;

    neighbors.forEach((neighborKey) => {
      const neighbor = points.get(neighborKey);
      if (!neighbor) return;

      const tentative = (gScore.get(currentId) ?? Number.POSITIVE_INFINITY) +
        Math.abs(neighbor.x - currentPoint.x) + Math.abs(neighbor.y - currentPoint.y);

      if (tentative >= (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) return;

      cameFrom.set(neighborKey, currentId);
      gScore.set(neighborKey, tentative);
      open.set(neighborKey, tentative + heuristic(neighbor));
    });
  }

  return [start, end];
}

function chooseAxis(sourceRect: GraphRectLike, targetRect: GraphRectLike, preferAxis?: GraphAxis): GraphAxis {
  if (preferAxis) return preferAxis;
  const sourceCenter = getCenter(sourceRect);
  const targetCenter = getCenter(targetRect);
  return Math.abs(sourceCenter.x - targetCenter.x) >= Math.abs(sourceCenter.y - targetCenter.y) ? 'horizontal' : 'vertical';
}

function chooseSides(sourceRect: GraphRectLike, targetRect: GraphRectLike, axis: GraphAxis): { sourceSide: GraphSide; targetSide: GraphSide } {
  const sourceCenter = getCenter(sourceRect);
  const targetCenter = getCenter(targetRect);

  if (axis === 'horizontal') {
    return {
      sourceSide: targetCenter.y >= sourceCenter.y ? 'bottom' : 'top',
      targetSide: targetCenter.y >= sourceCenter.y ? 'top' : 'bottom',
    };
  }

  return {
    sourceSide: targetCenter.x >= sourceCenter.x ? 'right' : 'left',
    targetSide: targetCenter.x >= sourceCenter.x ? 'left' : 'right',
  };
}

function buildLeadPoint(point: GraphPoint, side: GraphSide, gap: number): GraphPoint {
  if (side === 'left' || side === 'right') {
    const direction = side === 'right' ? 1 : -1;
    return {
      x: point.x + direction * gap,
      y: point.y,
    };
  }

  const direction = side === 'bottom' ? 1 : -1;
  return {
    x: point.x,
    y: point.y + direction * gap,
  };
}

function shiftHubPoint(point: GraphPoint, axis: GraphAxis, amount: number): GraphPoint {
  if (axis === 'horizontal') {
    return { x: point.x, y: point.y + amount };
  }

  return { x: point.x + amount, y: point.y };
}

function buildGutterPolyline(
  sourcePoint: GraphPoint,
  targetPoint: GraphPoint,
  sourceLeadPoint: GraphPoint,
  targetLeadPoint: GraphPoint,
  sharedHubPoint: GraphPoint,
  axis: GraphAxis,
  laneOffset: number,
): GraphPoint[] {
  if (axis === 'horizontal') {
    return [
      sourcePoint,
      sourceLeadPoint,
      { x: sourceLeadPoint.x, y: sharedHubPoint.y },
      { x: sharedHubPoint.x, y: sharedHubPoint.y },
      { x: sharedHubPoint.x, y: targetLeadPoint.y },
      { x: targetLeadPoint.x, y: targetLeadPoint.y },
      targetLeadPoint,
      targetPoint,
    ];
  }

  return [
    sourcePoint,
    sourceLeadPoint,
    { x: sharedHubPoint.x, y: sourceLeadPoint.y },
    { x: sharedHubPoint.x, y: sharedHubPoint.y },
    { x: targetLeadPoint.x, y: sharedHubPoint.y },
    { x: targetLeadPoint.x, y: targetLeadPoint.y },
    targetLeadPoint,
    targetPoint,
  ];
}

function computeDefaultHubPoint(
  sourceRect: GraphRectLike,
  targetRect: GraphRectLike,
  axis: GraphAxis,
  laneOffset: number,
): GraphPoint {
  const sourceCenter = getCenter(sourceRect);
  const targetCenter = getCenter(targetRect);
  const horizontal = targetCenter.x >= sourceCenter.x;
  const vertical = targetCenter.y >= sourceCenter.y;

  if (axis === 'horizontal') {
    return {
      x: clamp(average([sourceCenter.x, targetCenter.x]), Math.min(sourceRect.left, targetRect.left) - 120, Math.max(sourceRect.right, targetRect.right) + 120),
      y: vertical ? sourceRect.bottom + 96 : sourceRect.top - 96,
    };
  }

  return {
    x: horizontal ? sourceRect.right + 96 : sourceRect.left - 96,
    y: clamp(average([sourceCenter.y, targetCenter.y]), Math.min(sourceRect.top, targetRect.top) - 120, Math.max(sourceRect.bottom, targetRect.bottom) + 120),
  };
}

function buildPortPoint(rect: GraphRectLike, anchorRect: GraphRectLike, side: GraphSide, laneOffset: number, gap: number): GraphPoint {
  const anchorCenter = getCenter(anchorRect);
  if (side === 'left' || side === 'right') {
    const y = clamp(anchorCenter.y + laneOffset, rect.top + 18, rect.bottom - 18);
    return {
      x: side === 'left' ? rect.left - gap : rect.right + gap,
      y,
    };
  }

  const x = clamp(anchorCenter.x + laneOffset, rect.left + 18, rect.right - 18);
  return {
    x,
    y: side === 'top' ? rect.top - gap : rect.bottom + gap,
  };
}

export function buildGraphEdgeRoute(options: GraphRouteOptions): GraphRoute {
  const axis = chooseAxis(options.sourceRect, options.targetRect, options.preferAxis);
  const fallbackSides = chooseSides(options.sourceRect, options.targetRect, axis);
  const sourceSide = options.sourceSide || fallbackSides.sourceSide;
  const targetSide = options.targetSide || fallbackSides.targetSide;
  const laneOffset = options.laneOffset || 0;
  const gap = options.portGap ?? 22;
  const obstaclePadding = options.obstaclePadding ?? 28;
  const sourceAnchorRect = options.sourceAnchorRect || options.sourceRect;
  const targetAnchorRect = options.targetAnchorRect || options.targetRect;
  const hubPoint = options.sharedHubPoint || computeDefaultHubPoint(options.sourceRect, options.targetRect, axis, laneOffset);
  const leadGap = Math.max(gap + 24, 42);
  const obstacleBounds = options.obstacles && options.obstacles.length > 0 ? getBounds(options.obstacles) : null;

  const sourcePoint = buildPortPoint(options.sourceRect, sourceAnchorRect, sourceSide, laneOffset, gap);
  const targetPoint = buildPortPoint(options.targetRect, targetAnchorRect, targetSide, laneOffset, gap);
  const obstacles = (options.obstacles || []).map((rect) => expandRect(rect, obstaclePadding));

  const sourceLeadPoint = buildLeadPoint(sourcePoint, sourceSide, leadGap);
  const targetLeadPoint = buildLeadPoint(targetPoint, targetSide, leadGap);
  const laneStep = Math.max(18, gap);
  const laneCandidates = [laneOffset, 0, laneStep, -laneStep, laneStep * 2, -laneStep * 2, laneStep * 3, -laneStep * 3];

  const hubCandidates: GraphPoint[] = [];
  if (axis === 'horizontal') {
    const topY = (obstacleBounds ? obstacleBounds.top : Math.min(options.sourceRect.top, options.targetRect.top)) - 56;
    const bottomY = (obstacleBounds ? obstacleBounds.bottom : Math.max(options.sourceRect.bottom, options.targetRect.bottom)) + 56;
    hubCandidates.push({ x: hubPoint.x, y: topY });
    hubCandidates.push({ x: hubPoint.x, y: bottomY });
    hubCandidates.push({ x: hubPoint.x, y: topY - 24 });
    hubCandidates.push({ x: hubPoint.x, y: bottomY + 24 });
  } else {
    const leftX = (obstacleBounds ? obstacleBounds.left : Math.min(options.sourceRect.left, options.targetRect.left)) - 56;
    const rightX = (obstacleBounds ? obstacleBounds.right : Math.max(options.sourceRect.right, options.targetRect.right)) + 56;
    hubCandidates.push({ x: leftX, y: hubPoint.y });
    hubCandidates.push({ x: rightX, y: hubPoint.y });
    hubCandidates.push({ x: leftX - 24, y: hubPoint.y });
    hubCandidates.push({ x: rightX + 24, y: hubPoint.y });
  }
  hubCandidates.push(hubPoint);
  hubCandidates.push(shiftHubPoint(hubPoint, axis, 18));
  hubCandidates.push(shiftHubPoint(hubPoint, axis, -18));

  let path = buildGutterPolyline(sourcePoint, targetPoint, sourceLeadPoint, targetLeadPoint, hubPoint, axis, laneOffset);
  let resolved = false;

  for (const candidateHub of hubCandidates) {
    for (const candidateLane of laneCandidates) {
      const candidatePath = buildGutterPolyline(sourcePoint, targetPoint, sourceLeadPoint, targetLeadPoint, candidateHub, axis, candidateLane);
      if (pathIntersectsAny(candidatePath, obstacles)) continue;
      path = candidatePath;
      resolved = true;
      break;
    }

    if (resolved) break;
  }

  const simplified = simplifyPolyline(path);
  const smooth = buildRoundedOrthogonalPath(simplified, 24);
  const labelRatio = options.sharedHubPoint ? 0.72 : 0.5;
  const labelPoint = offsetPoint(simplified, labelRatio, 10);
  const labelX = normalize(labelPoint.x);
  const labelY = normalize(labelPoint.y);

  return {
    d: smooth,
    labelX,
    labelY,
    textAnchor: 'middle',
    points: simplified,
  };
}

export function buildRoundedOrthogonalPath(points: GraphPoint[], radius = 16): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const cur = points[index];
    const next = points[index + 1];

    if (!next) {
      d += ` L ${cur.x} ${cur.y}`;
      continue;
    }

    const prevLength = Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);
    const nextLength = Math.abs(next.x - cur.x) + Math.abs(next.y - cur.y);
    const cornerRadius = Math.min(radius, prevLength / 2, nextLength / 2);

    if (prev.x === cur.x && cur.y === next.y) {
      const incomingDir = Math.sign(cur.y - prev.y) || 1;
      const outgoingDir = Math.sign(next.x - cur.x) || 1;
      const approach = { x: cur.x, y: cur.y - incomingDir * cornerRadius };
      const depart = { x: cur.x + outgoingDir * cornerRadius, y: cur.y };
      d += ` L ${approach.x} ${approach.y} Q ${cur.x} ${cur.y} ${depart.x} ${depart.y}`;
      continue;
    }

    if (prev.y === cur.y && cur.x === next.x) {
      const incomingDir = Math.sign(cur.x - prev.x) || 1;
      const outgoingDir = Math.sign(next.y - cur.y) || 1;
      const approach = { x: cur.x - incomingDir * cornerRadius, y: cur.y };
      const depart = { x: cur.x, y: cur.y + outgoingDir * cornerRadius };
      d += ` L ${approach.x} ${approach.y} Q ${cur.x} ${cur.y} ${depart.x} ${depart.y}`;
      continue;
    }

    d += ` L ${cur.x} ${cur.y}`;
  }

  return d;
}
