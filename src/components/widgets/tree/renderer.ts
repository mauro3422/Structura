import { renderTreeNode, renderTreeWidgetBody } from './markup.ts';

export function renderTreeWidget(section: any, index: number) {
  const treeId = `interactive-tree-${index}`;
  const nodesHtml = (section.events || []).map((event: any, i: number) => renderTreeNode(event, i, i === 0)).join('');
  return renderTreeWidgetBody(nodesHtml, treeId);
}
