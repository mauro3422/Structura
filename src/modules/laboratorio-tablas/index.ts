/**
 * Módulo: Laboratorio de Tablas
 */
import { Module, lesson } from '../../core/Module.ts';

const disenador = lesson('disenador-tablas', 'Diseñador de Tablas')
  .description('Creá tu propio esquema de base de datos desde cero')
  .duration('Libre')
  .text('Bienvenido al laboratorio. Acá podés poner en práctica todo lo aprendido.')
  .text('Podés crear tablas, definir columnas y completar los datos. Los cambios se guardan automáticamente.')
  .tableLaboratory([])
  .info('**Sugerencia:** intentá crear un sistema de tienda con una tabla de `Productos` y otra de `Categorías`.', { variant: 'accent', icon: '💡' })
  .build();

export default new Module({
  id: 'laboratorio-tablas',
  icon: '🧪',
  color: 'secondary',
  title: 'Laboratorio SQL',
  description: 'Diseñá y guardá tus propias estructuras de datos',
  order: 10,
  lessons: [disenador],
  glossary: [],
});
