import { updateObservations } from './observationsView.ts';
import { updateRelationships } from './relationshipView.ts';

export function runValidation(labId: string): void {
  const lab = document.getElementById(labId);
  if (!lab) return;

  lab.querySelectorAll<HTMLElement>('.lab-table-item').forEach((item) => {
    const pks = item.querySelectorAll('.meta-toggle[data-action="toggle-pk"].active');
    const warning = item.querySelector<HTMLElement>('.lab-table-warning');
    if (warning) {
      if (pks.length === 0) warning.classList.add('visible');
      else warning.classList.remove('visible');
    }
  });

  updateObservations(labId);
  updateRelationships(labId);
}
