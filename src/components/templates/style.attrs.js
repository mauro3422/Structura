export function buildStyle(...parts) {
  return parts.flat().filter(Boolean).join('; ');
}

export function styleAttr(...parts) {
  const value = buildStyle(...parts);
  return value ? `style="${value}"` : '';
}

export function cssVar(name, value) {
  return `${name}: ${value}`;
}
