import { renderTreeNode, renderTreeWidgetBody } from './markup.js';

export function renderTreeWidget(section, index) {
  const treeId = `interactive-tree-${index}`;
  const nodesHtml = (section.events || []).map((event, i) => renderTreeNode(event, i, i === 0)).join('');
  return renderTreeWidgetBody(nodesHtml, treeId);
}
