import { Message as MessageKit, MessageAvatar, MessageContent } from "~/components/ui/message"
import { Markdown } from "~/components/ui/markdown"
import MessageTextContent from './message-text-content'

const UserMessage = ({ message }: { message }) => {
  return (
    <MessageKit className="justify-end">
      <MessageAvatar src="/avatars/user.png" alt="You" fallback="You" />
      <MessageContent className="bg-transparent p-0">
        {message.parts.map((part: { type: string; text?: string }, i: number) => {
          switch (part.type) {
            case 'text': {
              return (
                <div className="w-full min-w-full">
                  <Markdown key={`${message.id}-${i}`} className="prose prose-sm dark:prose-invert prose-h2:mt-0! prose-h2:scroll-m-0!">
                    {part.text ?? ''}
                  </Markdown>
                </div>
              )
            }
          }
        })}
      </MessageContent >
    </MessageKit>
  )
}

export default UserMessage