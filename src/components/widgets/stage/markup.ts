export function renderGraphViewportControls(stageId: string): string {
  return `
    <div class="graph-stage__controls">
      <div class="graph-stage__controls-group" aria-label="Controles de vista">
        <button class="btn btn-secondary btn-sm" type="button" data-viewport-action="zoom-out" aria-label="Reducir zoom">−</button>
        <button class="btn btn-secondary btn-sm" type="button" data-viewport-action="reset" aria-label="Restablecer vista">100%</button>
        <button class="btn btn-secondary btn-sm" type="button" data-viewport-action="fit" aria-label="Ajustar contenido">Ajustar</button>
        <button class="btn btn-secondary btn-sm" type="button" data-viewport-action="zoom-in" aria-label="Aumentar zoom">+</button>
      </div>
      <div class="graph-stage__status">
        <span class="graph-stage__zoom" id="${stageId}-zoom" data-viewport-zoom aria-live="polite">100%</span>
        <span class="graph-stage__hint">Arrastrá para mover. Ctrl + rueda para zoom.</span>
      </div>
    </div>
  `;
}
