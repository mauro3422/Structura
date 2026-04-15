/**
 * DataLab - Navbar Component
 */
export function createNavbar() {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Inicio', path: '/' },
    { id: 'modules', icon: '📚', label: 'Módulos', path: '/modules' },
    { id: 'glossary', icon: '📖', label: 'Glosario', path: '/glossary' },
  ];

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.id = 'main-navbar';

  nav.innerHTML = tabs.map(tab => `
    <button class="navbar__item" data-tab="${tab.id}" data-path="${tab.path}" id="nav-${tab.id}">
      <span class="navbar__icon">${tab.icon}</span>
      <span class="navbar__label">${tab.label}</span>
    </button>
  `).join('');

  // Click handlers
  nav.querySelectorAll('.navbar__item').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = btn.dataset.path;
    });
  });

  return nav;
}

export function updateNavbar(currentHash) {
  const items = document.querySelectorAll('.navbar__item');
  items.forEach(item => {
    const path = item.dataset.path;
    const isActive = currentHash === path ||
      (path === '/modules' && currentHash.startsWith('/module')) ||
      (path === '/modules' && currentHash.startsWith('/lesson'));

    item.classList.toggle('navbar__item--active', isActive);
  });
}
