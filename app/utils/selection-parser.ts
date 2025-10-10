export function parseSelectionFromMessage(content: string): {
  hasSelection: boolean;
  selectionData?: { text: string; prefix?: string; suffix?: string };
  messageText: string;
} {
  const selectionRegex = /\[SELECTION\]\n((?:\.\.\.([^\n]+)\s+)?([^\n]+?)(?:\s+([^\n]+)\.\.\.)?)?\n\[\/SELECTION\]\n\n([\s\S]*)/;
  const match = content.match(selectionRegex);

  if (!match) {
    return {
      hasSelection: false,
      messageText: content,
    };
  }

  const fullSelection = match[1] || '';
  const prefix = match[2];
  const suffix = match[4];
  const messageText = match[5] || '';

  let text = fullSelection;
  if (prefix) {
    text = text.replace(`...${prefix} `, '');
  }
  if (suffix) {
    text = text.replace(` ${suffix}...`, '');
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