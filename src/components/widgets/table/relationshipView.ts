import { TableLabAnalyzer } from './analyzer.ts';
import { updateLabFeedbackSummary } from './feedback.ts';
import { getLabState as readLabState } from './reader.ts';
import { renderRelationshipsPanel } from './panels.ts';
import { drawRelationshipLayer } from './relationshipLayer.ts';

export function renderRelationshipView(labId: string): void {
  drawRelationshipLayer(labId);
  const analyzer = new TableLabAnalyzer(readLabState(labId));
  const relationships = analyzer.getRelationships();
  updateLabFeedbackSummary(labId, {
    relationshipCount: relationships.length,
    relationshipLinkedCount: relationships.filter((item) => item.status === 'linked').length,
    relationshipCautionCount: relationships.filter((item) => item.status === 'caution').length,
    relationshipPendingCount: relationships.filter((item) => item.status === 'missing-target' || item.status === 'missing-reference').length,
    relationshipDerivedCount: relationships.filter((item) => item.relationshipKind === 'derived').length,
  });
  renderRelationshipsPanel(labId, relationships);
}

export function updateRelationships(labId: string): void {
  renderRelationshipView(labId);
}
