import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export const useChatSession = (chatId: string, initialMessages: any[]) => {
  const { messages, sendMessage, status, stop } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport(),
  });
  const [message, setMessage] = useState("");
  const isLoading = status === "submitted" || status === "streaming"
  return { messages, sendMessage, status, stop, isLoading, message, setMessage }
}