import { describe, expect, it } from 'vitest';
import { renderHome } from '../src/pages/home.ts';
import { renderModuleDetail, renderModules } from '../src/pages/modules.ts';

describe('Navigation pages', () => {
  it('renders the home and modules shells with the module grid', () => {
    const homeHtml = renderHome();
    const modulesHtml = renderModules();

    expect(homeHtml).toContain('page-home');
    expect(homeHtml).toContain('modules-grid');
    expect(modulesHtml).toContain('page-modules');
    expect(modulesHtml).toContain('modules-grid');
  });

  it('renders an existing module detail page', () => {
    const html = renderModuleDetail({ id: 'estructura-datos' });

    expect(html).toContain('page-module-detail');
    expect(html).toContain('Lecciones');
    expect(html).toContain('Estructura de Datos');
  });
});
