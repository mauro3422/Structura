export function highlightSQL(code) {
  const keywords = ['CREATE', 'TABLE', 'INSERT', 'INTO', 'VALUES', 'SELECT', 'FROM', 'WHERE', 'PRIMARY', 'KEY', 'AUTO_INCREMENT', 'INT', 'VARCHAR', 'FLOAT', 'DATE', 'BOOLEAN', 'NOT', 'NULL'];
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    code = code.replace(regex, `<span class="code-block__keyword">$1</span>`);
  });
  code = code.replace(/'([^']*)'/g, `<span class="code-block__string">'$1'</span>`);
  code = code.replace(/(--.*)/g, `<span class="code-block__comment">$1</span>`);
  code = code.replace(/\b(\d+)\b/g, `<span class="code-block__number">$1</span>`);
  return code;
}

export function highlightPseudocode(code) {
  const keywords = ['FUNCIÓN', 'FIN', 'PARA', 'DESDE', 'HASTA', 'SI', 'ENTONCES', 'SINO', 'RETORNAR', 'MIENTRAS', 'FIN SI', 'FIN PARA', 'FIN MIENTRAS', 'FIN FUNCIÓN'];
  keywords.sort((a, b) => b.length - a.length);
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    code = code.replace(regex, `<span class="code-block__keyword">$1</span>`);
  });
  code = code.replace(/(\/\/.*)/g, `<span class="code-block__comment">$1</span>`);
  return code;
}
