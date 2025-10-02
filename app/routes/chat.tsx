import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type React from "react";
import { Button } from "~/components/ui/button";
import { useState } from 'react';
import { redirect, type LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { getChat } from "..";
import { Loader } from "~/components/ui/loader"
import { PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea } from "~/components/ui/prompt-input"
import { ArrowUp, Square } from "lucide-react"
import AIMessage from "../chat/ai-message"
import UserMessage from "../chat/user-message"
import { ChatContainerContent, ChatContainerRoot } from "~/components/ui/chat-container"
import { Message as MessageKit, MessageAvatar } from "~/components/ui/message"
import type { Route } from "../+types/root";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUser(request)
  if (!params.id) {
    throw redirect("/")
  }
  const chat = await getChat(params.id, userId)
  if (!chat) {
    throw redirect("/")
  }
  return { chat: chat }
}

export default function Chat({ loaderData }: Route.ComponentProps) {
  const chat = loaderData.chat!
  const { messages, sendMessage, status } = useChat({
    id: chat.id,
    messages: chat.messages,
    transport: new DefaultChatTransport(),
  });
  const [message, setMessage] = useState("");
  const isLoading = status === "submitted" || status === "streaming"

  const handleSubmit = (e: React.FormEvent) => {
    // e.preventDefault();

    if (message.trim()) {
      sendMessage({ text: message })
      setMessage("");
    }
  };

  return (
    <ChatContainerRoot className="flex-1">
      <ChatContainerContent className="mx-auto w-full max-w-2xl space-y-4 p-4">
        {!isLoading && (
          <div className="text-muted-foreground mx-auto mt-10 flex w-full max-w-xl flex-col items-center gap-3 text-center">
            {/* <img src="/favicon.ico" alt="App" className="h-8 w-8 opacity-70" /> */}
            <div className="text-foreground text-base font-medium">Welcome</div>
            <p className="text-sm">Ask a question to get started. Shift+Enter for newline, Enter to send.</p>
          </div>
        )}
        {messages.map((message, idx) => {
          if (message.role === "user") return <UserMessage key={message.id ?? `msg-${idx}`} message={message} />
          else if (message.role === "assistant") return <AIMessage key={message.id ?? `msg-${idx}`} message={message} />
          return null
        })}
        {isLoading && (
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
        <PromptInput value={message} onValueChange={(value) => setMessage(value)} isLoading={isLoading} onSubmit={handleSubmit} className="w-full max-w-(--breakpoint-md)" disabled={isLoading && message.length > 0} >
          <PromptInputTextarea placeholder="Ask me anything..." />
          <PromptInputActions className="justify-end pt-2">
            <PromptInputAction tooltip={isLoading ? "Stop generation" : "Send message"} >
              <Button variant="default" size="icon" className="h-8 w-8 rounded-full" onClick={handleSubmit} >
                {isLoading ? (<Square className="size-5 fill-current" />) : (<ArrowUp className="size-5" />)}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </ChatContainerContent>
    </ChatContainerRoot>
  );
}