import Content from './Content'
import { ToolComponent } from './Tool'
import { Message as MessageKit, MessageAvatar, MessageContent } from "~/components/ui/message"

const Message = ({ message }: { message }) => {
  const parts = message.parts ?? []

  return (
    <div className="flex flex-col gap-8">
      <MessageKit className="justify-start">
        <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
        <div className="flex w-full flex-col gap-2">
          <MessageContent className="bg-transparent p-0">
            {parts.map((part, i) => {
              switch (part.type) {
                case 'text': {
                  return (
                    <Content key={`${message.id}-${i}`} text={part.text ?? ''} />
                  )
                }
                case 'tool-weather': {
                  return (
                    <ToolComponent key={`${message.id}-${i}`} part={part} />
                  )
                }
                // default: {
                //   return (
                //     <div
                //       key={`${message.id}-${i}`}
                //       className="text-muted-foreground w-full max-w-md rounded border p-2 font-mono text-xs"
                //     >
                //       <pre className="whitespace-pre-wrap">{JSON.stringify({ role: message.role, part }, null, 2)}</pre>
                //     </div>
                //   )
                // }
              }
            })}
          </MessageContent>
        </div>
      </MessageKit>
    </div>
  )
}

export default Message