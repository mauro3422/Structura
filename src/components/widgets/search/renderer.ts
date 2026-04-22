import { renderSectionBlock } from '../../templates.ts';
import { runBinarySearch, runLinearSearch } from './logic.ts';
import type { LessonSection, SearchAnimationSection } from '../../../core/Module.ts';

export function renderSearchAnimation(section: LessonSection, index: number, lessonId: string) {
  const searchSection = section as SearchAnimationSection;
  const animId = `search-anim-${lessonId}-${index}`;
  const cells = (searchSection.data || [])
    .map(
      (val: number | string, i: number) => `
    <div class="search-cell" id="${animId}-cell-${i}" data-value="${val}">${val}</div>
  `,
    )
    .join('');

  return renderSectionBlock(
    `
      <div class="search-animation__header">
        <span class="badge badge-primary">Buscando: ${searchSection.target}</span>
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
  `,
    {
      className: 'search-animation',
      animationClass: 'anim-scale-in',
      index,
      attrs: `id="${animId}" data-algorithm="${searchSection.algorithm}" data-target="${searchSection.target}" data-values="${(searchSection.data || []).join(',')}"`,
    },
  );
}

export function setupSearchAnimations() {
  document.querySelectorAll<HTMLButtonElement>('[id$="-play"]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', async () => {
      const animId = btn.dataset.animId;
      if (!animId) return;

      const container = document.getElementById(animId);
      if (!container) return;

      const algorithm = container.dataset.algorithm || '';
      const target = Number.parseInt(container.dataset.target || '0', 10);
      const values = (container.dataset.values || '')
        .split(',')
        .filter((value) => value.length > 0)
        .map((value) => Number(value));

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
