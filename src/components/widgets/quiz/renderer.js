import { escapeAttr } from '../Utils.js';
import { renderSectionBlock } from '../../templates.js';

export function renderQuiz(section, index, lessonId) {
  const quizId = `quiz-${lessonId}-${index}`;

  const options = (section.options || []).map((opt, i) => {
    const letter = String.fromCharCode(65 + i);
    return `
      <div class="quiz__option" data-quiz-id="${quizId}" data-option="${i}" data-correct="${section.correctIndex}" id="${quizId}-opt-${i}">
        <span class="quiz__option-letter">${letter}</span>
        <span>${opt}</span>
      </div>
    `;
  }).join('');

  return renderSectionBlock(`
    <div class="quiz__question">🧠 ${section.question}</div>
    <div class="quiz__options">
      ${options}
    </div>
    <div class="quiz__feedback-container" id="${quizId}-feedback"></div>
  `, {
    className: 'quiz',
    animationClass: 'anim-slide-up',
    index,
    attrs: `id="${quizId}" data-explanation="${escapeAttr(section.explanation)}"`,
  });
}
