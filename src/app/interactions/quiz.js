import { animStyle } from '../../components/templates.js';

export function setupQuizInteractions(container = document.getElementById('main-content')) {
  if (!container) return;

  container.querySelectorAll('.quiz__option').forEach(opt => {
    if (opt.dataset.bound) return;
    opt.dataset.bound = 'true';

    opt.addEventListener('click', () => {
      const quizId = opt.dataset.quizId;
      const quiz = document.getElementById(quizId);
      if (!quiz || quiz.dataset.answered === 'true') return;

      quiz.dataset.answered = 'true';
      const selected = parseInt(opt.dataset.option, 10);
      const correct = parseInt(opt.dataset.correct, 10);
      const explanation = quiz.dataset.explanation || '';

      quiz.querySelectorAll('.quiz__option').forEach(o => {
        const idx = parseInt(o.dataset.option, 10);
        if (idx === correct) {
          o.classList.add('correct');
        } else if (idx === selected && idx !== correct) {
          o.classList.add('incorrect');
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
