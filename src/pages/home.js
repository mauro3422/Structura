/**
 * DataLab - Home Page
 */
import { registry } from '../modules/index.js';
import { Progress } from '../core/Progress.js';

export function renderHome() {
  const modules = registry.getAll();

  const moduleCards = modules.map((mod, i) => {
    const progress = Progress.getModuleProgress(mod);
    const progressHtml = progress > 0 ? `
      <div style="margin-top: 12px; background: rgba(255,255,255,0.1); height: 6px; border-radius: 4px; overflow: hidden;">
        <div style="width: ${progress}%; background: var(--color-${mod.color}); height: 100%; transition: width 0.5s ease-out;"></div>
      </div>
    ` : '';

    return `
      <a class="card module-card" onclick="window.location.hash='/module/${mod.id}'" 
         id="home-module-card-${mod.id}"
         style="animation: slideUp 0.4s both ${i * 0.1}s">
        <div class="module-card__icon module-card__icon--${mod.color}">${mod.icon}</div>
        <div class="module-card__content">
          <div class="module-card__title">${mod.title}</div>
          <div class="module-card__desc">${mod.description}</div>
          <div style="margin-top: 6px">
            <span class="badge badge-${mod.color === 'primary' ? 'primary' : mod.color === 'secondary' ? 'secondary' : 'accent'}">${mod.lessons.length} lecciones</span>
          </div>
          ${progressHtml}
        </div>
        <span class="module-card__arrow">›</span>
      </a>
    `;
  }).join('');

  return `
    <div class="page" id="page-home">
      <div class="home-hero" style="animation: fadeIn 0.8s;">
        <div class="home-hero__glow"></div>
        <div class="home-hero__icon">💻</div>
        <h1 class="home-hero__title">Structura</h1>
        <p class="home-hero__subtitle">Tu plataforma de arquitectura<br>y sistemas de software</p>
      </div>

      <div class="section">
        <h2 class="section__title" style="margin-bottom: 12px">¿Qué querés aprender hoy?</h2>
        <div class="modules-grid">
          ${moduleCards}
        </div>
      </div>

      <div class="home-footer" style="margin-top: 60px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
        <p>Structura v1.0 • Creado para aprender en cualquier lugar</p>
      </div>
    </div>
  `;
}
