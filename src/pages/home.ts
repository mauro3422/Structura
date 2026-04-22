/**
 * DataLab - Home Page
 */
import { registry } from '../modules/index.ts';
import { Progress } from '../core/Progress.ts';
import { renderModuleCard, renderPageHeader, renderPageShell } from '../components/templates.ts';

export function renderHome() {
  const modules = registry.getAll();

  const moduleCards = modules.map((mod, i) => renderModuleCard(mod, {
    index: i,
    idPrefix: 'home-module-card',
    progress: Progress.getModuleProgress(mod),
  })).join('');

  return renderPageShell(`
      <div class="home-hero">
        <div class="home-hero__glow"></div>
        <div class="home-hero__icon">💻</div>
        <h1 class="home-hero__title">Structura</h1>
        <p class="home-hero__subtitle">Tu plataforma de arquitectura<br>y sistemas de software</p>
      </div>

      <div class="section">
        ${renderPageHeader('¿Qué querés aprender hoy?')}
        <div class="modules-grid">
          ${moduleCards}
        </div>
      </div>

      <div class="home-footer">
        <p>Structura v1.0 • Creado para aprender en cualquier lugar</p>
      </div>
  `, { id: 'page-home' });
}
