import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { SearchResultsTool } from "~/chat/search-results-tool";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "~/components/ui/chat-input";
import {
  ChatMessage,
} from "~/components/ui/chat-message";
import { ChatMessageArea } from "~/components/ui/chat-message-area";
import { MentionMessageContent } from "~/components/ui/mention-message-content";
import { extractMentionIds } from "~/utils/mention-parser";
import { parseSelectionFromMessage } from "~/utils/selection-parser";
import { SelectionPart } from "~/chat/selection-part";

type ChatBlockProps = {
  chatId: string;
  initialMessages: any[];
  docId: string
  selectionRef?: React.MutableRefObject<string>
  includeSelection?: boolean
  setIncludeSelection?: (value: boolean) => void
};

function parseSelection(raw: unknown) {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof raw === "object") return raw;
  return null;
}

function getSelectionQuote(raw: unknown) {
  const obj = parseSelection(raw);
  if (obj && typeof obj === "object" && "quote" in obj) {
    return String((obj).quote ?? "");
  }
  return typeof raw === "string" ? raw : "";
}


export default function ChatBlock({ chatId, initialMessages, docId, selectionRef, includeSelection, setIncludeSelection }: ChatBlockProps) {
  const { messages, sendMessage, status, stop } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport(),
  });

  const [message, setMessage] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

  const selectedText = selectionRef?.current ?? "";
  const selectionQuote = useMemo(
    () => getSelectionQuote(selectedText),
    [selectedText]
  );


  const truncatedSelection = useMemo(() => selectionQuote.length > 80
    ? `${selectionQuote.slice(0, 40)}...${selectionQuote.slice(selectionQuote.length - 40)}`
    : selectionQuote, [selectionQuote]);

  const handleSubmit = () => {
    if (!message.trim()) return;

    let selectionData: { text: string; prefix?: string; suffix?: string } | null = null;
    if (includeSelection && selectedText) {
      try {
        const parsed = JSON.parse(selectedText);
        selectionData = {
          text: parsed.quote || selectedText,
          prefix: parsed.prefix,
          suffix: parsed.suffix,
        };
      } catch {
        selectionData = { text: selectedText };
      }
    }

    const mentions = extractMentionIds(message);

    const messageText = selectionData
      ? `[SELECTION]\n${selectionData.prefix ? `...${selectionData.prefix} ` : ''}${selectionData.text}${selectionData.suffix ? ` ${selectionData.suffix}...` : ''}\n[/SELECTION]\n\n${message}`
      : message;

    sendMessage(
      { text: messageText },
      {
        body: {
          documentId: docId,
          selectionData: selectionData || undefined,
          mentions
        }
      }
    );
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
                            <MentionMessageContent key={`${message.id}-text-${i}`} content={part.text ?? ''} />
                          )
                        }
                        case 'tool-searchDocuments': {
                          return (
                            <SearchResultsTool
                              key={`${message.id}-${i}`}
                              toolPart={{
                                type: part.type,
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

            const textParts = message.parts?.filter(p => p.type === 'text') || [];
            const firstTextPart = textParts[0];
            const messageContent = (firstTextPart)?.text || '';
            const parsed = parseSelectionFromMessage(messageContent);

            return (
              <ChatMessage
                key={message.id}
                id={message.id}
                variant="bubble"
                type="outgoing"
              >
                <div className="flex flex-col gap-1">
                  {parsed.hasSelection && parsed.selectionData && (
                    <SelectionPart
                      text={parsed.selectionData.text}
                      prefix={parsed.selectionData.prefix}
                      suffix={parsed.selectionData.suffix}
                    />
                  )}
                  {parsed.messageText && (
                    <MentionMessageContent content={parsed.messageText} />
                  )}
                  {!parsed.hasSelection && messageContent && (
                    <MentionMessageContent content={messageContent} />
                  )}
                </div>
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
