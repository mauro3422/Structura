/**
 * DataLab - Glossary Page
 * Aggregates terms from all registered modules
 */
import { registry } from '../modules/index.js';

export function renderGlossary() {
  const allTerms = registry.getAllGlossary();

  // Group by category
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
    historia: { label: 'Historia', icon: '📜' },
  };

  let index = 0;
  const sectionsHtml = Object.entries(categories).map(([cat, terms]) => {
    const catInfo = categoryLabels[cat] || { label: cat, icon: '📎' };
    const termsHtml = terms.map((t) => {
      index++;
      return `
        <div class="glossary-term card" style="animation: slideUp 0.3s both ${index * 0.05}s" id="glossary-${t.term.toLowerCase().replace(/\s/g, '-')}">
          <div class="glossary-term__header" onclick="this.parentElement.classList.toggle('glossary-term--expanded')">
            <span class="glossary-term__name">${t.term}</span>
            <span class="glossary-term__toggle">+</span>
          </div>
          <div class="glossary-term__body">
            <p>${t.definition}</p>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="section">
        <h2 class="section__title">${catInfo.icon} ${catInfo.label}</h2>
        ${termsHtml}
      </div>
    `;
  }).join('');

  return `
    <div class="page" id="page-glossary">
      <div class="page-header">
        <h1 class="page-title">Glosario</h1>
        <p class="page-subtitle">Todos los términos que necesitás saber</p>
      </div>
      <div class="glossary-search-wrapper">
        <input type="text" class="glossary-search" placeholder="🔍 Buscar término..." id="glossary-search-input" />
      </div>
      ${sectionsHtml}
    </div>
  `;
}
