import './styles/index.css';
import './styles/components.css';
import './styles/pages.css';

import { initApp } from './app/bootstrap.js';

document.addEventListener('DOMContentLoaded', initApp);
if (document.readyState !== 'loading') {
  initApp();
}
