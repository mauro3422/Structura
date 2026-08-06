interface MagicActionDetail {
  step: string;
  targetId: string;
}

function isMagicActionDetail(value: unknown): value is MagicActionDetail {
  if (!value || typeof value !== 'object') return false;
  const detail = value as Partial<MagicActionDetail>;
  return typeof detail.step === 'string' && typeof detail.targetId === 'string';
}

function updateEvolutionState(card: HTMLElement, state: number) {
  const currentState = Number.parseInt(card.dataset.evolutionState || '0', 10);
  if (state <= currentState && state !== 0) return;

  card.dataset.evolutionState = String(state);

  if (state >= 1) card.classList.add('is-assembling', 'show-frame');
  if (state >= 2) card.classList.add('show-headers');
  if (state >= 3) card.classList.add('show-row-0', 'show-row-1', 'is-ready', 'is-fully-assembled');
}

function bindMagicActionBridge() {
  if (typeof window === 'undefined' || window.magicTableListenerBound) return;

  document.addEventListener('magic-action', (event) => {
    if (!(event instanceof CustomEvent) || !isMagicActionDetail(event.detail)) return;
    const { step, targetId } = event.detail;
    const cards = document.querySelectorAll<HTMLElement>(`.magic-table-card[data-table-name="${targetId}"]`);
    cards.forEach((card) => {
      let state = 0;
      if (step === 'frame') state = 1;
      if (step === 'columns' || step === 'headers') state = 2;
      if (step === 'data' || step === 'row-0') state = 3;
      updateEvolutionState(card, state);
    });
  });

  window.magicTableListenerBound = true;
}

export function setupMagicTableInteractivity() {
  bindMagicActionBridge();

  document.querySelectorAll<HTMLElement>('.magic-table-card').forEach((card) => {
    if (card.dataset.bound) return;
    card.dataset.bound = 'true';

    card.querySelectorAll<HTMLElement>('.node-evolution').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextState = Number.parseInt(node.dataset.evolution || '0', 10);
        updateEvolutionState(card, nextState);

        const triggerMap = ['frame', 'columns', 'data'];
        const stepName = triggerMap[nextState - 1];

        const triggerInText = document.querySelector<HTMLElement>(`.magic-trigger[data-step="${stepName}"][data-target="${card.dataset.tableName}"]`);
        if (triggerInText) {
          triggerInText.classList.add('is-active');
          triggerInText.classList.remove('pulse');
        }
      });
    });

    card.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (card.dataset.evolutionState === '0' && !target?.closest('.node-evolution')) {
        updateEvolutionState(card, 1);
      }
    });
  });
}
