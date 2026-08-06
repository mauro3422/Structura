import { escapeHtml } from '../Utils.ts';

export type LabFeedbackTone = 'info' | 'success' | 'warning' | 'danger';

export interface LabFeedbackSummary {
  observationCount: number;
  observationWarningCount: number;
  observationErrorCount: number;
  relationshipCount: number;
  relationshipLinkedCount: number;
  relationshipCautionCount: number;
  relationshipPendingCount: number;
  relationshipDerivedCount: number;
}

export interface LabToastOptions {
  tone?: LabFeedbackTone;
  title: string;
  message: string;
  durationMs?: number;
}

const defaultSummary: LabFeedbackSummary = {
  observationCount: 0,
  observationWarningCount: 0,
  observationErrorCount: 0,
  relationshipCount: 0,
  relationshipLinkedCount: 0,
  relationshipCautionCount: 0,
  relationshipPendingCount: 0,
  relationshipDerivedCount: 0,
};

const feedbackState = new WeakMap<HTMLElement, LabFeedbackSummary>();
const summaryTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

function getLabElement(labId: string): HTMLElement | null {
  return document.getElementById(labId);
}

function getFeedbackElement(labId: string): HTMLElement | null {
  return document.getElementById(`${labId}-feedback`);
}

function getSummaryElement(labId: string): HTMLElement | null {
  return document.getElementById(`${labId}-feedback-summary`);
}

function getToastHost(labId: string): HTMLElement | null {
  return document.getElementById(`${labId}-toasts`);
}

function getState(labId: string): LabFeedbackSummary {
  const lab = getLabElement(labId);
  if (!lab) return { ...defaultSummary };
  return feedbackState.get(lab) || { ...defaultSummary };
}

function setState(labId: string, nextState: LabFeedbackSummary): void {
  const lab = getLabElement(labId);
  if (!lab) return;
  feedbackState.set(lab, nextState);
}

function formatCount(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function getToneFromState(state: LabFeedbackSummary): LabFeedbackTone {
  if (state.observationErrorCount > 0 || state.relationshipPendingCount > 0) return 'danger';
  if (state.observationWarningCount > 0 || state.relationshipCautionCount > 0) return 'warning';
  if (state.observationCount > 0 || state.relationshipCount > 0) return 'info';
  return 'success';
}

function getHeadline(state: LabFeedbackSummary): string {
  if (state.observationErrorCount > 0 || state.relationshipPendingCount > 0) {
    return 'Hay algo para corregir';
  }

  if (state.observationWarningCount > 0 || state.relationshipCautionCount > 0) {
    return 'Hay una pista para mejorar';
  }

  if (state.observationCount > 0 || state.relationshipCount > 0) {
    return 'Vas bien';
  }

  return 'Todo listo para seguir';
}

function getMessage(state: LabFeedbackSummary): string {
  if (state.observationErrorCount > 0) {
    return 'Corregí esta parte antes de seguir.';
  }

  if (state.relationshipPendingCount > 0) {
    return 'Elegí una tabla destino para completar el enlace.';
  }

  if (state.observationWarningCount > 0 || state.relationshipCautionCount > 0) {
    return 'Son sugerencias para ordenar mejor el modelo.';
  }

  if (state.observationCount > 0 || state.relationshipCount > 0) {
    return 'Las pistas se actualizan mientras modelás.';
  }

  return 'Podés empezar agregando una tabla o editando la que ya tenés.';
}

function renderChip(label: string, value: string, toneClass = ''): string {
  return `<span class="lab-feedback__chip ${toneClass}"><strong class="lab-feedback__chip-value">${escapeHtml(value)}</strong><span class="lab-feedback__chip-label">${escapeHtml(label)}</span></span>`;
}

function renderSummary(state: LabFeedbackSummary): string {
  const tone = getToneFromState(state);
  const headline = getHeadline(state);
  const message = getMessage(state);

  return `
    <div class="lab-feedback__banner lab-feedback__banner--${tone}">
      <div class="lab-feedback__copy">
        <div class="lab-feedback__eyebrow">Pistas rápidas</div>
        <div class="lab-feedback__headline">${escapeHtml(headline)}</div>
        <div class="lab-feedback__message">${escapeHtml(message)}</div>
      </div>
      <div class="lab-feedback__chips">
        ${renderChip('observaciones', String(state.observationCount))}
        ${renderChip('errores', String(state.observationErrorCount), state.observationErrorCount > 0 ? 'is-danger' : '')}
        ${renderChip('avisos', String(state.observationWarningCount), state.observationWarningCount > 0 ? 'is-warning' : '')}
        ${renderChip('relaciones', String(state.relationshipCount))}
        ${renderChip('vinculadas', String(state.relationshipLinkedCount), state.relationshipLinkedCount > 0 ? 'is-success' : '')}
        ${renderChip('pendientes', String(state.relationshipPendingCount), state.relationshipPendingCount > 0 ? 'is-danger' : '')}
        ${renderChip('N:N', String(state.relationshipDerivedCount), state.relationshipDerivedCount > 0 ? 'is-info' : '')}
      </div>
    </div>
  `;
}

export function renderLabFeedback(labId: string): string {
  const state = getState(labId);
  return `
    <div class="lab-feedback" id="${labId}-feedback">
      <div class="lab-feedback__summary" id="${labId}-feedback-summary" aria-live="polite">
        ${renderSummary(state)}
      </div>
      <div class="lab-feedback__toasts" id="${labId}-toasts" aria-live="assertive" aria-atomic="true"></div>
    </div>
  `;
}

export function updateLabFeedbackSummary(labId: string, partial: Partial<LabFeedbackSummary>): void {
  const lab = getLabElement(labId);
  const summaryEl = getSummaryElement(labId);
  if (!lab || !summaryEl) return;

  const nextState: LabFeedbackSummary = {
    ...getState(labId),
    ...partial,
  };

  setState(labId, nextState);
  summaryEl.innerHTML = renderSummary(nextState);

  const feedback = getFeedbackElement(labId);
  if (feedback) {
    feedback.dataset.tone = getToneFromState(nextState);
    feedback.classList.add('is-updated');
    const previousTimer = summaryTimers.get(feedback);
    if (previousTimer) clearTimeout(previousTimer);
    const timer = setTimeout(() => {
      feedback.classList.remove('is-updated');
      summaryTimers.delete(feedback);
    }, 280);
    summaryTimers.set(feedback, timer);
  }
}

export function pushLabToast(labId: string, options: LabToastOptions): void {
  const host = getToastHost(labId);
  if (!host) return;

  const tone = options.tone || 'info';
  const toast = document.createElement('div');
  toast.className = `lab-toast lab-toast--${tone}`;
  toast.innerHTML = `
    <div class="lab-toast__head">
      <span class="lab-toast__title">${escapeHtml(options.title)}</span>
      <span class="lab-toast__tone">${escapeHtml(tone)}</span>
    </div>
    <div class="lab-toast__message">${escapeHtml(options.message)}</div>
  `;

  while (host.childElementCount >= 3) {
    host.lastElementChild?.remove();
  }

  host.prepend(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));

  const durationMs =
    options.durationMs ??
    (tone === 'danger' ? 3600 : tone === 'warning' ? 3200 : tone === 'success' ? 2800 : 2500);
  setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.addEventListener(
      'transitionend',
      () => {
        toast.remove();
      },
      { once: true },
    );
    setTimeout(() => toast.remove(), 220);
  }, durationMs);
}

export function showStatus(labId: string, msg: string): void {
  pushLabToast(labId, {
    tone: 'success',
    title: 'Guardado',
    message: msg,
    durationMs: 3000,
  });
}
