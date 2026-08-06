import { describe, expect, it } from 'vitest';
import { Module, col, concept, dataType, event, lesson, stat, term } from '../src/core/Module.ts';

function getSection<T extends { type: string }, K extends T['type']>(sections: T[], type: K): Extract<T, { type: K }> {
  const section = sections.find((item) => item.type === type);
  if (!section) {
    throw new Error(`Missing section: ${type}`);
  }
  return section as Extract<T, { type: K }>;
}

describe('Core DSL contracts', () => {
  it('clones builder inputs and applies section defaults', () => {
    const concepts = [concept('🧭', 'Node', 'A node')];
    const exampleColumns = [col('ID', 'INT')];
    const exampleRows = [['1']];
    const interactiveColumns = [col('Name', 'TEXT')];
    const interactiveRows = [['Alice']];
    const dataTypes = [dataType('INT', 'Integer', '1', '🔢')];
    const quizOptions = ['Yes', 'No'];
    const timelineEvents = [event('1990', 'Start', 'Project begins')];
    const statsItems = [stat(1, 'One')];
    const searchData = [1, 2, 3];
    const magicColumns = [col('Code', 'TEXT')];
    const magicRows = [['A']];
    const tables = [
      {
        tableName: 'Users',
        columns: [col('ID', 'INT')],
        rows: [['1']],
      },
    ];
    const steps = [{ text: 'Step 1' }];

    const built = lesson('dsl-contract', 'DSL Contract')
      .info('Info section')
      .conceptCards(concepts)
      .tableExample('Example', exampleColumns, exampleRows)
      .interactiveTable('Interactive', interactiveColumns, interactiveRows)
      .dataTypes(dataTypes)
      .quiz('Question', quizOptions, 1, 'Answer')
      .timeline(timelineEvents)
      .stats(statsItems)
      .searchAnimation('linear', searchData, 2)
      .magicTable('Magic', magicColumns, magicRows, 'Definition')
      .tableLaboratory(tables)
      .stepAnimation({ title: 'Steps', steps })
      .comparison('Left', 'Right')
      .build();

    concepts.push(concept('⚙️', 'Extra', 'Should not leak'));
    exampleColumns[0].name = 'Changed';
    exampleRows[0][0] = '9';
    interactiveColumns[0].type = 'CHAR';
    interactiveRows[0][0] = 'Bob';
    dataTypes.push(dataType('TEXT', 'Text', 'hello', '📝'));
    quizOptions[0] = 'Maybe';
    timelineEvents[0].title = 'Changed';
    statsItems[0].label = 'Changed';
    searchData[0] = 99;
    magicColumns[0].name = 'Changed';
    magicRows[0][0] = 'B';
    tables[0].columns[0].name = 'Changed';
    tables[0].rows[0][0] = '9';
    steps[0].text = 'Changed';

    const info = getSection(built.sections, 'info');
    const conceptCards = getSection(built.sections, 'concept-cards');
    const tableExample = getSection(built.sections, 'table-example');
    const interactiveTable = getSection(built.sections, 'interactive-table');
    const dataTypesSection = getSection(built.sections, 'data-types');
    const quiz = getSection(built.sections, 'quiz');
    const timeline = getSection(built.sections, 'timeline');
    const statsSection = getSection(built.sections, 'stats');
    const searchAnimation = getSection(built.sections, 'search-animation');
    const magicTable = getSection(built.sections, 'magic-table');
    const tableLaboratory = getSection(built.sections, 'table-laboratory');
    const stepAnimation = getSection(built.sections, 'step-animation');
    const comparison = getSection(built.sections, 'comparison');

    expect(info).toMatchObject({ content: 'Info section', variant: 'primary', icon: '💡' });
    expect(conceptCards.items).toHaveLength(1);
    expect(conceptCards.items[0]).toMatchObject({ title: 'Node' });
    expect(tableExample.columns).toEqual([{ name: 'ID', type: 'INT' }]);
    expect(tableExample.rows).toEqual([['1']]);
    expect(interactiveTable.editable).toBe(true);
    expect(interactiveTable.canAddRows).toBe(true);
    expect(interactiveTable.canAddColumns).toBe(true);
    expect(interactiveTable.columns).toEqual([{ name: 'Name', type: 'TEXT' }]);
    expect(dataTypesSection.items).toHaveLength(1);
    expect(dataTypesSection.items[0]).toMatchObject({ type: 'INT', name: 'Integer' });
    expect(quiz.options).toEqual(['Yes', 'No']);
    expect(timeline.events).toHaveLength(1);
    expect(timeline.events[0]).toMatchObject({ year: '1990', title: 'Start' });
    expect(statsSection.items).toHaveLength(1);
    expect(statsSection.items[0]).toMatchObject({ value: 1, label: 'One' });
    expect(searchAnimation.data).toEqual([1, 2, 3]);
    expect(magicTable.interactive).toBe(false);
    expect(magicTable.narrative).toBe(false);
    expect(magicTable.columns).toEqual([{ name: 'Code', type: 'TEXT' }]);
    expect(magicTable.rows).toEqual([['A']]);
    expect(tableLaboratory.initialTables[0].columns).toEqual([{ name: 'ID', type: 'INT' }]);
    expect(tableLaboratory.initialTables[0].rows).toEqual([['1']]);
    expect(stepAnimation.steps).toEqual([{ text: 'Step 1' }]);
    expect(comparison).toMatchObject({ title: '', summary: '', open: false });
  });

  it('copies module collections and applies module defaults', () => {
    const lessons = [lesson('intro', 'Intro').build()];
    const glossary = [term('IP', 'Internet Protocol')];

    const mod = new Module({
      id: 'core',
      title: 'Core',
      description: 'Core module',
      lessons,
      glossary,
    });

    lessons.push(lesson('extra', 'Extra').build());
    glossary.push(term('DNS', 'Domain Name System'));

    expect(mod.icon).toBe('📦');
    expect(mod.color).toBe('primary');
    expect(mod.order).toBe(99);
    expect(mod.lessons).toHaveLength(1);
    expect(mod.glossary).toHaveLength(1);
    expect(mod.toMeta()).toMatchObject({
      id: 'core',
      lessonCount: 1,
      lessons: [{ id: 'intro' }],
    });
  });
});
