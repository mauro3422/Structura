import { Router } from '../router.js';
import { createNavbar, updateNavbar } from '../components/navbar.js';
import { renderHome } from '../pages/home.js';
import { renderModules, renderModuleDetail } from '../pages/modules.js';
import { renderLesson } from '../pages/lesson.js';
import { renderGlossary } from '../pages/glossary.js';
import { Progress } from '../core/Progress.js';
import { initializeMermaid } from './mermaid.js';
import { bindInteractions } from './interactions/index.js';

export function initApp() {
  initializeMermaid();

  window.markCompleted = function(lessonId) {
    Progress.markLessonCompleted(lessonId);
  };

  const app = document.getElementById('app');
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
  router.on('/module/:id', (params) => renderModuleDetail(params));
  router.on('/lesson/:id', (params) => renderLesson(params));
  router.on('/glossary', () => renderGlossary());

  router.onNavigate = (hash) => {
    updateNavbar(hash);
    setTimeout(() => bindInteractions(main), 100);
  };

  router.start();
}
