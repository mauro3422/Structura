import mermaid from 'mermaid';

export function initializeMermaid() {
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
    },
  });
}

export async function renderMermaidDiagrams(container: ParentNode | null) {
  if (!container) return;

  const diagrams = container.querySelectorAll<HTMLElement>('.mermaid');
  for (let i = 0; i < diagrams.length; i++) {
    const elem = diagrams[i];
    if (elem.dataset.processed) continue;

    try {
      const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
      const graphDefinition = elem.textContent || '';
      const { svg } = await mermaid.render(id, graphDefinition);
      elem.innerHTML = svg;
      elem.dataset.processed = 'true';
    } catch (error) {
      console.error('Mermaid render error:', error);
    }
  }
}
