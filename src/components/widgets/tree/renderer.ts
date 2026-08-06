import { renderTreeNode, renderTreeWidgetBody } from './markup.ts';
import type { TimelineEvent, TimelineSection } from '../../../core/moduleTypes.ts';

export function renderTreeWidget(section: TimelineSection, index: number) {
  const treeId = `interactive-tree-${index}`;
  const nodesHtml = section.events.map((event: TimelineEvent, i: number) => renderTreeNode(event, i, i === 0)).join('');
  return renderTreeWidgetBody(nodesHtml, treeId);
}
