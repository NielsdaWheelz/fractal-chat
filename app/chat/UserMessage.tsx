import { Message as MessageKit, MessageAvatar, MessageContent } from "~/components/ui/message"
import Content from './Content'

const UserMessage = ({ message }: { message: ChatMessage }) => {
  return (
    <MessageContent className="bg-transparent p-0">
      <MessageKit className="justify-end">
        {message.parts.map((part, i) => {
          switch (part.type) {
            case 'text': {
              return (
                <Content key={`${message.id}-${i}`} text={part.text ?? ''} />
              )
            }
          }
        })}
      </MessageKit>
    </MessageContent >
  )
}

export default UserMessage