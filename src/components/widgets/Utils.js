export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function showConfirm(title, message) {
  return new Promise((resolve) => {
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
    
    const cleanup = (value) => {
      const modal = overlay.querySelector('.modal-content');
      modal.style.animation = 'scaleIn 0.2s reverse forwards';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        resolve(value);
      }, 200);
    };
    
    overlay.querySelector('#modal-cancel').onclick = (e) => { e.stopPropagation(); cleanup(false); };
    overlay.querySelector('#modal-confirm').onclick = (e) => { e.stopPropagation(); cleanup(true); };
    
    overlay.onclick = (e) => {
      if (e.target === overlay) cleanup(false);
    };
  });
}
