/**
 * DataLab - Home Page
 */
import { registry } from '../modules/index.ts';
import { renderPageHeader, renderPageShell } from '../components/templates.ts';
import { renderModuleCards } from './moduleCards.ts';

export function renderHome() {
  const modules = registry.getAll();

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
          ${renderModuleCards(modules, { idPrefix: 'home-module-card' })}
        </div>
      </div>

      <div class="home-footer">
        <p>Structura v1.0 • Creado para aprender en cualquier lugar</p>
      </div>
  `, { id: 'page-home' });
}
