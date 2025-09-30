// import { getSession } from "../routes/api.auth";
// import { redirect } from "react-router";
// import type { Route } from "./+types/chat";
import { Loader } from "~/components/ui/loader"
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea } from "~/components/ui/prompt-input"
import { ArrowUp, Square } from "lucide-react"
import { Button } from "~/components/ui/button";
import AIMessage from "./AIMessage"
import UserMessage from "./UserMessage"
import { ChatContainerContent, ChatContainerRoot } from "~/components/ui/chat-container"
import { Message as MessageKit, MessageAvatar, MessageContent } from "~/components/ui/message"

// export async function loader({ request }: Route.LoaderArgs) {
//   const session = await getSession(request);
//   if (!session?.user) {
//     return redirect("/")
//   }
//   return null
// }

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const { messages, sendMessage, status, stop } = useChat();
  const isLoading = status === "submitted"
  const isStreaming = status  === "streaming"

  const handleSubmit = () => {
    if (isLoading) {
      stop()
      return
    }

    const text = newMessage.trim()
    if (!text) return

    sendMessage({ text })
    setNewMessage("")
  }


  return (
    <>
      <ChatContainerRoot className="flex-1">
        <ChatContainerContent className="space-y-4 p-4">
          {messages.map(message => {
            if (message.role === "user") return <UserMessage message={message} />
            else if (message.role === "assistant") return <AIMessage message={message} />
          })}
          {isLoading || isStreaming && (
            <div className="flex flex-col gap-8">
              <MessageKit className="justify-start">
                <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
                <div className="flex w-full flex-col gap-2">
                  <div className="bg-transparent p-0">
                    <Loader variant="typing" size="sm" />
                  </div>
                </div>
              </MessageKit>
            </div>
          )}
          <PromptInput
            value={newMessage}
            onValueChange={(value) => setNewMessage(value)}
            isLoading={isLoading || isStreaming}
            onSubmit={handleSubmit}
            className="w-full max-w-(--breakpoint-md)"
          >
            <PromptInputTextarea placeholder="Ask me anything..." />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={isLoading || isStreaming ? "Stop generation" : "Send message"}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSubmit}
                >
                  {isLoading || isStreaming ? (
                    <Square className="size-5 fill-current" />
                  ) : (
                    <ArrowUp className="size-5" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </ChatContainerContent>
      </ChatContainerRoot>
    </>
  )
}

export default Chat