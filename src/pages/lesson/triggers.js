import { formatInlineMarkdown } from '../../utils/inlineMarkdown.js';

export function parseTextWithTriggers(text) {
  const regex = /\[\[trigger:([\w-]+):([\w-]+)\|([^\]]+)\]\]/g;
  return formatInlineMarkdown(text).replace(regex, (match, step, target, label) => {
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

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.magic-trigger');
    if (!trigger) return;

    const { step, target } = trigger.dataset;
    console.log(`[PROBE] 🎯 Trigger Clicked:`, { step, target });

    const event = new CustomEvent('magic-action', {
      detail: { step, targetId: target },
    });
    document.dispatchEvent(event);

    trigger.classList.add('is-active');
    trigger.classList.remove('pulse');
  });
}
