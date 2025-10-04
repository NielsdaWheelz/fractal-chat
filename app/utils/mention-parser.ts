export function parseMentions(text: string) {
  const mentions = []
  const regex = /@\[([^\]]+)\]\((document|author):([^)]+)\)/g
  // regex for matching `@[...]`

  let match
  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, label, type, id] = match
    if (type === 'document' || type === 'author') {
      mentions.push({ type, id, label })
    }
  }

  return mentions
}

export function extractMentionIds(text: string): { documentIds: string[], authorIds: string[] } {
  const mentions = parseMentions(text)

  const documentIds = []
  const authorIds = []

  for (const mention of mentions) {
    if (mention.type === 'document') {
      documentIds.push(mention.id)
    } else if (mention.type === 'author') {
      authorIds.push(mention.id)
    }
  }

  return { documentIds, authorIds }
}

export function removeMentionMarkup(text: string): string {
  // replace all "mention" md with @-mentions
  return text.replace(/@\[([^\]]+)\]\((document|author):([^)]+)\)/g, '@$1')
}

export function insertMention(
  text: string,
  cursorPosition: number,
  mention
) {
  const mentionMarkup = `@[${mention.label}](${mention.type}:${mention.id})`

  const before = text.slice(0, cursorPosition)
  const after = text.slice(cursorPosition)

  const newText = before + mentionMarkup + after
  const newCursorPosition = cursorPosition + mentionMarkup.length

  return { newText, newCursorPosition }
}

// parse text with mention into array of text/mention parts
export function splitTextWithMentions(text: string) {
  const parts = []
  const regex = /@\[([^\]]+)\]\((document|author):([^)]+)\)/g

  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      })
    }

    // add the mention
    const [, label, type, id] = match
    if (type === 'document' || type === 'author') {
      parts.push({
        type: 'mention',
        content: { type, id, label }
      })
    }

    lastIndex = match.index + match[0].length
  }

  // add text after last mention
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    })
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content: text })
  }

  return parts
}

