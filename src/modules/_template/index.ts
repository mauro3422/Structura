/**
 * DataLab Module Template
 *
 * Copy this folder, rename it, and replace:
 * - id
 * - icon
 * - color
 * - title
 * - description
 * - lessons
 * - glossary
 */
import { Module, lesson, term } from '../../core/Module.ts';

const lessonOne = lesson('mi-leccion', 'Título de la Lección')
  .description('Descripción corta')
  .duration('5 min')
  .text('Contenido introductorio.')
  .build();

export default new Module({
  id: 'mi-modulo',
  icon: '📦',
  color: 'primary',
  title: 'Mi Módulo',
  description: 'Descripción corta del módulo',
  order: 99,
  lessons: [lessonOne],
  glossary: [
    term('Término', 'Definición breve.', 'general'),
  ],
});
