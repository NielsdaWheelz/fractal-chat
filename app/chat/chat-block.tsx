import { useState } from "react";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "~/components/ui/chat-input";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "~/components/ui/chat-message";
import { ChatMessageArea } from "~/components/ui/chat-message-area";
import { MessageTool } from "~/chat/message-tool";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

type ChatBlockProps = {
  chatId: string;
  initialMessages: any[];
  docId: string
};

export default function ChatBlock({ chatId, initialMessages, docId }: ChatBlockProps) {
  const { messages, sendMessage, status, stop } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport(),
  });

  const [message, setMessage] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = () => {
    if (!message.trim()) return;
    sendMessage({ text: message }, { body: { documentId: docId } });
    setMessage("");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          {messages?.map((message) => {
            if (message.role !== "user") {
              return (
                <ChatMessage key={message.id} id={message.id}>
                  <ChatMessageAvatar />
                  {message.parts.map((part, i: number) => {
                    switch (part.type) {
                      case 'text': {
                        return (
                          <ChatMessageContent key={`${message.id}-text-${i}`} content={part.text ?? ''} />
                        )
                      }
                      case 'tool-weather': {
                        return (
                          <MessageTool
                            key={`${message.id}-${i}`}
                            part={{
                              type: part.type as string,
                              state: (part as any).state,
                              input: (part as any).input as any,
                              output: (part as any).output as any,
                              toolCallId: (part as any).toolCallId,
                              errorText: (part as any).errorText,
                            }}
                          />
                        )
                      }
                    }
                  })}
                </ChatMessage>
              );
            }
            return (
              <ChatMessage
                key={message.id}
                id={message.id}
                variant="bubble"
                type="outgoing"
              >
                {message.parts.map((part: { type: string; text?: string }, i: number) => {
                  switch (part.type) {
                    case 'text': {
                      return (
                        <ChatMessageContent key={`${message.id}-text-${i}`} content={part.text ?? ''} />
                      )
                    }
                  }
                })}
              </ChatMessage>
            );
          })}
        </div>
      </ChatMessageArea>
      <div className="px-2 py-4 max-w-2xl mx-auto w-full">
        <ChatInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onSubmit={handleSubmit}
          loading={isLoading}
          onStop={stop}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <ChatInputSubmit />
        </ChatInput>
      </div>
    </div>
  );
}
