import { escapeHtml } from '../components/widgets/Utils.js';

export function formatInlineMarkdown(content = '') {
  return String(content)
    .replace(/`([^`]+)`/g, (_, value) => `<code>${escapeHtml(value)}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
