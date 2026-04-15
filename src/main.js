/**
 * DataLab - Main Application Entry Point
 */
import './styles/index.css';
import './styles/components.css';
import './styles/pages.css';

import { Router } from './router.js';
import { createNavbar, updateNavbar } from './components/navbar.js';
import { renderHome } from './pages/home.js';
import { renderModules, renderModuleDetail } from './pages/modules.js';
import { renderLesson } from './pages/lesson.js';
import { renderGlossary } from './pages/glossary.js';
import { Progress } from './core/Progress.js';
import mermaid from 'mermaid';

// Initialize Mermaid with custom brand colors
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: 'rgba(255, 255, 255, 0.05)',
    primaryTextColor: '#fff',
    primaryBorderColor: '#6366f1',
    lineColor: '#6366f1',
    secondaryColor: '#ec4899',
    tertiaryColor: '#1e1e2e',
    fontFamily: '"Geist", "Inter", sans-serif',
  }
});

// Global hook for progress marking via inline HTML onclicks
window.markCompleted = function(lessonId) {
  Progress.markLessonCompleted(lessonId);
};

// --- App Init ---
function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = ''; // Prevent double render

  // Create main content container
  const main = document.createElement('main');
  main.id = 'main-content';
  main.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
  app.appendChild(main);

  // Create and append navbar
  const navbar = createNavbar();
  app.appendChild(navbar);

  // Setup router
  const router = new Router();
  router.setContainer(main);

  router.on('/', () => renderHome());
  router.on('/modules', () => renderModules());
  router.on('/module/:id', (params) => renderModuleDetail(params));
  router.on('/lesson/:id', (params) => renderLesson(params));
  router.on('/glossary', () => renderGlossary());

  // Update navbar on route change
  router.onNavigate = (hash) => {
    updateNavbar(hash);
    // Setup interactive elements after render
    setTimeout(() => setupInteractivity(), 100);
  };

  // Start routing
  router.start();
}

// --- Interactive Elements Setup ---
function setupInteractivity() {
  // Render diagrams
  try {
    mermaid.run({ querySelector: '.mermaid' });
  } catch (e) {
    console.warn('Mermaid rendering skipped or failed:', e);
  }

  setupQuizzes();
  setupAddRowButtons();
  setupAddColumnButtons();
  setupSearchAnimations();
  setupGlossarySearch();
  setupTimelineSliders();
}

// --- Timeline Interactivity ---
function setupTimelineSliders() {
  document.querySelectorAll('.timeline-slider').forEach(slider => {
    if (slider.dataset.bound) return;
    slider.dataset.bound = 'true';

    const track = slider.querySelector('.timeline-slider__track');
    const prevBtn = slider.querySelector('.timeline-btn-prev');
    const nextBtn = slider.querySelector('.timeline-btn-next');
    const dots = slider.querySelectorAll('.timeline-dot');
    
    const slides = slider.querySelectorAll('.timeline-slide');
    
    let current = parseInt(slider.dataset.current, 10);
    const total = parseInt(slider.dataset.total, 10);

    const updateSlider = () => {
      // Move track
      track.style.transform = `translateX(-${current * 100}%)`;
      
      // Update buttons
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;

      // Update dots & slides
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
      });
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === current);
      });
      
      slider.dataset.current = current;
    };

    prevBtn.addEventListener('click', () => {
      if (current > 0) {
        current--;
        updateSlider();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (current < total - 1) {
        current++;
        updateSlider();
      }
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        current = index;
        updateSlider();
      });
    });
  });
}

// --- Quiz Interactions ---
function setupQuizzes() {
  document.querySelectorAll('.quiz__option').forEach(option => {
    if (option.dataset.bound) return;
    option.dataset.bound = 'true';

    option.addEventListener('click', () => {
      const quizId = option.dataset.quizId;
      const quiz = document.getElementById(quizId);
      if (!quiz || quiz.dataset.answered === 'true') return;

      quiz.dataset.answered = 'true';
      const selected = parseInt(option.dataset.option);
      const correct = parseInt(option.dataset.correct);
      const explanation = quiz.dataset.explanation;

      // Mark all options
      const options = quiz.querySelectorAll('.quiz__option');
      options.forEach(opt => {
        const idx = parseInt(opt.dataset.option);
        if (idx === correct) {
          opt.classList.add('quiz__option--correct');
        } else if (idx === selected && idx !== correct) {
          opt.classList.add('quiz__option--wrong');
        }
      });

      // Show feedback
      const feedbackContainer = document.getElementById(`${quizId}-feedback`);
      if (feedbackContainer) {
        const isCorrect = selected === correct;
        feedbackContainer.innerHTML = `
          <div class="quiz__feedback quiz__feedback--${isCorrect ? 'correct' : 'wrong'}">
            ${isCorrect ? '✅ ¡Correcto! ' : '❌ Incorrecto. '}${explanation}
          </div>
        `;
      }
    });
  });
}

