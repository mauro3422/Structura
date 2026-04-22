export function escapeHtml(str: string) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeAttr(str: string) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function showConfirm(title: string, message: string) {
  return new Promise<boolean>((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-content anim-scale-in">
        <div class="modal-header">
          <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="modal-body">
          <p>${escapeHtml(message)}</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="modal-cancel">Cancelar</button>
          <button class="btn btn-primary" id="modal-confirm">Confirmar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cleanup = (value: boolean) => {
      const modal = overlay.querySelector('.modal-content') as HTMLElement | null;
      if (modal) modal.style.animation = 'scaleIn 0.2s reverse forwards';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        resolve(value);
      }, 200);
    };

    const cancel = overlay.querySelector('#modal-cancel') as HTMLButtonElement | null;
    const confirm = overlay.querySelector('#modal-confirm') as HTMLButtonElement | null;

    if (cancel) cancel.onclick = (event) => { event.stopPropagation(); cleanup(false); };
    if (confirm) confirm.onclick = (event) => { event.stopPropagation(); cleanup(true); };

    overlay.onclick = (event) => {
      if (event.target === overlay) cleanup(false);
    };
  });
}
