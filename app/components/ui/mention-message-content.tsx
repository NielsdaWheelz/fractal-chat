import { splitTextWithMentions } from "~/utils/mention-parser"
import { MentionPill } from "./mention-pill"
import { MarkdownContent } from "./markdown-content"

export function MentionMessageContent({ content }) {
  const parts = splitTextWithMentions(content)

  return (
    <div className="inline">
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          const mention = part.content
          return (
            <MentionPill
              key={`mention-${index}`}
              label={mention.label}
              type={mention.type}
              variant="readonly"
              className="mx-0.5 inline-flex align-middle"
            />
          )
        } else {
          const textContent = part.content as string
          return (
            <span key={`text-${index}`}>
              <MarkdownContent content={textContent} />
            </span>
          )
        }
      })}
    </div>
  )
}

