import { formatInlineMarkdown } from '../../utils/inlineMarkdown.ts';

type TriggerBridgeEvent = CustomEvent<{ step: string; targetId: string | undefined }>;

export function parseTextWithTriggers(text: string) {
  const regex = /\[\[trigger:([\w-]+):([\w-]+)\|([^\]]+)\]\]/g;
  return formatInlineMarkdown(text).replace(regex, (_match, step: string, target: string, label: string) => {
    return `<span class="magic-trigger pulse"
                  data-step="${step}"
                  data-target="${target}"
                  title="Haz clic para ver ${label}">
              ${label}
            </span>`;
  });
}

export function installMagicTriggerBridge() {
  if (typeof document === 'undefined' || document._magicTriggerBridgeBound) return;

  document._magicTriggerBridgeBound = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const trigger = target.closest('.magic-trigger');
    if (!(trigger instanceof HTMLElement)) return;

    const { step, target: targetId } = trigger.dataset;
    console.log(`[PROBE] ?? Trigger Clicked:`, { step, target: targetId });

    const magicEvent: TriggerBridgeEvent = new CustomEvent('magic-action', {
      detail: { step: step || '', targetId },
    });
    document.dispatchEvent(magicEvent);

    trigger.classList.add('is-active');
    trigger.classList.remove('pulse');
  });
}
