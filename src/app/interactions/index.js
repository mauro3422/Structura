import { initWidgetInteractions } from '../../components/widgets/index.js';
import { renderMermaidDiagrams } from '../mermaid.js';
import { setupQuizInteractions } from './quiz.js';
import { setupGlossarySearch } from './glossary.js';

export async function bindInteractions(container = document.getElementById('main-content')) {
  if (!container) return;

  await renderMermaidDiagrams(container);
  setTimeout(() => renderMermaidDiagrams(container), 100);

  setTimeout(() => {
    setupQuizInteractions(container);
    initWidgetInteractions();
    setupGlossarySearch();
  }, 50);
}
