import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TableLabAnalyzer } from '../src/components/widgets/table/analyzer.ts';
import { createTableId, resolveLabTables, saveLabTables } from '../src/components/widgets/table/persistence.ts';
import { createDefaultLabTable } from '../src/components/widgets/table/markup.ts';

describe('Table contracts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates stable table ids without collisions', () => {
    expect(createTableId('lesson-1', 0)).toBe('table-lesson-1-1');
    expect(createTableId(' lesson-1 ', 0, ['table-lesson-1-1'])).toBe('table-lesson-1-1-1');
  });

  it('prefers saved lab tables over the lesson starter tables', () => {
    const savedTables = [
      {
        tableId: 'custom-table',
        tableName: 'Guardada',
        columns: [{ name: 'ID', type: 'INT', isPK: true }],
        rows: [['1']],
      },
    ];

    saveLabTables('lesson-x', savedTables);

    const resolved = resolveLabTables(
      {
        type: 'table-laboratory',
        initialTables: [createDefaultLabTable()],
      },
      'lesson-x',
    );

    expect(resolved).toHaveLength(1);
    expect(resolved[0]).toMatchObject({ tableId: 'custom-table', tableName: 'Guardada' });
  });

  it('falls back to the lesson tables when there is no saved data', () => {
    const resolved = resolveLabTables(
      {
        type: 'table-laboratory',
        initialTables: [createDefaultLabTable()],
      },
      'lesson-y',
    );

    expect(resolved).toHaveLength(1);
    expect(resolved[0].tableId).toBe('table-lesson-y-1');
    expect(resolved[0].tableName).toBe('MiTabla1');
  });

  it('detects duplicates, missing PKs and candidate relationships', () => {
    const analyzer = new TableLabAnalyzer([
      {
        tableId: 'authors',
        tableName: 'Autores',
        columns: [
          { name: 'id', type: 'INT', isPK: true },
          { name: 'id', type: 'INT' },
          { name: 'Libro', type: 'TEXT' },
        ],
        rows: [[1, 1, 'A']],
      },
      {
        tableId: 'books',
        tableName: 'Libros',
        columns: [
          { name: 'autor_id', type: 'INT', isFK: true, references: 'authors', cardinality: '1:N' },
          { name: 'edicion_id', type: 'INT', isFK: true, references: 'editions', cardinality: '1:1' },
          { name: 'editorial_id', type: 'INT', isFK: true, references: 'publishers', cardinality: '1:N' },
        ],
        rows: [[1, 2]],
      },
      {
        tableId: 'editions',
        tableName: 'Ediciones',
        columns: [
          { name: 'id', type: 'INT', isPK: true },
        ],
        rows: [[1]],
      },
      {
        tableId: 'book_authors',
        tableName: 'LibroAutor',
        columns: [
          { name: 'book_id', type: 'INT', isFK: true, references: 'books', cardinality: '1:N' },
          { name: 'author_id', type: 'INT', isFK: true, references: 'authors', cardinality: '1:N' },
        ],
        rows: [[1, 1]],
      },
      {
        tableId: 'book_authors_duplicate',
        tableName: 'LibroAutor',
        columns: [
          { name: 'book_id', type: 'INT', isFK: true, references: 'books', cardinality: '1:N' },
          { name: 'author_id', type: 'INT', isFK: true, references: 'authors', cardinality: '1:N' },
        ],
        rows: [[1, 1]],
      },
    ]);

    const observations = analyzer.getObservations();
    const relationships = analyzer.getRelationships();

    expect(observations.some((item) => item.title === 'Columna duplicada')).toBe(true);
    expect(observations.some((item) => item.title === 'Falta clave primaria')).toBe(true);
    expect(observations.some((item) => item.title === 'Tabla puente candidata')).toBe(true);
    expect(observations.some((item) => item.title === 'Nombre de tabla duplicado')).toBe(true);

    expect(relationships.some((item) => item.relationshipKind === 'derived' && item.cardinality === 'N:N')).toBe(true);
    expect(relationships.some((item) => item.status === 'caution')).toBe(true);
    expect(relationships.some((item) => item.status === 'missing-target')).toBe(true);
  });
});
