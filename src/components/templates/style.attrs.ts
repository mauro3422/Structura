export function buildStyle(...parts: Array<string | string[] | false | null | undefined>) {
  return parts.flat().filter(Boolean).join('; ');
}

export function styleAttr(...parts: Array<string | string[] | false | null | undefined>) {
  const value = buildStyle(...parts);
  return value ? `style="${value}"` : '';
}

export function cssVar(name: string, value: string) {
  return `${name}: ${value}`;
}
