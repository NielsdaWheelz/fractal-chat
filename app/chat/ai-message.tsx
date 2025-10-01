import MessageTextContent from './message-text-content'
import { MessageTool } from './message-tool'
import { Message as MessageKit, MessageAvatar, MessageContent, MessageActions, MessageAction } from "~/components/ui/message"
import { Button } from "~/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from 'react'

type ChatMessage = {
  id?: string
  role: string
  parts?: Array<{ type: string; text?: string } & Record<string, unknown>>
}

const Message = ({ message }: { message: ChatMessage }) => {
  const parts = message.parts ?? []
  const [copied, setCopied] = useState(false)

  const copyAll = async () => {
    const text = parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as { text?: string }).text ?? '')
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (_) {}
  }

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
                    <MessageTextContent key={`${message.id}-${i}`} text={(part).text ?? ''} />
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