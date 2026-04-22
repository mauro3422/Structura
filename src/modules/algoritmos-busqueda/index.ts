import { Module, lesson, concept, stat, term } from '../../core/Module.ts';

const busquedaLineal = lesson('busqueda-lineal', 'Búsqueda Lineal')
  .description('El método más simple para encontrar un dato')
  .duration('5 min')
  .text('Imaginá que tenés un mazo de cartas desordenado y buscás el **7 de copas**. Revisás una por una hasta encontrarlo.')
  .info('<b>Búsqueda lineal:</b> recorrer una lista elemento por elemento desde el inicio hasta encontrar lo buscado.', { icon: '📌' })
  .heading('Pseudocódigo')
  .code('pseudocode', `FUNCIÓN BusquedaLineal(lista, valorBuscado)
  PARA i DESDE 0 HASTA longitud(lista) - 1
    SI lista[i] == valorBuscado ENTONCES
      RETORNAR i
    FIN SI
  FIN PARA
  RETORNAR -1
FIN FUNCIÓN`)
  .heading('Visualización')
  .text('Buscamos el número **7** en esta lista. Mirá cómo se recorre paso a paso.')
  .searchAnimation('linear', [3, 8, 1, 7, 4, 9, 2, 5], 7)
  .conceptCards([
    concept('✅', 'Ventajas', 'Funciona con listas desordenadas y es muy fácil de entender.'),
    concept('❌', 'Desventajas', 'Es lento cuando hay muchos datos.'),
  ])
  .quiz('Si tenés 100 elementos y el dato está en la posición 99, ¿cuántas comparaciones hace?', [
    '1 comparación',
    '50 comparaciones',
    '99 comparaciones',
    '100 comparaciones',
  ], 3, 'En el peor caso, la búsqueda lineal revisa todos los elementos.')
  .build();

const busquedaBinaria = lesson('busqueda-binaria', 'Búsqueda Binaria')
  .description('Dividir y conquistar para buscar más rápido')
  .duration('7 min')
  .text('¿Alguna vez buscaste una palabra en un **diccionario**? Abrís por la mitad y vas descartando la parte que no sirve.')
  .info('<b>Requisito:</b> la lista debe estar <b>ordenada</b> para usar búsqueda binaria.', { variant: 'warning', icon: '⚠️' })
  .heading('Pseudocódigo')
  .code('pseudocode', `FUNCIÓN BusquedaBinaria(lista, valorBuscado)
  inicio = 0
  fin = longitud(lista) - 1

  MIENTRAS inicio <= fin
    medio = (inicio + fin) / 2

    SI lista[medio] == valorBuscado ENTONCES
      RETORNAR medio
    SINO SI lista[medio] < valorBuscado ENTONCES
      inicio = medio + 1
    SINO
      fin = medio - 1
    FIN SI
  FIN MIENTRAS

  RETORNAR -1
FIN FUNCIÓN`)
  .heading('Visualización')
  .text('Buscamos el número **7** en esta lista ordenada. Cada paso descarta la mitad de los datos.')
  .searchAnimation('binary', [1, 2, 3, 4, 5, 6, 7, 8, 9], 7)
  .heading('Comparación de velocidad')
  .stats([
    stat('100', 'Pasos máximos Lineal (100 datos)', '🐢'),
    stat('7', 'Pasos máximos Binaria (100 datos)', '🚀'),
    stat('1,000', 'Pasos máximos Lineal (1000 datos)', '🐢'),
    stat('10', 'Pasos máximos Binaria (1000 datos)', '🚀'),
  ])
  .quiz('¿Por qué la búsqueda binaria es más rápida que la lineal?', [
    'Porque usa más memoria',
    'Porque descarta la mitad de los datos en cada paso',
    'Porque funciona con cualquier lista',
    'Porque es más nueva',
  ], 1, '¡Exacto! Al dividir la lista a la mitad en cada paso, descarta muchísimos datos rápidamente.')
  .build();

const glossary = [
  term('Algoritmo', 'Secuencia finita de pasos ordenados para resolver un problema.', 'algoritmos'),
  term('Búsqueda lineal', 'Recorrer una lista elemento por elemento hasta encontrar lo buscado.', 'algoritmos'),
  term('Búsqueda binaria', 'Buscar dividiendo la lista ordenada a la mitad en cada paso.', 'algoritmos'),
];

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
