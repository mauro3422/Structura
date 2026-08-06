import type { TableDefinition } from '../table/types.ts';

interface GraphNode {
  table: TableDefinition;
  id: string;
  incoming: Set<string>;
  outgoing: Set<string>;
}

const DEFAULT_TABLE_WIDTH = 360;
const DEFAULT_TABLE_HEIGHT = 260;
const TREE_X_GAP = 460;
const TREE_Y_GAP = 500;
const TREE_START_X = 72;
const TREE_START_Y = 64;
const RING_CENTER_X = 720;
const RING_CENTER_Y = 440;
const RING_RADIUS = 260;

function hasExplicitPosition(table: TableDefinition): boolean {
  return typeof table.x === 'number' && typeof table.y === 'number';
}

function getTableId(table: TableDefinition, index: number): string {
  return table.tableId?.trim() || `table-${index + 1}`;
}

function createGraph(tables: TableDefinition[]): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  tables.forEach((table, index) => {
    const id = getTableId(table, index);
    graph.set(id, {
      table,
      id,
      incoming: new Set(),
      outgoing: new Set(),
    });
  });

  tables.forEach((table, sourceIndex) => {
    const sourceId = getTableId(table, sourceIndex);
    const sourceNode = graph.get(sourceId);
    if (!sourceNode) return;

    (table.columns || []).forEach((column) => {
      const targetId = column.isFK && column.references ? column.references.trim() : '';
      if (!targetId || !graph.has(targetId)) return;
      sourceNode.outgoing.add(targetId);
      graph.get(targetId)?.incoming.add(sourceId);
    });
  });

  return graph;
}

function buildComponents(graph: Map<string, GraphNode>): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  graph.forEach((node, id) => {
    if (visited.has(id)) return;
    const stack = [id];
    const component: string[] = [];
    visited.add(id);

    while (stack.length > 0) {
      const currentId = stack.pop() as string;
      const current = graph.get(currentId);
      if (!current) continue;
      component.push(currentId);

      current.outgoing.forEach((nextId) => {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          stack.push(nextId);
        }
      });

      current.incoming.forEach((prevId) => {
        if (!visited.has(prevId)) {
          visited.add(prevId);
          stack.push(prevId);
        }
      });
    }

    components.push(component);
  });

  return components;
}

function estimateTableSize(table: TableDefinition): { width: number; height: number } {
  const columnCount = Math.max((table.columns || []).length, 1);
  const rowCount = Math.max((table.rows || []).length, 1);
  const width = Math.max(DEFAULT_TABLE_WIDTH, columnCount * 120 + 140);
  const height = Math.max(DEFAULT_TABLE_HEIGHT, 176 + rowCount * 30);
  return { width, height };
}

function layoutTree(component: GraphNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const roots = component.filter((node) => node.incoming.size === 0);
  const queue = (roots.length > 0 ? roots : [component[0]]).map((node) => ({ id: node.id, level: 0 }));
  const levels = new Map<number, GraphNode[]>();
  const assignedLevel = new Map<string, number>();

  while (queue.length > 0) {
    const current = queue.shift() as { id: string; level: number };
    if (assignedLevel.has(current.id)) continue;
    assignedLevel.set(current.id, current.level);

    const levelNodes = levels.get(current.level) || [];
    const node = component.find((entry) => entry.id === current.id);
    if (node) {
      levelNodes.push(node);
      levels.set(current.level, levelNodes);

      node.outgoing.forEach((nextId) => {
        queue.push({ id: nextId, level: current.level + 1 });
      });
    }
  }

  const unresolved = component.filter((node) => !assignedLevel.has(node.id));
  if (unresolved.length > 0) {
    const deepestLevel = Math.max(...Array.from(levels.keys()), 0) + 1;
    const tail = levels.get(deepestLevel) || [];
    unresolved.forEach((node) => {
      tail.push(node);
    });
    levels.set(deepestLevel, tail);
  }

  const orderedLevels = Array.from(levels.keys()).sort((a, b) => a - b);
  orderedLevels.forEach((level) => {
    const nodes = levels.get(level) || [];
    const totalWidth = Math.max(nodes.length - 1, 0) * TREE_X_GAP;
    const startX = TREE_START_X + Math.max(0, (component.length - 1) * 0.5 * TREE_X_GAP - totalWidth / 2);
    const y = TREE_START_Y + level * TREE_Y_GAP;

    nodes.forEach((entry, index) => {
      positions.set(entry.id, {
        x: startX + index * TREE_X_GAP,
        y,
      });
    });
  });

  return positions;
}

function layoutRing(component: GraphNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const count = component.length;
  const angleStep = (Math.PI * 2) / Math.max(count, 1);

  component.forEach((node, index) => {
    const size = estimateTableSize(node.table);
    const angle = index * angleStep - Math.PI / 2;
    positions.set(node.id, {
      x: RING_CENTER_X + Math.cos(angle) * RING_RADIUS - size.width / 2,
      y: RING_CENTER_Y + Math.sin(angle) * RING_RADIUS - size.height / 2,
    });
  });

  return positions;
}

export function layoutLabTables(tables: TableDefinition[]): TableDefinition[] {
  const graph = createGraph(tables);
  if (graph.size === 0) return tables;

  const allHavePosition = tables.every(hasExplicitPosition);
  const allAtOrigin = allHavePosition && tables.every((table) => (table.x || 0) === 0 && (table.y || 0) === 0);
  if (allHavePosition && !allAtOrigin) return tables;

  const components = buildComponents(graph);
  const positioned = new Map<string, { x: number; y: number }>();

  components.forEach((componentIds) => {
    const component = componentIds.map((id) => graph.get(id)).filter((entry): entry is GraphNode => Boolean(entry));
    if (component.length === 0) return;

    const hasEdges = component.some((node) => node.outgoing.size > 0 || node.incoming.size > 0);
    const layout = hasEdges && component.length > 2 ? layoutTree(component) : layoutRing(component);
    layout.forEach((value, id) => {
      positioned.set(id, value);
    });
  });

  return tables.map((table, index) => {
    if (hasExplicitPosition(table)) return table;
    const id = getTableId(table, index);
    const position = positioned.get(id);
    if (!position) return table;
    return {
      ...table,
      x: Math.max(24, Math.round(position.x)),
      y: Math.max(24, Math.round(position.y)),
    };
  });
}

export function suggestNextTablePosition(tables: TableDefinition[]): { x: number; y: number } {
  const positioned = tables.filter(hasExplicitPosition);
  if (positioned.length === 0) {
    return { x: TREE_START_X, y: TREE_START_Y };
  }

  const rightMost = positioned.reduce((max, table) => Math.max(max, (table.x || 0) + estimateTableSize(table).width), 0);
  const bottomMost = positioned.reduce((max, table) => Math.max(max, (table.y || 0) + estimateTableSize(table).height), 0);

  if (rightMost < 1280) {
    return {
      x: rightMost + 96,
      y: TREE_START_Y,
    };
  }

  return {
    x: TREE_START_X,
    y: bottomMost + 96,
  };
}
