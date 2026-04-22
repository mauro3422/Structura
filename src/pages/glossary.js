/**
 * DataLab - Glossary Page
 * Aggregates terms from all registered modules
 */
import { registry } from '../modules/index.js';
import { renderCollapsibleTerm } from '../components/widgets/index.js';
import { renderPageHeader, renderPageShell } from '../components/templates.js';

export function renderGlossary() {
  const allTerms = registry.getAllGlossary();

  const categories = {};
  allTerms.forEach(t => {
    const cat = t.category || 'otros';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(t);
  });

  const categoryLabels = {
    fundamentos: { label: 'Fundamentos', icon: '📋' },
    claves: { label: 'Claves y Relaciones', icon: '🔑' },
    lenguajes: { label: 'Lenguajes', icon: '💻' },
    operaciones: { label: 'Operaciones', icon: '⚙️' },
    optimización: { label: 'Optimización', icon: '🚀' },
    algoritmos: { label: 'Algoritmos', icon: '🔍' },
    historia: { label: 'Historia', icon: '📝' },
  };

  let index = 0;
  const sectionsHtml = Object.entries(categories).map(([cat, terms]) => {
    const catInfo = categoryLabels[cat] || { label: cat, icon: '📎' };
    const termsHtml = terms.map((t) => {
      index++;
      const termId = `glossary-${t.term.toLowerCase().replace(/\s/g, '-')}`;
      return renderCollapsibleTerm(t.term, t.definition, index, termId);
    }).join('');

    return `
      <div class="section">
        <h2 class="section__title">${catInfo.icon} ${catInfo.label}</h2>
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
