import { useMemo, useState } from "react";
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
import { SearchResultsTool } from "~/chat/search-results-tool";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

type ChatBlockProps = {
  chatId: string;
  initialMessages: any[];
  docId: string
  selectionRef?: React.MutableRefObject<string>
  includeSelection?: boolean
  setIncludeSelection?: (value: boolean) => void
};

export default function ChatBlock({ chatId, initialMessages, docId, selectionRef, includeSelection, setIncludeSelection }: ChatBlockProps) {
  const { messages, sendMessage, status, stop } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport(),
  });

  const [message, setMessage] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

  const selectedText = selectionRef?.current ?? "";
  const truncatedSelection = useMemo(() => selectedText.length > 80
    ? `${selectedText.slice(0, 40)}...${selectedText.slice(selectedText.length - 40)}`
    : selectedText, [selectedText]);

  const handleSubmit = () => {
    if (!message.trim()) return;
    const textToSend = includeSelection && selectedText
      ? `${selectedText}\n\n${message}`
      : message;
    sendMessage({ text: textToSend }, { body: { documentId: docId, selection: includeSelection ? selectedText : undefined } });
    setMessage("");
    setIncludeSelection?.(false);
    if (selectionRef) selectionRef.current = "";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-1 py-2 space-y-1 text-xs">
          {messages?.map((message) => {
            if (message.role !== "user") {
              return (
                <ChatMessage key={message.id} id={message.id}>
                  {/* <ChatMessageAvatar /> */}
                  <div className="flex flex-col gap-1">
                    {message.parts.map((part, i: number) => {
                      switch (part.type) {
                        case 'text': {
                          return (
                            <ChatMessageContent key={`${message.id}-text-${i}`} content={part.text ?? ''} />
                          )
                        }
                        case 'tool-searchDocuments': {
                          return (
                            <SearchResultsTool
                              key={`${message.id}-${i}`}
                              toolPart={{
                                type: part.type as string,
                                state: part.state,
                                input: part.input,
                                output: part.output,
                                toolCallId: part.toolCallId,
                                errorText: part.errorText,
                              }}
                            />
                          )
                        }
                      }
                    })}
                  </div>
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
        {includeSelection && selectedText && (
          <div className="mb-2 text-xs border rounded-md p-2 bg-muted/40 flex items-start gap-2">
            <div className="flex-1 whitespace-pre-wrap break-words">{truncatedSelection}</div>
            <button className="p-1" onClick={() => setIncludeSelection?.(false)} aria-label="Remove selection">✕</button>
          </div>
        )}
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
