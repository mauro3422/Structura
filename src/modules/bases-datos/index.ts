/**
 * Módulo: Bases de Datos
 */
import { Module, lesson, concept, term, col } from '../../core/Module.ts';

const anatomia = lesson('anatomia-tabla', 'Anatomía de una Tabla')
  .description('Cómo se guardan los datos en una base relacional')
  .duration('5 min')
  .text('En una base de datos, la unidad básica de organización es la **tabla**.')
  .magicTable('Usuarios', [col('ID', 'INT'), col('Email', 'TEXT')], [['1', 'usuario@mail.com'], ['2', 'pro@structura.io']], 'Una tabla es una colección de datos relacionados.', { narrative: true })
  .text('Las columnas definen qué tipo de información guarda cada celda y las filas representan registros.')
  .conceptCards([
    concept('📋', 'Tabla', 'Agrupa datos de un mismo tema.'),
    concept('↔️', 'Columna', 'Define una categoría o campo.'),
    concept('↕️', 'Fila', 'Representa un registro completo.'),
    concept('🔲', 'Celda', 'La intersección entre una fila y una columna.'),
  ])
  .quiz('¿Qué elemento define el tipo de dato en una tabla?', [
    'Las filas',
    'Las columnas',
    'El nombre de la tabla',
    'El color de fondo',
  ], 1, 'Correcto: las columnas definen qué tipo de información puede guardar cada celda.')
  .build();

const glossary = [
  term('Tabla', 'Estructura fundamental de una base de datos relacional para organizar datos.'),
  term('SQL', 'Lenguaje de consulta estructurado para interactuar con bases de datos.'),
];

export default new Module({
  id: 'bases-datos',
  icon: '🗄️',
  color: 'accent',
  title: 'Bases de Datos',
  description: 'Aprendé a organizar información de forma profesional',
  order: 3,
  lessons: [anatomia],
  glossary,
});
