import { escapeHtml } from '../Utils.ts';
import type { TableObservation, TableRelationship } from './types.ts';

function renderObservationItem(observation: TableObservation): string {
  return `
    <div class="lab-observation-item lab-observation-item--${observation.kind}">
      <div class="lab-observation-item__head">
        <span class="lab-observation-item__title">${escapeHtml(observation.title)}</span>
        <span class="lab-observation-item__kind">${escapeHtml(observation.kind)}</span>
      </div>
      <div class="lab-observation-item__message">${escapeHtml(observation.message)}</div>
      ${observation.hint ? `<div class="lab-observation-item__hint">${escapeHtml(observation.hint)}</div>` : ''}
      ${observation.subject ? `<div class="lab-observation-item__subject">${escapeHtml(observation.subject)}</div>` : ''}
    </div>
  `;
}

export function renderObservationsPanel(labId: string, observations: TableObservation[]): void {
  const panel = document.getElementById(`${labId}-observations`);
  if (!panel) return;

  const errorCount = observations.filter((item) => item.kind === 'error').length;
  const warningCount = observations.filter((item) => item.kind === 'warning').length;

  panel.innerHTML = `
    <div class="lab-observations-panel__header">
      <div>
        <div class="lab-observations-panel__title">Observaciones</div>
        <div class="lab-observations-panel__subtitle">Sugerencias y alertas para modelar mejor tus tablas</div>
      </div>
      <div class="lab-observations-panel__stats">
        <span class="lab-observations-panel__chip">${observations.length} total</span>
        ${warningCount > 0 ? `<span class="lab-observations-panel__chip is-warning">${warningCount} avisos</span>` : ''}
        ${errorCount > 0 ? `<span class="lab-observations-panel__chip is-danger">${errorCount} errores</span>` : ''}
      </div>
    </div>
    ${
      observations.length > 0
        ? `<div class="lab-observations-list">${observations.map((item) => renderObservationItem(item)).join('')}</div>`
        : `<div class="lab-observations-empty">No hay observaciones por ahora. Tu modelo está bastante limpio.</div>`
    }
  `;
}

function renderRelationshipItem(item: TableRelationship): string {
  const stateLabel =
    item.status === 'linked'
      ? 'OK'
      : item.status === 'derived'
        ? 'N:N inferida'
        : item.status === 'caution'
          ? 'Revisar'
          : item.status === 'missing-target'
            ? 'Destino ausente'
            : 'Falta destino';

  const pairLabel =
    item.relationshipKind === 'derived'
      ? `${item.sourceTable || 'Tabla sin nombre'} <-> ${item.targetTable || 'Tabla sin nombre'}`
      : `${item.sourceTable || 'Tabla sin nombre'}.${item.sourceColumn} → ${item.targetTable || 'Sin destino'}`;

  return `
    <div class="lab-relation-item lab-relation-item--${item.status} lab-relation-item--${item.relationshipKind}">
      <div class="lab-relation-item__top">
        <span class="lab-relation-item__pair">${escapeHtml(pairLabel)}</span>
        <span class="lab-relation-item__badge">${escapeHtml(item.cardinality)}</span>
      </div>
      ${item.bridgeTable ? `<div class="lab-relation-item__bridge">Vía ${escapeHtml(item.bridgeTable)}</div>` : ''}
      <div class="lab-relation-item__roles">
        <span class="lab-relation-item__role lab-relation-item__role--source">${escapeHtml(item.sourceRole)}</span>
        <span class="lab-relation-item__role lab-relation-item__role--target">${escapeHtml(item.targetRole)}</span>
      </div>
      <div class="lab-relation-item__bottom">
        <span class="lab-relation-item__state">${escapeHtml(stateLabel)}</span>
        <span class="lab-relation-item__message">${escapeHtml(item.message)}</span>
      </div>
    </div>
  `;
}

function renderRelationshipGroup(title: string, items: TableRelationship[]): string {
  if (items.length === 0) return '';

  return `
    <section class="lab-relations-group">
      <div class="lab-relations-group__title">${escapeHtml(title)}</div>
      <div class="lab-relations-list">
        ${items.map((item) => renderRelationshipItem(item)).join('')}
      </div>
    </section>
  `;
}

export function renderRelationshipsPanel(labId: string, relationships: TableRelationship[]): void {
  const panel = document.getElementById(`${labId}-relations`);
  if (!panel) return;

  const directRelationships = relationships.filter((item) => item.relationshipKind === 'direct');
  const derivedRelationships = relationships.filter((item) => item.relationshipKind === 'derived');
  const linkedCount = relationships.filter((item) => item.status === 'linked' || item.status === 'derived').length;
  const derivedCount = relationships.filter((item) => item.status === 'derived').length;
  const cautionCount = relationships.filter((item) => item.status === 'caution').length;
  const missingCount = relationships.length - linkedCount - cautionCount;

  panel.innerHTML = `
    <div class="lab-relations-panel__header">
      <div>
        <div class="lab-relations-panel__title">Panel de relaciones</div>
        <div class="lab-relations-panel__subtitle">Detecta FKs, destinos, cardinalidad, N:N y rol sugerido</div>
      </div>
      <div class="lab-relations-panel__stats">
        <span class="lab-relations-panel__chip">${relationships.length} total</span>
        <span class="lab-relations-panel__chip is-ok">${directRelationships.length} directas</span>
        <span class="lab-relations-panel__chip ${missingCount > 0 || cautionCount > 0 ? 'is-warning' : 'is-ok'}">${linkedCount} vinculadas</span>
        ${derivedCount > 0 ? `<span class="lab-relations-panel__chip is-derived">${derivedCount} N:N</span>` : ''}
        ${cautionCount > 0 ? `<span class="lab-relations-panel__chip is-warning">${cautionCount} a revisar</span>` : ''}
      </div>
    </div>
    ${
      relationships.length > 0
        ? `
          ${renderRelationshipGroup('Relaciones directas', directRelationships)}
          ${renderRelationshipGroup('Relaciones derivadas', derivedRelationships)}
        `
        : `
          <div class="lab-relations-empty">
            No hay relaciones definidas todavía. Marca una columna como FK y elige su tabla destino para empezar. Si una tabla conecta dos FKs distintas, el laboratorio la puede interpretar como puente.
          </div>
        `
    }
  `;
}
