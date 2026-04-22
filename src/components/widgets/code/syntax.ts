function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightByKeywords(code: string, keywords: string[]): string {
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  return sorted.reduce((acc, keyword) => {
    const regex = new RegExp(`\\b(${escapeRegExp(keyword)})\\b`, 'g');
    return acc.replace(regex, '<span class="code-block__keyword">$1</span>');
  }, code);
}

export function highlightSQL(code: string): string {
  const keywords = ['CREATE', 'TABLE', 'INSERT', 'INTO', 'VALUES', 'SELECT', 'FROM', 'WHERE', 'PRIMARY', 'KEY', 'AUTO_INCREMENT', 'INT', 'VARCHAR', 'FLOAT', 'DATE', 'BOOLEAN', 'NOT', 'NULL'];
  let highlighted = highlightByKeywords(code, keywords);
  highlighted = highlighted.replace(/'([^']*)'/g, `<span class="code-block__string">'$1'</span>`);
  highlighted = highlighted.replace(/(--.*)/g, `<span class="code-block__comment">$1</span>`);
  highlighted = highlighted.replace(/\b(\d+)\b/g, `<span class="code-block__number">$1</span>`);
  return highlighted;
}

export function highlightPseudocode(code: string): string {
  const keywords = ['FUNCION', 'FUNCIÓN', 'FIN', 'PARA', 'DESDE', 'HASTA', 'SI', 'ENTONCES', 'SINO', 'RETORNAR', 'MIENTRAS', 'FIN SI', 'FIN PARA', 'FIN MIENTRAS', 'FIN FUNCION', 'FIN FUNCIÓN'];
  const highlighted = highlightByKeywords(code, keywords);
  return highlighted.replace(/(\/\/.*)/g, `<span class="code-block__comment">$1</span>`);
}
