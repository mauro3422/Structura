/**
 * DataLab Router - Simple hash-based SPA router
 */
export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.container = null;
    this.onNavigate = null;

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('popstate', () => this.handleRoute());
  }

  setContainer(element) {
    this.container = element;
    return this;
  }

  on(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const { handler, params } = this.matchRoute(hash);

    if (handler && this.container) {
      this.currentRoute = hash;

      // Animate out current content
      this.container.style.opacity = '0';
      this.container.style.transform = 'translateY(8px)';

      setTimeout(() => {
        const content = handler(params);
        
        // Fix: Reset scroll to top on route change
        window.scrollTo(0, 0);

        if (typeof content === 'string') {
          this.container.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          this.container.innerHTML = '';
          this.container.appendChild(content);
        }

        // Call global navigate callback (for navbar updating)
        if (this.onNavigate) this.onNavigate(hash);

        // Animate in new content
        requestAnimationFrame(() => {
          this.container.style.opacity = '1';
          this.container.style.transform = 'translateY(0)';
        });
      }, 150);
    }
  }

  matchRoute(hash) {
    // Exact match first
    if (this.routes.has(hash)) {
      return { handler: this.routes.get(hash), params: {} };
    }

    // Pattern matching (e.g., /lesson/:id)
    for (const [pattern, handler] of this.routes) {
      const patternParts = pattern.split('/');
      const hashParts = hash.split('/');

      if (patternParts.length !== hashParts.length) continue;

      const params = {};
      let match = true;

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          params[patternParts[i].slice(1)] = hashParts[i];
        } else if (patternParts[i] !== hashParts[i]) {
          match = false;
          break;
        }
      }

      if (match) return { handler, params };
    }

    // Fallback to home
    return { handler: this.routes.get('/'), params: {} };
  }

  start() {
    this.handleRoute();
    return this;
  }
}

export const router = new Router();
