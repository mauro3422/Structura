export function setupTreeWidgetInteractivity() {
  document.querySelectorAll('.interactive-tree').forEach(tree => {
    if (tree.dataset.bound) return;
    tree.dataset.bound = 'true';

    const buttons = tree.querySelectorAll('.tree-icon-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const thisNode = btn.closest('.tree-node');

        if (thisNode.classList.contains('visible') && !btn.dataset.clicked) {
          tree.querySelectorAll('.tree-node.focused').forEach(n => {
            if (n !== thisNode) n.classList.remove('focused');
          });
          thisNode.classList.toggle('focused');
        }

        const targetIndex = parseInt(btn.dataset.target, 10);
        const nextNode = tree.querySelector(`.tree-node[data-index="${targetIndex}"]`);

        if (nextNode && !nextNode.classList.contains('visible')) {
          btn.style.transform = 'scale(0.9)';
          setTimeout(() => btn.style.transform = 'scale(1)', 150);
          btn.dataset.clicked = 'true';

          tree.querySelectorAll('.tree-node.focused').forEach(node => {
            node.classList.remove('focused');
          });

          nextNode.classList.add('visible', 'focused');

          setTimeout(() => {
            nextNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            delete btn.dataset.clicked;
          }, 300);
        }
      });
    });
  });
}
