export type RouteParams = Record<string, string>;
export type RouteHandler<T extends RouteParams = RouteParams> = (params: T) => string | HTMLElement | void;

/**
 * DataLab Router - Simple hash-based SPA router
 */
export class Router {
  private readonly routes = new Map<string, RouteHandler<any>>();
  private currentRoute: string | null = null;
  private container: HTMLElement | null = null;
  onNavigate: ((hash: string) => void) | null = null;

  constructor() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('popstate', () => this.handleRoute());
  }

  setContainer(element: HTMLElement) {
    this.container = element;
    return this;
  }

  on<T extends RouteParams = RouteParams>(path: string, handler: RouteHandler<T>) {
    this.routes.set(path, handler as RouteHandler<any>);
    return this;
  }

  navigate(path: string) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const { handler, params } = this.matchRoute(hash);

    if (handler && this.container) {
      this.currentRoute = hash;

      this.container.style.opacity = '0';
      this.container.style.transform = 'translateY(8px)';

      setTimeout(() => {
        try {
          const content = handler(params);

          window.scrollTo(0, 0);

          if (typeof content === 'string') {
            this.container!.innerHTML = content;
          } else if (content instanceof HTMLElement) {
            this.container!.innerHTML = '';
            this.container!.appendChild(content);
          }

          if (this.onNavigate) this.onNavigate(hash);

          requestAnimationFrame(() => {
            if (!this.container) return;
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0)';
          });
        } catch (error) {
          console.error('Route render error:', error);
          if (!this.container) return;
          this.container.innerHTML = `
            <section class="page page--error">
              <div class="page-header">
                <h1 class="page-title">Error al renderizar la ruta</h1>
                <p class="page-subtitle">La vista no pudo construirse. Revisá la consola para más detalle.</p>
              </div>
              <pre class="fatal-error-box">${String(error instanceof Error ? error.message : error)}</pre>
            </section>
          `;
          this.container.style.opacity = '1';
          this.container.style.transform = 'translateY(0)';
        }
      }, 150);
    }
  }

  private matchRoute(hash: string): { handler: RouteHandler<any> | undefined; params: RouteParams } {
    if (this.routes.has(hash)) {
      return { handler: this.routes.get(hash), params: {} };
    }

    for (const [pattern, handler] of this.routes) {
      const patternParts = pattern.split('/');
      const hashParts = hash.split('/');

      if (patternParts.length !== hashParts.length) continue;

      const params: RouteParams = {};
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

    return { handler: this.routes.get('/'), params: {} };
  }

  start() {
    this.handleRoute();
    return this;
  }
}

export const router = new Router();
