/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  TEMPLATE DE MÓDULO DATALAB                          ║
 * ║                                                      ║
 * ║  Copiá esta carpeta con un nombre nuevo y editá      ║
 * ║  este archivo para crear un nuevo módulo.            ║
 * ╚══════════════════════════════════════════════════════╝
 * 
 * PASOS:
 *   1. Copiar carpeta _template/ → mi-modulo/
 *   2. Editar este index.js con tu contenido
 *   3. En src/modules/index.js, agregar:
 *      import miModulo from './mi-modulo/index.js';
 *      registry.register(miModulo);
 *   4. ¡Listo! Ya aparece en la app.
 */
import { Module, lesson, concept, col, dataType, stat, event, term } from '../../core/Module.js';

// ─── LECCIONES ────────────────────────────────────────
// Usá la API fluida de `lesson()` para crear lecciones.
// Cada método agrega una sección al contenido:
//
//   .text('...')              → Párrafo de texto (soporta HTML)
//   .heading('...')           → Título de sección
//   .info('...', opts)        → Caja de información (variantes: primary, secondary, accent, warning)
//   .conceptCards([...])      → Tarjetas de concepto
//   .tableExample(name, cols, rows) → Tabla estática de ejemplo
//   .interactiveTable(name, cols, rows, opts) → Tabla editable
//   .dataTypes([...])         → Lista de tipos de datos
//   .code('lang', code)       → Bloque de código (sql, pseudocode, javascript)
//   .quiz(q, opts, correct, explanation) → Pregunta interactiva
//   .timeline([...])          → Línea de tiempo
//   .stats([...])             → Tarjetas de estadísticas
//   .searchAnimation(algo, data, target) → Animación de búsqueda
//   .comparison(left, right)  → Comparación lado a lado
//   .stepAnimation(config)    → Animación paso a paso genérica

const leccion1 = lesson('mi-leccion-1', 'Título de la Lección 1')
  .description('Descripción corta para la lista')
  .duration('5 min')
  .text('Contenido introductorio de la lección...')
  .info('Un dato importante para resaltar.', { icon: '💡' })
  .heading('Subtítulo')
  .text('Más contenido...')
  .conceptCards([
    concept('📌', 'Concepto A', 'Explicación del concepto A.', 'primary'),
    concept('📌', 'Concepto B', 'Explicación del concepto B.', 'secondary'),
  ])
  .quiz(
    '¿Pregunta de ejemplo?',
    ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
    1, // índice de la respuesta correcta (0-based)
    'Explicación de por qué B es correcta.'
  )
  .build();

const leccion2 = lesson('mi-leccion-2', 'Título de la Lección 2')
  .description('Descripción corta')
  .duration('7 min')
  .text('Contenido...')
  .build();

// ─── GLOSARIO ────────────────────────────────────────
// Términos que aparecen en la sección de glosario.

const glossary = [
  term('Término 1', 'Definición del término 1.', 'mi-categoria'),
  term('Término 2', 'Definición del término 2.', 'mi-categoria'),
];

// ─── EXPORT MODULE ───────────────────────────────────
// Configurá los datos del módulo:
//   id:          Identificador URL-friendly (sin espacios ni acentos)
//   icon:        Emoji para la tarjeta del módulo
//   color:       'primary' | 'secondary' | 'accent' | 'warning' | 'danger'
//   title:       Nombre del módulo
//   description: Descripción corta (1 línea)
//   order:       Posición en el menú (1 = primero)

export default new Module({
  id: 'mi-modulo',
  icon: '📦',
  color: 'primary',
  title: 'Mi Nuevo Módulo',
  description: 'Descripción corta del módulo',
  order: 99,
  lessons: [leccion1, leccion2],
  glossary,
});
