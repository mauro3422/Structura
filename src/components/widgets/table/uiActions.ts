import { getLabState, syncLabState } from './state.ts';
import { showStatus } from './feedback.ts';

export function updateRuleHelp(chip: HTMLElement): void {
  const card = chip.closest('.lab-rule-card') as HTMLElement | null;
  if (!card) return;

  const title = chip.getAttribute('data-rule-help-title') || 'Ayuda rápida';
  const text = chip.getAttribute('data-rule-help-text') || 'Tocá otro chip para ver una pista distinta.';

  const titleEl = card.querySelector<HTMLElement>('[data-rule-help-title]');
  const textEl = card.querySelector<HTMLElement>('[data-rule-help-text]');

  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;

  card.querySelectorAll<HTMLElement>('.lab-rule-chip').forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });

  chip.classList.add('is-active');
  chip.setAttribute('aria-pressed', 'true');
}

export function saveCurrentLab(labId: string): void {
  syncLabState(labId, getLabState(labId));
  showStatus(labId, 'Tu trabajo quedó guardado.');
}
