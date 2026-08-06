/**
 * Módulo: Laboratorio de Tablas
 */
import { Module, lesson } from '../../core/Module.ts';
import { createRoutingSandboxTables } from './fixtures.ts';

const disenador = lesson('disenador-tablas', 'Diseñador de Tablas')
  .description('Creá tu propio esquema de base de datos desde cero')
  .duration('Libre')
  .text('Bienvenido al laboratorio. Acá podés poner en práctica todo lo aprendido.')
  .text('Podés crear tablas, definir columnas y completar los datos. Los cambios se guardan automáticamente.')
  .tableLaboratory([])
  .info('**Sugerencia:** intentá crear un sistema de tienda con una tabla de `Productos` y otra de `Categorías`.', {
    variant: 'accent',
    icon: '💡',
  })
  .build();

const bancoRuteo = lesson('banco-ruteo-tablas', 'Banco de Ruteo')
  .description('Escenario determinista para probar el motor de enlaces y las colisiones')
  .duration('Libre')
  .text('Este laboratorio usa 3 tablas fijas para revisar rutas, carriles y salidas desde columnas.')
  .text('La tabla superior concentra dos claves foráneas y el motor debe bajar como un árbol limpio.')
  .tableLaboratory(createRoutingSandboxTables(), { persist: false })
  .info('Probá mover las tablas y agregar relaciones. Si el trazo se cruza o hace vueltas raras, este es el caso para depurarlo.', {
    variant: 'accent',
    icon: '🧪',
  })
  .build();

export default new Module({
  id: 'laboratorio-tablas',
  icon: '🧪',
  color: 'secondary',
  title: 'Laboratorio SQL',
  description: 'Diseñá y guardá tus propias estructuras de datos',
  order: 10,
  lessons: [disenador, bancoRuteo],
  glossary: [],
});
