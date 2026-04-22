/**
 * MODULO: Laboratorio de Tablas
 *
 * Espacio libre para que los alumnos diseñen y guarden sus propias tablas.
 */
import { Module, lesson } from '../../core/Module.js';

const disenador = lesson('disenador-tablas', 'Diseñador de Tablas')
  .description('Crea tu propio esquema de base de datos desde cero')
  .duration('Libre')
  .text('Bienvenido al laboratorio. Aquí puedes poner en práctica todo lo aprendido.')
  .text('Puedes crear tantas tablas como necesites, definir sus columnas y llenar los datos. Los cambios se guardan automáticamente mientras trabajas.')
  .tableLaboratory([])
  .info('**Sugerencia:** Intenta crear un sistema de "Tienda" con una tabla de `Productos` y otra de `Categorias`.', { variant: 'accent', icon: '💡' })
  .build();

export default new Module({
  id: 'laboratorio-tablas',
  icon: '🧪',
  color: 'secondary',
  title: 'Laboratorio SQL',
  description: 'Diseña y guarda tus propias estructuras de datos',
  order: 10,
  lessons: [disenador],
  glossary: [],
});
