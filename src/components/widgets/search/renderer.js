import { renderSectionBlock } from '../../templates.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    }

    cell.className = 'search-cell search-cell--eliminated';
  }

  status.textContent = `❌ No encontrado después de ${values.length} comparaciones`;
}

async function runBinarySearch(animId, values, target, status) {
  let left = 0;
  let right = values.length - 1;
  let step = 0;

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
      for (let i = left; i <= mid; i++) {
        const c = document.getElementById(`${animId}-cell-${i}`);
        if (c) c.className = 'search-cell search-cell--eliminated';
      }
      status.textContent = `Paso ${step}: ${values[mid]} < ${target}, buscamos en la mitad derecha →`;
      left = mid + 1;
    } else {
      for (let i = mid; i <= right; i++) {
        const c = document.getElementById(`${animId}-cell-${i}`);
        if (c) c.className = 'search-cell search-cell--eliminated';
      }
      status.textContent = `Paso ${step}: ${values[mid]} > ${target}, buscamos en la mitad izquierda ←`;
      right = mid - 1;
    }

    await sleep(600);

    for (let i = left; i <= right; i++) {
      const c = document.getElementById(`${animId}-cell-${i}`);
      if (c) c.className = 'search-cell search-cell--range';
    }

    await sleep(400);
  }

  status.textContent = `❌ No encontrado después de ${step} pasos`;
}

export function renderSearchAnimation(section, index, lessonId) {
  const animId = `search-anim-${lessonId}-${index}`;
  const cells = (section.data || []).map((val, i) => `
    <div class="search-cell" id="${animId}-cell-${i}" data-value="${val}">${val}</div>
  `).join('');

  return renderSectionBlock(`
      <div class="search-animation__header">
        <span class="badge badge-primary">Buscando: ${section.target}</span>
        <button class="btn btn-sm btn-secondary" id="${animId}-play" data-anim-id="${animId}">
          ▶ Iniciar
        </button>
      </div>
      <div class="search-animation__cells" id="${animId}-cells">
        ${cells}
      </div>
      <div class="search-animation__status" id="${animId}-status">
        Tocá "Iniciar" para ver el algoritmo en acción
      </div>
  `, {
    className: 'search-animation',
    animationClass: 'anim-scale-in',
    index,
    attrs: `id="${animId}" data-algorithm="${section.algorithm}" data-target="${section.target}" data-values="${(section.data || []).join(',')}"`,
  });
}

export function setupSearchAnimations() {
  document.querySelectorAll('[id$="-play"]').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', async () => {
      const animId = btn.dataset.animId;
      const container = document.getElementById(animId);
      if (!container) return;

      const algorithm = container.dataset.algorithm;
      const target = parseInt(container.dataset.target, 10);
      const values = container.dataset.values.split(',').map(Number);

      if (btn.dataset.isPlaying === 'true') return;
      btn.dataset.isPlaying = 'true';
      btn.disabled = true;
      btn.textContent = '⏳ Buscando...';

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

      delete btn.dataset.isPlaying;
      btn.disabled = false;
      btn.textContent = '🔁 Repetir';
    });
  });
}