// --- Add Row to Interactive Tables ---
function setupAddRowButtons() {
  document.querySelectorAll('.data-table__add-row').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
      const tableId = btn.dataset.tableId;
      const columns = JSON.parse(btn.dataset.columns);
      let rowCount = parseInt(btn.dataset.rowCount) || 0;
      rowCount++;
      btn.dataset.rowCount = rowCount;

      const tbody = document.getElementById(`${tableId}-body`);
      if (!tbody) return;

      const tr = document.createElement('tr');
      tr.classList.add('row-new');
      tr.dataset.row = rowCount;

      columns.forEach((col, ci) => {
        const td = document.createElement('td');
        if (col.autoIncrement) {
          td.textContent = rowCount;
        } else {
          td.contentEditable = 'true';
          td.dataset.col = ci;
          td.dataset.placeholder = col.placeholder || '';
          td.setAttribute('data-placeholder', col.placeholder || '');
        }
        tr.appendChild(td);
      });

      // Add cells for any dynamically added columns
      const headerRow = document.getElementById(`${tableId}-header`);
      if (headerRow) {
        const dynamicCols = headerRow.querySelectorAll('.data-table__dynamic-col');
        dynamicCols.forEach(() => {
          const td = document.createElement('td');
          td.contentEditable = 'true';
          tr.appendChild(td);
        });
      }

      // Add the extra col cell placeholder if table supports adding columns
      const hasExtraCol = btn.dataset.hasExtraCol === 'true';
      if (hasExtraCol) {
        const extraTd = document.createElement('td');
        extraTd.className = 'data-table__extra-col-cell';
        tr.appendChild(extraTd);
      }

      tbody.appendChild(tr);

      // Scroll to new row
      tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

// --- Add Column to Interactive Tables ---
function setupAddColumnButtons() {
  document.querySelectorAll('.data-table__add-col').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
      const tableId = btn.dataset.tableId;
      let colCount = parseInt(btn.dataset.colCount) || 0;
      colCount++;
      btn.dataset.colCount = colCount;

      const headerRow = document.getElementById(`${tableId}-header`);
      const tbody = document.getElementById(`${tableId}-body`);
      if (!headerRow || !tbody) return;

      // Create column name prompt
      const colName = prompt('Nombre de la nueva columna:', `Columna_${colCount}`);
      if (!colName) return;

      // Ask for type
      const colType = prompt('Tipo de dato (INT, VARCHAR, FLOAT, DATE, BOOLEAN):', 'VARCHAR');

      // Create header cell - insert BEFORE the add-col button header
      const addColTh = headerRow.querySelector('.data-table__add-col-th');
      const th = document.createElement('th');
      th.className = 'data-table__dynamic-col';
      th.innerHTML = `
        ${colName}
        <span class="col-type">${(colType || 'VARCHAR').toUpperCase()}</span>
      `;
      th.style.animation = 'scaleIn 0.3s both';
      headerRow.insertBefore(th, addColTh);

      // Add a cell to every existing row
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(row => {
        const extraCell = row.querySelector('.data-table__extra-col-cell');
        const td = document.createElement('td');
        td.contentEditable = 'true';
        td.style.animation = 'scaleIn 0.3s both';
        if (extraCell) {
          row.insertBefore(td, extraCell);
        } else {
          row.appendChild(td);
        }
      });
    });
  });
}

