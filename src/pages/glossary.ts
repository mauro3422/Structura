import { registry } from '../modules/index.ts';
import { renderCollapsibleTerm } from '../components/widgets/index.ts';
import { renderPageHeader, renderPageShell } from '../components/templates.ts';

export function renderGlossary() {
  const allTerms = registry.getAllGlossary();

  const categories: Record<string, typeof allTerms> = {};
  allTerms.forEach((term) => {
    const category = term.category || 'otros';
    if (!categories[category]) categories[category] = [];
    categories[category].push(term);
  });

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    fundamentos: { label: 'Fundamentos', icon: '📋' },
    claves: { label: 'Claves y Relaciones', icon: '🔑' },
    lenguajes: { label: 'Lenguajes', icon: '💻' },
    operaciones: { label: 'Operaciones', icon: '⚙️' },
    optimizacion: { label: 'Optimización', icon: '🚀' },
    algoritmos: { label: 'Algoritmos', icon: '🔍' },
    historia: { label: 'Historia', icon: '📝' },
  };

  let index = 0;
  const sectionsHtml = Object.entries(categories).map(([category, terms]) => {
    const categoryInfo = categoryLabels[category] || { label: category, icon: '📎' };
    const termsHtml = terms.map((term) => {
      index += 1;
      const termId = `glossary-${term.term.toLowerCase().replace(/\s/g, '-')}`;
      return renderCollapsibleTerm(term.term, term.definition, index, termId);
    }).join('');

    return `
      <div class="section">
        <h2 class="section__title">${categoryInfo.icon} ${categoryInfo.label}</h2>
        ${termsHtml}
      </div>
    `;
  }).join('');

  return renderPageShell(`
      ${renderPageHeader('Glosario', 'Todos los términos que necesitás saber')}
      <div class="glossary-search-wrapper">
        <input type="text" class="glossary-search" placeholder="🔍 Buscar término..." id="glossary-search-input" />
      </div>
      <div class="glossary-content">
        ${sectionsHtml}
      </div>
      <div id="glossary-empty" hidden class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <div class="empty-state__title">No encontramos nada</div>
        <div class="empty-state__desc">Probá con otra palabra o borrá el filtro</div>
      </div>
  `, { id: 'page-glossary' });
}
