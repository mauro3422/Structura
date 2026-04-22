import { renderMagicHeader, renderMagicRows, renderMagicTableFrame } from './markup.ts';

export function renderMagicTable(section: any, index: number, lessonId: string) {
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
