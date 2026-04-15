/**
 * MÓDULO: Algoritmos de Búsqueda
 * 
 * Enseña algoritmos de búsqueda con visualizaciones animadas.
 */
import { Module, lesson, concept, stat, term } from '../../core/Module.js';

// ─── LECCIONES ────────────────────────────────────────

const busquedaLineal = lesson('busqueda-lineal', 'Búsqueda Lineal')
  .description('El método más simple para encontrar un dato')
  .duration('5 min')
  .text('Imaginate que tenés un mazo de cartas desordenado y buscás el <b>7 de copas</b>. ¿Qué hacés? Las revisás <b>una por una</b> hasta encontrarlo. ¡Eso es búsqueda lineal!')
  .info('<b>Búsqueda Lineal:</b> recorrer una lista elemento por elemento, desde el inicio hasta encontrar lo buscado (o llegar al final).', { icon: '📌' })
  .heading('Pseudocódigo')
  .code('pseudocode', `FUNCIÓN BusquedaLineal(lista, valorBuscado)
  PARA i DESDE 0 HASTA longitud(lista) - 1
    SI lista[i] == valorBuscado ENTONCES
      RETORNAR i    // ¡Encontrado en posición i!
    FIN SI
  FIN PARA
  RETORNAR -1       // No se encontró
FIN FUNCIÓN`)
  .heading('Visualización')
  .text('Buscamos el número <b>7</b> en esta lista. Mirá cómo se recorre paso a paso:')
  .searchAnimation('linear', [3, 8, 1, 7, 4, 9, 2, 5], 7)
  .conceptCards([
    concept('✅', 'Ventajas', 'Funciona con listas desordenadas. Simple de entender e implementar.', 'accent'),
    concept('❌', 'Desventajas', 'Lento con muchos datos. En el peor caso revisa TODOS los elementos.', 'danger'),
  ])
  .quiz('Si tenés una lista de 100 elementos y el dato buscado está en la posición 99, ¿cuántas comparaciones hace la búsqueda lineal?', [
    '1 comparación', '50 comparaciones', '99 comparaciones', '100 comparaciones',
  ], 3, 'En el peor caso, la búsqueda lineal revisa TODOS los elementos. Necesitaría 100 comparaciones para llegar a la posición 99 (contando desde 0).')
  .build();

const busquedaBinaria = lesson('busqueda-binaria', 'Búsqueda Binaria')
  .description('Dividir y conquistar para buscar más rápido')
  .duration('7 min')
  .text('¿Alguna vez buscaste una palabra en un <b>diccionario</b>? No empezás desde la primera página. Abrís por la mitad, ves si la palabra está antes o después, y repetís. ¡Eso es búsqueda binaria!')
  .info('<b>Requisito:</b> La lista DEBE estar <b>ordenada</b> para usar búsqueda binaria. Si no está ordenada, usá búsqueda lineal.', { variant: 'warning', icon: '⚠️' })
  .heading('Pseudocódigo')
  .code('pseudocode', `FUNCIÓN BusquedaBinaria(lista, valorBuscado)
  inicio = 0
  fin = longitud(lista) - 1

  MIENTRAS inicio <= fin
    medio = (inicio + fin) / 2

    SI lista[medio] == valorBuscado ENTONCES
      RETORNAR medio     // ¡Encontrado!
    SINO SI lista[medio] < valorBuscado ENTONCES
      inicio = medio + 1  // Buscar en la mitad derecha
    SINO
      fin = medio - 1     // Buscar en la mitad izquierda
    FIN SI
  FIN MIENTRAS

  RETORNAR -1              // No se encontró
FIN FUNCIÓN`)
  .heading('Visualización')
  .text('Buscamos el número <b>7</b> en esta lista <b>ordenada</b>. Mirá cómo divide la búsqueda a la mitad en cada paso:')
  .searchAnimation('binary', [1, 2, 3, 4, 5, 6, 7, 8, 9], 7)
  .heading('Comparación de velocidad')
  .stats([
    stat('100', 'Pasos máximos Lineal (100 datos)', '🐌'),
    stat('7', 'Pasos máximos Binaria (100 datos)', '🚀'),
    stat('1,000', 'Pasos máximos Lineal (1000 datos)', '🐌'),
    stat('10', 'Pasos máximos Binaria (1000 datos)', '🚀'),
  ])
  .quiz('¿Por qué la búsqueda binaria es más rápida que la lineal?', [
    'Porque usa más memoria',
    'Porque descarta la mitad de los datos en cada paso',
    'Porque funciona con cualquier lista',
    'Porque es más nueva',
  ], 1, '¡Exacto! Al dividir la lista a la mitad en cada paso, descarta una enorme cantidad de datos rápidamente. Con 1000 datos, solo necesita ~10 pasos.')
  .build();

// ─── GLOSARIO ────────────────────────────────────────

const glossary = [
  term('Algoritmo', 'Secuencia finita de pasos ordenados para resolver un problema. Como una receta de cocina: pasos claros, uno después del otro.', 'algoritmos'),
  term('Búsqueda Lineal', 'Recorrer una lista elemento por elemento hasta encontrar lo que buscás. Simple pero lento con muchos datos.', 'algoritmos'),
  term('Búsqueda Binaria', 'Buscar dividiendo la lista ordenada a la mitad en cada paso. Mucho más rápido que lineal, pero necesita que los datos estén ordenados.', 'algoritmos'),
];

// ─── EXPORT MODULE ───────────────────────────────────

export default new Module({
  id: 'algoritmos-busqueda',
  icon: '🔍',
  color: 'accent',
  title: 'Algoritmos de Búsqueda',
  description: 'Cómo las computadoras encuentran datos eficientemente',
  order: 3,
  lessons: [busquedaLineal, busquedaBinaria],
  glossary,
});
