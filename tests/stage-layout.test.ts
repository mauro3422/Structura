import { describe, expect, it } from 'vitest';
import { measureGraphStageContent, updateGraphStageBounds } from '../src/components/widgets/stage/index.ts';

describe('Stage layout', () => {
  it('measures absolute node bounds from stage coordinates', () => {
    document.body.innerHTML = `
      <div id="stage" class="graph-stage">
        <div class="graph-stage__surface"></div>
      </div>
    `;

    const stage = document.getElementById('stage') as HTMLElement;
    const surface = stage.querySelector<HTMLElement>('.graph-stage__surface') as HTMLElement;

    const nodeA = document.createElement('div');
    nodeA.dataset.stageNode = 'true';
    nodeA.dataset.stageX = '64';
    nodeA.dataset.stageY = '56';
    Object.defineProperty(nodeA, 'offsetWidth', { value: 320 });
    Object.defineProperty(nodeA, 'offsetHeight', { value: 240 });

    const nodeB = document.createElement('div');
    nodeB.dataset.stageNode = 'true';
    nodeB.dataset.stageX = '520';
    nodeB.dataset.stageY = '340';
    Object.defineProperty(nodeB, 'offsetWidth', { value: 340 });
    Object.defineProperty(nodeB, 'offsetHeight', { value: 260 });

    surface.append(nodeA, nodeB);

    const size = measureGraphStageContent(stage);
    expect(size.width).toBeGreaterThan(900);
    expect(size.height).toBeGreaterThan(650);
  });

  it('writes the measured size back to the surface', () => {
    document.body.innerHTML = `
      <div id="stage" class="graph-stage">
        <div class="graph-stage__surface"></div>
      </div>
    `;

    const stage = document.getElementById('stage') as HTMLElement;
    const surface = stage.querySelector<HTMLElement>('.graph-stage__surface') as HTMLElement;
    const node = document.createElement('div');
    node.dataset.stageNode = 'true';
    node.dataset.stageX = '40';
    node.dataset.stageY = '50';
    Object.defineProperty(node, 'offsetWidth', { value: 300 });
    Object.defineProperty(node, 'offsetHeight', { value: 200 });
    surface.appendChild(node);

    updateGraphStageBounds('stage');

    expect(surface.style.width).toMatch(/px$/);
    expect(surface.style.height).toMatch(/px$/);
  });
});
