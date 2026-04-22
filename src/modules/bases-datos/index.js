/**
 * MÓDULO: Bases de Datos
 * 
 * Conceptos fundamentales de almacenamiento relacional.
 */
import { Module, lesson, concept, stat, event, term, col } from '../../core/Module.js';

// ─── LECCIONES ────────────────────────────────────────

const anatomia = lesson('anatomia-tabla', 'Anatomía de una Tabla')
  .description('Cómo se estructuran los datos en el mundo real')
  .duration('5 min')
  .text('En una base de datos, la unidad básica de organización es la [[trigger:frame:Usuarios|Tabla]]. Imaginala como un contenedor vacío al principio.')
  .magicTable('Usuarios', 
    [col('ID', 'INT'), col('Email', 'TEXT')], 
    [['1', 'usuario@mail.com'], ['2', 'pro@structura.io']],
    'Una tabla es una colección de datos relacionados.',
    { narrative: true }
  )
  .text('Para que la tabla tenga sentido, definimos las [[trigger:headers:Usuarios|Columnas]]. Ellas nos dicen qué tipo de información vamos a guardar (números, texto, fechas).')
  .text('Finalmente, cuando empezamos a guardar información real, creamos las [[trigger:data:Usuarios|Filas o Registros]]. ¡Ahí es donde viven los datos!')
  .quiz('¿Qué elemento define el tipo de dato en una tabla?', [
    'Las filas', 'Las columnas', 'El nombre de la tabla', 'El color de fondo'
  ], 1, 'Las columnas (o campos) definen qué tipo de información (INT, TEXT, etc.) puede contener cada celda de esa columna.')
  .build();

// ─── EXPORT MODULE ───────────────────────────────────

export default new Module({
  id: 'bases-datos',
  icon: '🗄️',
  color: 'accent',
  title: 'Bases de Datos',
  description: 'Aprende a organizar información de forma profesional',
  order: 3,
  lessons: [anatomia],
  glossary: [
    term('Tabla', 'Estructura fundamental de una base de datos relacional para organizar datos.'),
    term('SQL', 'Lenguaje de consulta estructurado para interactuar con bases de datos.')
  ],
});
