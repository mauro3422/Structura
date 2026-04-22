import { describe, expect, it } from 'vitest';
import { Module, lesson, concept, dataType, col, event, stat, term } from '../src/core/Module.ts';

describe('Module contracts', () => {
  it('builds lessons with typed sections', () => {
    const built = lesson('redes-basicas', 'Redes básicas')
      .description('Introducción al concepto')
      .duration('8 min')
      .text('Hola mundo')
      .heading('Título')
      .info('Info', { icon: '💡', variant: 'accent' })
      .conceptCards([concept('🛰️', 'Nodo', 'Un nodo de red')])
      .tableExample('Tabla', [col('ID', 'INT')], [['1']])
      .dataTypes([dataType('int', 'Entero', '1', '🔢')])
      .code('ts', 'const x = 1;')
      .diagram('graph TD; A-->B;')
      .quiz('¿Ok?', ['Sí', 'No'], 0, 'Respuesta correcta')
      .timeline([event('1990', 'Evento', 'Descripción')])
      .stats([stat(1, 'Uno')])
      .searchAnimation('linear', [1, 2, 3], 2)
      .magicTable('Tabla mágica', [col('Nombre', 'TEXT')], [['A']], 'Definición')
      .tableLaboratory([])
      .stepAnimation({ title: 'Paso a paso', steps: [{ text: 'Paso 1' }] })
      .comparison('A', 'B', { title: 'Comparación', summary: 'Resumen', open: true })
      .build();

    expect(built.id).toBe('redes-basicas');
    expect(built.sections).toHaveLength(16);
    expect(built.sections[0]).toMatchObject({ type: 'text', content: 'Hola mundo' });
    expect(built.sections[built.sections.length - 1]).toMatchObject({ type: 'comparison', open: true });
  });

  it('links lessons inside a module and exposes metadata', () => {
    const mod = new Module({
      id: 'redes',
      title: 'Redes',
      description: 'Base de redes',
      lessons: [
        lesson('intro', 'Introducción').build(),
        lesson('dns', 'DNS').build(),
      ],
      glossary: [term('IP', 'Dirección lógica')],
    });

    const first = mod.getLesson('intro');
    const second = mod.getLesson('dns');

    expect(first?.getNext()?.id).toBe('dns');
    expect(second?.getPrev()?.id).toBe('intro');
    expect(mod.toMeta()).toMatchObject({
      id: 'redes',
      lessonCount: 2,
      lessons: [{ id: 'intro' }, { id: 'dns' }],
    });
  });
});
