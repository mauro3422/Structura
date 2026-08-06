import type { TableCardinality, TableDefinition, TableObservation, TableRelationship } from './types.ts';

interface RelationshipRecord {
  sourceTableId: string;
  sourceTableName: string;
  sourceColumn: string;
  targetTableId: string;
  targetTableName: string;
  cardinality: TableCardinality;
  sourceRole: string;
  targetRole: string;
  sourceIsPk: boolean;
  targetExists: boolean;
}

function normalizeText(value: string | undefined): string {
  return (value || '').trim();
}

function normalizeCardinality(value: string | undefined): TableCardinality {
  const normalized = normalizeText(value).replace(/\s+/g, '').toUpperCase();
  if (normalized === '1:1') return '1:1';
  if (normalized === '1:N') return '1:N';
  return '1:N';
}

function describeRoles(cardinality: TableCardinality): { sourceRole: string; targetRole: string } {
  if (cardinality === '1:1') {
    return { sourceRole: 'FK', targetRole: 'Referencia sugerida' };
  }

  return { sourceRole: 'Detalle', targetRole: 'Maestra' };
}

function isAcronym(value: string): boolean {
  return /^[A-Z0-9]{2,}$/.test(value);
}

function isCamelCaseLike(value: string): boolean {
  return /^[a-z][A-Za-z0-9]*$/.test(value);
}

function isSnakeCaseLike(value: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(value);
}

function shouldSuggestCamelCase(value: string): boolean {
  if (!value || isAcronym(value) || isCamelCaseLike(value) || isSnakeCaseLike(value)) {
    return false;
  }

  return /[\s-]/.test(value) || /[A-Z]/.test(value) || /[^A-Za-z0-9_]/.test(value);
}

