import { initWidgetInteractions } from '../../components/widgets/index.ts';
import { renderMermaidDiagrams } from '../mermaid.ts';
import { setupQuizInteractions } from './quiz.ts';
import { setupGlossarySearch } from './glossary.ts';

export async function bindInteractions(container: HTMLElement | null = document.getElementById('main-content')) {
  if (!container) return;

  await renderMermaidDiagrams(container);
  setTimeout(() => renderMermaidDiagrams(container), 100);

  setTimeout(() => {
    setupQuizInteractions(container);
    initWidgetInteractions();
    setupGlossarySearch();
  }, 50);
}

