import { Router } from '../router.js';
import { createNavbar, updateNavbar } from '../components/navbar.js';
import { renderHome } from '../pages/home.ts';
import { renderModules, renderModuleDetail } from '../pages/modules.ts';
import { renderLesson } from '../pages/lesson.ts';
import { renderGlossary } from '../pages/glossary.ts';
import { Progress } from '../core/Progress.ts';
import { initializeMermaid } from './mermaid.ts';
import { bindInteractions } from './interactions/index.ts';

export function initApp() {
  initializeMermaid();

  window.markCompleted = function(lessonId) {
    Progress.markLessonCompleted(lessonId);
  };

  const app = document.getElementById('app');
  if (!app) throw new Error('App container not found');
  app.innerHTML = '';

  const main = document.createElement('main');
  main.id = 'main-content';
  main.className = 'main-content';
  app.appendChild(main);

  const navbar = createNavbar();
  app.appendChild(navbar);

  const router = new Router();
  router.setContainer(main);

  router.on('/', () => renderHome());
  router.on('/modules', () => renderModules());
  router.on('/module/:id', (params: { id: string }) => renderModuleDetail(params));
  router.on('/lesson/:id', (params: { id: string }) => renderLesson(params));
  router.on('/glossary', () => renderGlossary());

  router.onNavigate = (hash: string) => {
    updateNavbar(hash);
    setTimeout(() => bindInteractions(main), 100);
  };

  router.start();
}

