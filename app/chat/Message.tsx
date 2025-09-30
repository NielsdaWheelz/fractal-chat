import Content from './Content'
import { ToolComponent } from './Tool'
import type { ToolPart } from "~/components/ui/tool"

type ChatPart = {
  type: string
  text?: string
  state?: ToolPart["state"]
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  toolCallId?: string
  errorText?: string
}

type ChatMessage = {
  id: string
  role: string
  parts?: ChatPart[]
}

const Message = ({ message }: { message: ChatMessage }) => {
  const parts = message.parts ?? []

  return (
    <div className="w-full">
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
    </div>
  )
}

export default Message