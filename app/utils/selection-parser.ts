export function parseSelectionFromMessage(content: string): {
  hasSelection: boolean;
  selectionData?: { text: string; prefix?: string; suffix?: string };
  messageText: string;
} {
  const selectionRegex = /\[SELECTION\]\n([\s\S]*?)\n\[\/SELECTION\]\n\n([\s\S]*)/;
  const match = content.match(selectionRegex);

  if (!match) {
    return {
      hasSelection: false,
      messageText: content,
    };
  }

  const fullSelection = match[1] || '';
  const messageText = match[2] || '';

  const prefixMatch = fullSelection.match(/^\.\.\.([^\n]+?)\s+/);
  const suffixMatch = fullSelection.match(/\s+([^\n]+?)\.\.\.\s*$/);

  let text = fullSelection;
  let prefix: string | undefined;
  let suffix: string | undefined;

  if (prefixMatch) {
    prefix = prefixMatch[1].trim();
    text = text.replace(/^\.\.\.[^\n]+?\s+/, '');
  }

  if (suffixMatch) {
    suffix = suffixMatch[1].trim();
    text = text.replace(/\s+[^\n]+?\.\.\.\s*$/, '');
  }

  return {
    hasSelection: true,
    selectionData: {
      text: text.trim(),
      prefix,
      suffix,
    },
    messageText,
  };
}