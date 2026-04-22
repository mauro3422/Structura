import { describe, expect, it } from 'vitest';
import { renderLesson } from '../src/pages/lesson.ts';
import { renderLessonSection } from '../src/pages/lesson/sectionRenderer.ts';

describe('Lesson rendering', () => {
  it('renders the lesson page wrapper for a known lesson', () => {
    const html = renderLesson({ id: 'direcciones-ip' });

    expect(html).toContain('page-lesson-direcciones-ip');
    expect(html).toContain('lesson-content');
    expect(html).toContain('lesson-nav');
  });

  it('renders supported sections and a fallback for unknown ones', () => {
    const heading = renderLessonSection({ type: 'heading', content: 'Redes' }, 0, 'lesson-1');
    const fallback = renderLessonSection({ type: 'unknown' } as never, 1, 'lesson-1');

    expect(heading).toContain('<h2');
    expect(heading).toContain('Redes');
    expect(fallback).toContain('Sección no soportada');
    expect(fallback).toContain('unknown');
  });
});
