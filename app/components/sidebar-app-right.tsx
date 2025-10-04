"use client";

import { useEffect, useMemo, useState, type MutableRefObject } from "react";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar-right";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { NavUser } from "~/components/nav-user";
import { ArrowLeft, MessageCircle, MessageCirclePlus } from "lucide-react";
import type { ComponentProps } from "react";
import { Form, useFetcher, useParams } from "react-router";
import ChatBlock from "~/chat/chat-block";

type UIMessagePart = { type: string; text?: string }
type UIMessage = { role: string; parts: UIMessagePart[] }
type ChatListItem = { id: string; messages?: UIMessage[] }
type UserInfo = { name: string; email: string; avatar: string }
type SidebarAppProps = { data: any[]; user: UserInfo; side: "left" | "right"; selectionRef?: MutableRefObject<string> } & ComponentProps<typeof Sidebar>

export function SidebarApp({ side, data, user, selectionRef, includeSelection, setIncludeSelection, ...props }: SidebarAppProps) {
  const { setOpen } = useSidebar()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<ChatListItem[]>(data as ChatListItem[])
  const fetcher = useFetcher<any>()
  const params = useParams()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget as HTMLFormElement
    const input = form.querySelector('input[name="url"]') as HTMLInputElement
    const value = window.prompt("Enter a URL to import", input?.value || "") || ""
    if (!value.trim()) {
      event.preventDefault()
      return
    }
  }
  useEffect(() => {
    setChats(data as ChatListItem[])
  }, [data])

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.id) {
      const newId = fetcher.data.id as string
      setChats((prev) => [{ id: newId, messages: [] }, ...prev])
      setSelectedChatId(newId)
    }
  }, [fetcher.state, fetcher.data])

  // Sync selected chat with URL param if present
  useEffect(() => {
    if (params.chatId) {
      const id = params.chatId as string
      setSelectedChatId(id)
      setChats((prev) => (prev.some((c) => c.id === id) ? prev : [{ id, messages: [] }, ...prev]))
      setOpen(true)
    }
  }, [params.chatId])

  useEffect(() => {
    if (selectedChatId) {
      setOpen(true)
    }
  }, [selectedChatId])

  const selectedChat = useMemo(() => chats.find(c => c.id === selectedChatId) || null, [chats, selectedChatId])

  const convertMessages = (messages) => {
    if (Array.isArray(messages)) return messages as UIMessage[]
    if (typeof messages === "string") {
      try {
        const parsed = JSON.parse(messages)
        return Array.isArray(parsed) ? (parsed as UIMessage[]) : []
      } catch {
        return [] as UIMessage[]
      }
    }
    return [] as UIMessage[]
  }

  const headerTitle = useMemo(() => {
    if (!selectedChat) return "chats"
    let title = "New Chat"
    try {
      const messages = convertMessages(selectedChat.messages)
      const firstUserMessage = (messages ?? []).find((m: UIMessage) => m.role === "user")
      const firstLine = firstUserMessage?.parts?.find((p: UIMessagePart) => p.type === "text")?.text?.split("\n")[0]
      if (firstLine && firstLine.trim().length > 0) {
        title = firstLine.trim()
      }
    } catch { }
    return title
  }, [selectedChat])

  const selectedChatMessages = useMemo(() => {
    if (!selectedChat) return [] as UIMessage[]
    const raw = (selectedChat).messages
    const messages = convertMessages(raw)
    return messages
  }, [selectedChat])

  return (
    <Sidebar className="border-r-0" {...props} side="right">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            {selectedChat && (
              <Button size="icon" variant="ghost" onClick={() => setSelectedChatId(null)}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            )}
            <span className="text-md font-semibold">{headerTitle}</span>
          </div>
          {/* New Chat Button */}
          {/* <fetcher.Form method="post" action="chat-create"> */}
          <Form method="post" action={`/workspace/document/${useParams().id}/chat-create`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" type="submit">
                    <MessageCirclePlus className="h-5 w-5" />
                    <span className="sr-only">New Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Form>
          {/* </fetcher.Form> */}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-4">
          {!selectedChat && (
            <SidebarGroup>
              <SidebarGroupLabel>Recent</SidebarGroupLabel>
              <SidebarMenu>
                {chats.map((chat: ChatListItem) => {
                  let title = "New chat"
                  try {
                    const messages = convertMessages(chat.messages)
                    const firstUserMessage = (messages ?? []).find((m: UIMessage) => m.role === "user")
                    const firstLine = firstUserMessage?.parts?.find((p: UIMessagePart) => p.type === "text")?.text?.split("\n")[0]
                    if (firstLine && firstLine.trim().length > 0) {
                      title = firstLine.trim()
                    }
                  } catch { }
                  return (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton className="w-full justify-start" onClick={() => setSelectedChatId(chat.id)}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span className="text-xs">{title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          )}
          {selectedChat && (
            <div className="h-full">
              <ChatBlock chatId={selectedChat.id} initialMessages={selectedChatMessages} docId={useParams().id as string} selectionRef={selectionRef} includeSelection={includeSelection} setIncludeSelection={setIncludeSelection} />
            </div>
          )}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
