import { renderSectionBlock } from '../../../components/templates.ts';
import { escapeHtml } from '../../../components/widgets/Utils.ts';
import { formatInlineMarkdown } from '../../../utils/inlineMarkdown.ts';
import type { StepAnimationSection } from '../../../core/Module.ts';

export function renderStepAnimation(section: StepAnimationSection, index: number) {
  const steps = (section.steps || []).map((step, stepIndex) => renderSectionBlock(`
    <span class="lesson-step-animation__marker">${stepIndex + 1}</span>
    <div class="lesson-step-animation__step-body">
      <div class="lesson-step-animation__step-icon">${escapeHtml(step.icon || '•')}</div>
      <div class="lesson-step-animation__step-text">
        ${formatInlineMarkdown(step.text || '')}
      </div>
    </div>
  `, {
    className: 'lesson-step-animation__step',
    animationClass: 'anim-slide-up',
    index: index + stepIndex,
    delayStep: 0.08,
    marginClass: '',
    attrs: `data-step="${stepIndex}"`,
  })).join('');

  return renderSectionBlock(`
    <div class="lesson-step-animation__header">
      <div>
        <div class="lesson-step-animation__eyebrow">Animación paso a paso</div>
        <h3 class="lesson-step-animation__heading">${escapeHtml(section.title || 'Secuencia')}</h3>
      </div>
      <span class="lesson-step-animation__count">${(section.steps || []).length} pasos</span>
    </div>
    <div class="lesson-step-animation__list">
      ${steps}
    </div>
  `, {
    className: 'lesson-step-animation',
    animationClass: 'anim-scale-in',
    index,
  });
}
