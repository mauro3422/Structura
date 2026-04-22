import { animStyle } from '../../components/templates.ts';

export function setupQuizInteractions(container: HTMLElement | null = document.getElementById('main-content')) {
  if (!container) return;

  container.querySelectorAll<HTMLElement>('.quiz__option').forEach((option) => {
    if (option.dataset.bound) return;
    option.dataset.bound = 'true';

    option.addEventListener('click', () => {
      const quizId = option.dataset.quizId;
      const quiz = quizId ? document.getElementById(quizId) : null;
      if (!quiz || quiz.dataset.answered === 'true') return;

      quiz.dataset.answered = 'true';
      const selected = Number.parseInt(option.dataset.option || '0', 10);
      const correct = Number.parseInt(option.dataset.correct || '0', 10);
      const explanation = quiz.dataset.explanation || '';

      quiz.querySelectorAll<HTMLElement>('.quiz__option').forEach((quizOption) => {
        const idx = Number.parseInt(quizOption.dataset.option || '0', 10);
        if (idx === correct) {
          quizOption.classList.add('correct');
        } else if (idx === selected && idx !== correct) {
          quizOption.classList.add('incorrect');
        }
      });

      const feedback = document.getElementById(`${quizId}-feedback`);
      if (!feedback) return;

      if (selected === correct) {
        if (window.showConfetti) window.showConfetti();
        feedback.innerHTML = `
          <div class="feedback-success anim-scale-in" ${animStyle({ duration: 0.3 })}>
            <strong>¡Correcto! 🎉</strong><br/>
            ${explanation}
          </div>
        `;
      } else {
        feedback.innerHTML = `
          <div class="feedback-error anim-shake">
            ❌ Incorrecto. ${explanation}
          </div>
        `;
      }
    });
  });
}
