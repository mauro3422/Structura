import { renderMagicHeader, renderMagicRows, renderMagicTableFrame } from './markup.js';

export function renderMagicTable(section, index, lessonId) {
  const tableId = `magic-table-${lessonId}-${index}`;
  const isNarrative = section.narrative === true;
  const tableName = section.tableName || 'default';

  return renderMagicTableFrame({
    tableId,
    index,
    lessonId,
    tableName,
    isNarrative,
    definition: section.definition || 'Una tabla organiza los datos en filas y columnas.',
    headersHtml: renderMagicHeader(section.columns),
    rowsHtml: renderMagicRows(section.rows),
  });
}
