import MessageTextContent from './message-text-content'
import { MessageTool } from './message-tool'
import { Message as MessageKit, MessageAvatar, MessageContent } from "~/components/ui/message"
import type { ToolPart } from "~/components/ui/tool"

type TextPart = { type: 'text'; text?: string }
type ToolishPart = {
  type: string
  state?: ToolPart["state"]
  input?: Record<string, unknown> | string
  output?: Record<string, unknown>
  toolCallId?: string
  errorText?: string
}

type AIAssistantMessage = {
  id: string
  role: 'assistant' | string
  parts?: Array<TextPart | ToolishPart>
}

const Message = ({ message }: { message: AIAssistantMessage }) => {
  const parts = message.parts ?? []

  return (
    <div className="flex flex-col gap-8">
      <MessageKit className="justify-start">
        <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
        <div className="flex w-full flex-col gap-2">
          <MessageContent className="bg-transparent p-0">
            {parts.map((part, i: number) => {
              switch (part.type) {
                case 'text': {
                  return (
                    <MessageTextContent key={`${message.id}-${i}`} text={(part as TextPart).text ?? ''} />
                  )
                }
                case 'tool-weather': {
                  return (
                    <MessageTool key={`${message.id}-${i}`} part={part} />
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
      </MessageKit >
    </div >
  )
}

export default Message