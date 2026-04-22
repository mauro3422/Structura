import './styles/index.css';
import './styles/components.css';
import './styles/pages.css';

import { initApp } from './app/bootstrap.ts';

function escapeText(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[char] || char));
}

function renderFatalError(error: unknown) {
  const app = document.getElementById('app');
  const message = error instanceof Error ? error.message : String(error);

  if (app) {
    app.innerHTML = `
      <main class="main-content">
        <div class="page page--error">
          <div class="page-header">
            <h1 class="page-title">No se pudo cargar la app</h1>
            <p class="page-subtitle">Hubo un error al inicializar la interfaz. Reintentá recargando la página.</p>
          </div>
          <pre class="fatal-error-box">${escapeText(message)}</pre>
        </div>
      </main>
    `;
    return;
  }

  console.error('Fatal app init error:', error);
}

function bootApp() {
  try {
    initApp();
  } catch (error) {
    renderFatalError(error);
    throw error;
  }
}

window.addEventListener('error', (event) => {
  renderFatalError(event.error || event.message || 'Error desconocido');
});

window.addEventListener('unhandledrejection', (event) => {
  renderFatalError(event.reason || 'Promesa rechazada sin manejar');
});

document.addEventListener('DOMContentLoaded', bootApp);
if (document.readyState !== 'loading') {
  bootApp();
}
