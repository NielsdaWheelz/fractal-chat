// import { getSession } from "../routes/api.auth";
// import { redirect } from "react-router";
// import type { Route } from "./+types/chat";
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea } from "~/components/ui/prompt-input"
import { ArrowUp, Square } from "lucide-react"
import { Button } from "~/components/ui/button";
import AIMessage from "./AIMessage"
import UserMessage from "./UserMessage"
import { ChatContainerContent, ChatContainerRoot } from "~/components/ui/chat-container"

// export async function loader({ request }: Route.LoaderArgs) {
//   const session = await getSession(request);
//   if (!session?.user) {
//     return redirect("/")
//   }
//   return null
// }

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const { messages, sendMessage } = useChat();
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    setIsLoading(true)
    sendMessage({ text: newMessage })
    setNewMessage("")
    setIsLoading(false)
  }


  return (
    <>
      <ChatContainerRoot className="flex-1">
        <ChatContainerContent className="space-y-4 p-4">
          {messages.map(message => {
            if (message.role === "user") return <UserMessage message={message} />
            else if (message.role === "assistant") return <AIMessage message={message} />
          })}
          <PromptInput
            value={newMessage}
            onValueChange={(value) => setNewMessage(value)}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            className="w-full max-w-(--breakpoint-md)"
          >
            <PromptInputTextarea placeholder="Ask me anything..." />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={isLoading ? "Stop generation" : "Send message"}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSubmit}
                >
                  {isLoading ? (
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