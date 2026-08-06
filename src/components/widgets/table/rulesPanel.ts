import { escapeAttr, escapeHtml } from '../Utils.ts';

type LabRuleChip = {
  label: string;
  helpTitle: string;
  helpText: string;
};

function renderLabRuleChip(cardId: string, chip: LabRuleChip, index: number): string {
  return `
    <li>
      <button
        type="button"
        class="lab-rule-chip"
        data-action="rule-help"
        data-rule-help-card="${escapeAttr(cardId)}"
        data-rule-help-title="${escapeAttr(chip.helpTitle)}"
        data-rule-help-text="${escapeAttr(chip.helpText)}"
        title="${escapeAttr(`${chip.helpTitle}. ${chip.helpText}`)}"
        aria-label="${escapeAttr(`${chip.helpTitle}. ${chip.helpText}`)}"
        aria-pressed="false"
        data-rule-chip-index="${index}"
      >
        ${escapeHtml(chip.label)}
      </button>
    </li>
  `;
}

type LabRuleCard = {
  kind: 'required' | 'suggested' | 'future';
  label: string;
  title: string;
  toggle: string;
  description: string;
  chips: LabRuleChip[];
  helperLabel: string;
  helperText: string;
};

function renderLabRuleCard(card: LabRuleCard, cardId: string): string {
  return `
    <details class="lab-rule-card lab-rule-card--${card.kind}" data-rule-card="${escapeAttr(cardId)}">
      <summary class="lab-rule-card__summary">
        <span class="lab-rule-card__label">${escapeHtml(card.label)}</span>
        <span class="lab-rule-card__title">${escapeHtml(card.title)}</span>
        <span class="lab-rule-card__toggle">Ver</span>
      </summary>
      <div class="lab-rule-card__body">
        <p class="lab-rule-card__description">${escapeHtml(card.description)}</p>
        <div class="lab-rule-card__helper" data-rule-help-panel>
          <div class="lab-rule-card__helper-kicker">Ayuda rápida</div>
          <div class="lab-rule-card__helper-title" data-rule-help-title>${escapeHtml(card.helperLabel)}</div>
          <div class="lab-rule-card__helper-text" data-rule-help-text>${escapeHtml(card.helperText)}</div>
        </div>
        <div class="lab-rule-card__toolbar">
          <span class="lab-rule-card__toolbar-label">Pistas</span>
          <span class="lab-rule-card__toolbar-copy">Pasa el mouse o tocá un chip para ver su explicación.</span>
        </div>
        <ul class="lab-rule-card__list">
          ${card.chips.map((chip, index) => renderLabRuleChip(cardId, chip, index)).join('')}
        </ul>
      </div>
    </details>
  `;
}

export function renderLaboratoryRulesPanel(labId: string): string {
  const cards: LabRuleCard[] = [
    {
      kind: 'required',
      label: 'Obligatorio',
      title: 'FK real y PK visible',
      toggle: 'Ver',
      description:
        'Sin una FK que apunte a una tabla real, la relación queda incompleta. Cada tabla debería mostrar una PK visible para identificar filas.',
      chips: [
        {
          label: 'FK → tabla real',
          helpTitle: 'FK real',
          helpText: 'La clave foránea debe apuntar a una tabla que exista y que el usuario haya elegido, no a un nombre suelto.',
        },
        {
          label: 'PK visible por tabla',
          helpTitle: 'PK visible',
          helpText: 'Cada tabla necesita una clave primaria clara para distinguir filas y entender qué registro es cuál.',
        },
        {
          label: 'Nombre único',
          helpTitle: 'Nombre único',
          helpText: 'Dos tablas con el mismo nombre confunden el modelo y vuelven ambiguas las relaciones.',
        },
      ],
      helperLabel: 'Elegí una pista',
      helperText: 'Tocá un chip para leer qué se espera en esta regla.',
    },
    {
      kind: 'suggested',
      label: 'Sugerido',
      title: 'Nombres claros',
      toggle: 'Ver',
      description:
        'Podés usar minúsculas, snake_case o camelCase. El laboratorio solo sugiere ordenar nombres inconsistentes y te ayuda a leer mejor el modelo.',
      chips: [
        {
          label: 'snake_case o camelCase',
          helpTitle: 'Formato sugerido',
          helpText: 'No se bloquean los nombres simples; solo se intenta mantener una convención legible.',
        },
        {
          label: 'Nombres consistentes',
          helpTitle: 'Consistencia',
          helpText: 'Usar el mismo estilo de nombres ayuda a leer tablas, columnas y claves sin perderse.',
        },
        {
          label: 'Varias PK = compuesta',
          helpTitle: 'PK compuesta',
          helpText: 'Si más de una columna forma la identidad de la fila, el laboratorio lo interpreta como clave compuesta.',
        },
        {
          label: '1:N repite detalle',
          helpTitle: 'Relación 1:N',
          helpText: 'La tabla detalle puede repetir la misma FK muchas veces; eso es normal en una relación uno a muchos.',
        },
        {
          label: 'N:N vía tabla puente',
          helpTitle: 'Relación N:N',
          helpText: 'Cuando dos tablas se conectan a través de una tercera, el laboratorio lo toma como una tabla puente.',
        },
      ],
      helperLabel: 'Elegí una pista',
      helperText: 'Tocá un chip para ver una guía corta, no una solución completa.',
    },
    {
      kind: 'future',
      label: 'Fase 2',
      title: 'Reglas estrictas',
      toggle: 'Ver',
      description:
        'Acá irán las reglas de modelado avanzado: PK compuestas reales, FK única para 1:1 y tablas puente con atributos para representar N:N con más rigor.',
      chips: [
        {
          label: 'PK compuestas reales',
          helpTitle: 'PK compuesta estricta',
          helpText: 'La identidad de una fila depende de varias columnas y el laboratorio debería validarlo con más rigor.',
        },
        {
          label: 'FK única para 1:1',
          helpTitle: '1:1 estricta',
          helpText: 'Para una relación uno a uno real, la FK debería ser única o compartir la PK de la tabla relacionada.',
        },
        {
          label: 'Puentes con atributos',
          helpTitle: 'Tabla puente',
          helpText: 'Una relación muchos a muchos suele necesitar una tabla intermedia que también tenga datos propios.',
        },
      ],
      helperLabel: 'Pendiente',
      helperText: 'Estas reglas quedarán para una fase más avanzada del laboratorio.',
    },
  ];

  return `
    <div class="lab-rules-panel" id="${labId}-rules" aria-live="polite">
      <div class="lab-rules-panel__header">
        <div>
          <div class="lab-rules-panel__title">Reglas del laboratorio</div>
          <div class="lab-rules-panel__subtitle">Lo obligatorio, lo sugerido y lo que dejamos para una fase posterior</div>
          <div class="lab-rules-panel__hint">Tocá una tarjeta o un chip para ver qué significa y cómo aplicarlo.</div>
        </div>
      </div>
      <div class="lab-rules-grid">
        ${cards.map((card) => renderLabRuleCard(card, `${labId}-${card.kind}`)).join('')}
      </div>
    </div>
  `;
}
