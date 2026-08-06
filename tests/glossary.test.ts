import { describe, expect, it } from 'vitest';
import { renderGlossary } from '../src/pages/glossary.ts';

describe('Glossary page', () => {
  it('renders grouped glossary content and search controls', () => {
    const html = renderGlossary();

    expect(html).toContain('page-glossary');
    expect(html).toContain('glossary-search-input');
    expect(html).toContain('Fundamentos');
    expect(html).toContain('Claves y Relaciones');
  });
});
