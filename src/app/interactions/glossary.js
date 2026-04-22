export function setupGlossarySearch() {
  const input = document.getElementById('glossary-search-input') || document.getElementById('glossary-search');
  if (!input || input.dataset.bound) return;
  input.dataset.bound = 'true';

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    const categories = document.querySelectorAll('.glossary-category');
    if (categories.length > 0) {
      let anyFound = false;
      categories.forEach(cat => {
        const items = cat.querySelectorAll('.glossary-item');
        let catHasVisibleItems = false;
        items.forEach(item => {
          const term = item.querySelector('.glossary-item__term').textContent.toLowerCase();
          const desc = item.querySelector('.glossary-item__desc').textContent.toLowerCase();
          if (term.includes(query) || desc.includes(query)) {
            item.hidden = false;
            catHasVisibleItems = true;
            anyFound = true;
          } else {
            item.hidden = true;
          }
        });
        cat.hidden = !catHasVisibleItems;
      });
      const emptyState = document.getElementById('glossary-empty');
      if (emptyState) emptyState.hidden = anyFound;
    } else {
      document.querySelectorAll('.glossary-term').forEach(term => {
        const name = term.querySelector('.glossary-term__name')?.textContent.toLowerCase() || '';
        const body = term.querySelector('.glossary-term__body p')?.textContent.toLowerCase() || '';
        const match = name.includes(query) || body.includes(query);
        term.hidden = !match;
      });
    }
  });
}