function toCamelCase(value: string): string {
  const parts = value
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return value;

  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function getTableId(table: TableDefinition): string {
  return normalizeText(table.tableId);
}

function getTableName(table: TableDefinition): string {
  return normalizeText(table.tableName);
}

function getDisplayTableName(table: TableDefinition): string {
  return getTableName(table) || 'Tabla sin nombre';
}

function describeObservationTableName(tableName: string): string {
  return tableName || 'sin nombre';
}

export class TableLabAnalyzer {
  private readonly tableById: Map<string, TableDefinition>;

  constructor(private readonly tables: TableDefinition[]) {
    this.tableById = new Map(
      tables
        .map((table) => [getTableId(table), table] as const)
        .filter(([tableId]) => Boolean(tableId)),
    );
  }

  getObservations(): TableObservation[] {
    const observations: TableObservation[] = [];
    const tableNames = new Map<string, { count: number; tableIds: string[] }>();

    this.tables.forEach((table) => {
      const tableId = getTableId(table);
      const tableName = getTableName(table);

      if (!tableName) {
        observations.push({
          kind: 'error',
          title: 'Nombre de tabla vacío',
          message: 'Cada tabla debería tener un nombre visible.',
          hint: 'Poné un nombre corto y claro, por ejemplo clientes o pedidos.',
          subject: 'Tabla sin nombre',
          tableId,
        });
      } else {
        const entry = tableNames.get(tableName) || { count: 0, tableIds: [] };
        entry.count += 1;
        if (tableId) entry.tableIds.push(tableId);
        tableNames.set(tableName, entry);
      }

      const columns = table.columns || [];
      const seenColumns = new Set<string>();
      let hasPk = false;
      let pkCount = 0;
      const fkTargets = new Set<string>();
      const fkTargetNames = new Set<string>();
      const fkColumns: string[] = [];

      columns.forEach((column, columnIndex) => {
        const columnName = normalizeText(column.name);
        const isPk = Boolean(column.isPK);
        const isFk = Boolean(column.isFK);
        const targetTableId = normalizeText(column.references as string | undefined);
        const cardinality = normalizeCardinality(column.cardinality as string | undefined);
        const targetTable = targetTableId ? this.tableById.get(targetTableId) : undefined;
        const targetTableName = targetTable ? getDisplayTableName(targetTable) : targetTableId;

        if (isPk) {
          hasPk = true;
          pkCount += 1;
        }

        if (columnName) {
          if (seenColumns.has(columnName)) {
            observations.push({
              kind: 'error',
              title: 'Columna duplicada',
              message: `La columna "${columnName}" se repite dentro de la misma tabla.`,
              hint: 'Usá un nombre único para cada campo.',
              subject: columnName,
              tableId,
              columnIndex,
              columnName,
            });
          }
          seenColumns.add(columnName);

          if (shouldSuggestCamelCase(columnName)) {
            observations.push({
              kind: 'info',
              title: 'Sugerencia de nombre',
              message: `La columna "${columnName}" se entiende, pero un formato uniforme facilita leer el modelo.`,
              hint: `Sugerencia: ${toCamelCase(columnName)}`,
              subject: columnName,
              tableId,
              columnIndex,
              columnName,
            });
          }
        }

        if (isFk && !targetTableId) {
          observations.push({
            kind: 'error',
            title: 'Relación inválida',
            message: `La columna "${columnName || 'sin nombre'}" está marcada como FK pero no apunta a ninguna tabla.`,
            hint: 'Elegí una tabla destino para cerrar el enlace.',
            subject: columnName || undefined,
            tableId,
            columnIndex,
            columnName: columnName || undefined,
          });
          return;
        }

        if (isFk && targetTableId) {
          fkTargets.add(targetTableId);
          if (targetTableName) fkTargetNames.add(targetTableName);
          fkColumns.push(columnName || 'FK');

          if (cardinality === '1:1' && !isPk) {
            observations.push({
              kind: 'warning',
              title: '1:1 a revisar',
              message: `La relación "${columnName || 'FK'} -> ${targetTableName || targetTableId}" parece 1:1, pero la FK no es PK.`,
              hint: 'Si querés 1:1 estricta, la FK debería ser única o compartir la PK.',
              subject: columnName || undefined,
              tableId,
              columnIndex,
              columnName: columnName || undefined,
            });
          }
        }
      });

      if (fkColumns.length === 2 && fkTargetNames.size === 2) {
        const bridgeTargets = Array.from(fkTargetNames);
        observations.push({
          kind: 'info',
          title: 'Tabla puente candidata',
          message: `La tabla ${describeObservationTableName(tableName)} conecta ${bridgeTargets[0]} y ${bridgeTargets[1]}.`,
          hint: 'Esto suele representar una relacion N:N a traves de una tabla intermedia.',
          subject: tableName || undefined,
          tableId,
        });
      }

      if (pkCount > 1) {
        observations.push({
          kind: 'info',
          title: 'Clave primaria compuesta',
          message: `La tabla "${describeObservationTableName(tableName)}" usa ${pkCount} columnas como PK.`,
          hint: 'Eso puede ser valido si la identidad real depende de mas de una columna.',
          subject: tableName || undefined,
          tableId,
        });
      }

      if (!hasPk) {
        observations.push({
          kind: 'warning',
          title: 'Falta clave primaria',
          message: `La tabla "${describeObservationTableName(tableName)}" no tiene PK marcada.`,
          hint: 'Una tabla base normalmente debería tener una clave primaria.',
          subject: tableName || undefined,
          tableId,
        });
      }
    });

    tableNames.forEach((entry, tableName) => {
      if (entry.count > 1) {
        observations.push({
          kind: 'error',
          title: 'Nombre de tabla duplicado',
          message: `Hay ${entry.count} tablas con el nombre "${tableName}".`,
          hint: 'Cada tabla debería tener un nombre distinto para evitar confusiones.',
          subject: tableName,
          tableName,
          tableIds: entry.tableIds,
        });
      }
    });

    return observations;
  }

  getRelationships(): TableRelationship[] {
    const records = this.collectRelationshipRecords();
    const directRelationships = records.map((record) => {
      if (!record.targetTableId) {
        return {
          relationshipKind: 'direct',
          sourceTable: record.sourceTableName,
          sourceColumn: record.sourceColumn,
          targetTable: 'Sin destino',
          cardinality: record.cardinality,
          sourceRole: 'Origen',
          targetRole: 'Pendiente',
          status: 'missing-reference',
          message: 'Relacion invalida: falta una tabla destino para cerrar el enlace.',
        } satisfies TableRelationship;
      }

      const caution = record.targetExists && record.cardinality === '1:1' && !record.sourceIsPk;

    return {
        relationshipKind: 'direct',
        sourceTable: record.sourceTableName,
        sourceColumn: record.sourceColumn,
        targetTable: record.targetTableName,
        cardinality: record.cardinality,
        sourceRole: record.sourceRole,
        targetRole: record.targetRole,
        status: record.targetExists ? (caution ? 'caution' : 'linked') : 'missing-target',
        message: record.targetExists
          ? record.cardinality === '1:1'
            ? caution
              ? `1:1 detectada. Para que sea estricta, conviene que la FK sea unica o compartida con la PK. Enlace: ${record.sourceTableName}.${record.sourceColumn} -> ${record.targetTableName}.`
              : `1:1 detectada. La tabla destino funciona como referencia principal. Enlace: ${record.sourceTableName}.${record.sourceColumn} -> ${record.targetTableName}.`
            : `1:N detectada. La tabla destino actua como maestra y la actual como detalle. Repetir la misma FK en varias filas es normal. Enlace: ${record.sourceTableName}.${record.sourceColumn} -> ${record.targetTableName}.`
          : 'Relacion invalida: la tabla destino no esta disponible en el laboratorio.',
    } satisfies TableRelationship;
  });

    return [...directRelationships, ...this.deriveManyToManyRelationships(records)];
  }

  private collectRelationshipRecords(): RelationshipRecord[] {
    const records: RelationshipRecord[] = [];

    this.tables.forEach((table) => {
      const sourceTableId = getTableId(table);
      const sourceTableName = getDisplayTableName(table);

      (table.columns || []).forEach((column, columnIndex) => {
        if (!column.isFK) return;

        const targetTableId = normalizeText(column.references as string | undefined);
        const targetTable = targetTableId ? this.tableById.get(targetTableId) : undefined;
        const cardinality = normalizeCardinality(column.cardinality as string | undefined);
        const roles = describeRoles(cardinality);
        const sourceColumn = normalizeText(column.name) || 'Columna';

        records.push({
          sourceTableId,
          sourceTableName,
          sourceColumn,
          targetTableId,
          targetTableName: targetTable ? getDisplayTableName(targetTable) : targetTableId,
          cardinality,
          sourceRole: roles.sourceRole,
          targetRole: roles.targetRole,
          sourceIsPk: Boolean(column.isPK),
          targetExists: Boolean(targetTable),
        });
      });
    });

    return records;
  }

  private deriveManyToManyRelationships(records: RelationshipRecord[]): TableRelationship[] {
    const recordsBySource = new Map<string, RelationshipRecord[]>();

    records.forEach((record) => {
      if (!record.targetExists || !record.targetTableId) return;
      const list = recordsBySource.get(record.sourceTableId) || [];
      list.push(record);
      recordsBySource.set(record.sourceTableId, list);
    });

    const derived: TableRelationship[] = [];

    recordsBySource.forEach((sourceRecords) => {
      const uniqueTargets = Array.from(
        sourceRecords.reduce((map, record) => map.set(record.targetTableId, record), new Map<string, RelationshipRecord>()).values(),
      );

      if (sourceRecords.length !== 2 || uniqueTargets.length !== 2) {
        return;
      }

      const [left, right] = uniqueTargets;
      const bridgeLabel = left.sourceTableName || 'Tabla puente';

      derived.push({
        relationshipKind: 'derived',
        sourceTable: left.targetTableName,
        sourceColumn: 'Relación puente',
        targetTable: right.targetTableName,
        bridgeTable: bridgeLabel,
        cardinality: 'N:N',
        sourceRole: 'N',
        targetRole: 'N',
        status: 'derived',
        message: `N:N inferida vía ${bridgeLabel}. La tabla puente conecta ambos lados.`,
      });
    });

    return derived;
  }
}
