import { escapeHtml } from '../components/widgets/Utils.ts';

export function formatInlineMarkdown(content = '') {
  return String(content)
    .replace(/`([^`]+)`/g, (_, value: string) => `<code>${escapeHtml(value)}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