// --- Search Algorithm Animations ---
function setupSearchAnimations() {
  document.querySelectorAll('[id$="-play"]').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', async () => {
      const animId = btn.dataset.animId;
      const container = document.getElementById(animId);
      if (!container) return;

      const algorithm = container.dataset.algorithm;
      const target = parseInt(container.dataset.target);
      const values = container.dataset.values.split(',').map(Number);

      btn.disabled = true;
      btn.textContent = '⏳ Buscando...';

      // Reset all cells
      values.forEach((_, i) => {
        const cell = document.getElementById(`${animId}-cell-${i}`);
        if (cell) {
          cell.className = 'search-cell';
        }
      });

      const status = document.getElementById(`${animId}-status`);

      if (algorithm === 'linear') {
        await runLinearSearch(animId, values, target, status);
      } else if (algorithm === 'binary') {
        await runBinarySearch(animId, values, target, status);
      }

      btn.disabled = false;
      btn.textContent = '🔄 Repetir';
    });
  });
}

async function runLinearSearch(animId, values, target, status) {
  for (let i = 0; i < values.length; i++) {
    const cell = document.getElementById(`${animId}-cell-${i}`);
    if (!cell) continue;

    cell.className = 'search-cell search-cell--checking';
    status.textContent = `Paso ${i + 1}: Comparando ${values[i]} con ${target}...`;

    await sleep(600);

    if (values[i] === target) {
      cell.className = 'search-cell search-cell--found';
      status.textContent = `✅ ¡Encontrado en la posición ${i}! (${i + 1} comparaciones)`;
      return;
    } else {
      cell.className = 'search-cell search-cell--eliminated';
    }
  }
  status.textContent = `❌ No encontrado después de ${values.length} comparaciones`;
}

async function runBinarySearch(animId, values, target, status) {
  let left = 0;
  let right = values.length - 1;
  let step = 0;

  // Highlight initial range
  for (let i = left; i <= right; i++) {
    const cell = document.getElementById(`${animId}-cell-${i}`);
    if (cell) cell.className = 'search-cell search-cell--range';
  }
  await sleep(400);

  while (left <= right) {
    step++;
    const mid = Math.floor((left + right) / 2);
    const cell = document.getElementById(`${animId}-cell-${mid}`);

    if (cell) cell.className = 'search-cell search-cell--checking';
    status.textContent = `Paso ${step}: Mirando la mitad → posición ${mid} (valor: ${values[mid]})`;

    await sleep(800);

    if (values[mid] === target) {
      if (cell) cell.className = 'search-cell search-cell--found';
      status.textContent = `✅ ¡Encontrado en la posición ${mid}! (solo ${step} pasos)`;
      return;
    } else if (values[mid] < target) {
      // Eliminate left half
      for (let i = left; i <= mid; i++) {
        const c = document.getElementById(`${animId}-cell-${i}`);
        if (c) c.className = 'search-cell search-cell--eliminated';
      }
      status.textContent = `Paso ${step}: ${values[mid]} < ${target}, buscamos en la mitad derecha →`;
      left = mid + 1;
    } else {
      // Eliminate right half
      for (let i = mid; i <= right; i++) {
        const c = document.getElementById(`${animId}-cell-${i}`);
        if (c) c.className = 'search-cell search-cell--eliminated';
      }
      status.textContent = `Paso ${step}: ${values[mid]} > ${target}, buscamos en la mitad izquierda ←`;
      right = mid - 1;
    }

    await sleep(600);

    // Highlight new range
    for (let i = left; i <= right; i++) {
      const c = document.getElementById(`${animId}-cell-${i}`);
      if (c) c.className = 'search-cell search-cell--range';
    }

    await sleep(400);
  }

  status.textContent = `❌ No encontrado después de ${step} pasos`;
}

// --- Glossary Search ---
function setupGlossarySearch() {
  const input = document.getElementById('glossary-search-input');
  if (!input || input.dataset.bound) return;
  input.dataset.bound = 'true';

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.glossary-term').forEach(term => {
      const name = term.querySelector('.glossary-term__name')?.textContent.toLowerCase() || '';
      const body = term.querySelector('.glossary-term__body p')?.textContent.toLowerCase() || '';
      const match = name.includes(query) || body.includes(query);
      term.style.display = match ? '' : 'none';
    });
  });
}

// --- Utility ---
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Boot ---
document.addEventListener('DOMContentLoaded', initApp);
// Also handle case where DOM is already loaded
if (document.readyState !== 'loading') {
  initApp();
}
