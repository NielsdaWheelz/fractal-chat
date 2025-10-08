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
  TooltipTrigger,
  TooltipProvider
} from "~/components/ui/tooltip";
import { NavUser } from "~/components/nav-user";
import { ArrowLeft, MessageCircle, MessageCirclePlus, BoxIcon, HouseIcon, PanelsTopLeftIcon, Highlighter } from "lucide-react"
import type { ComponentProps } from "react";
import { Form, useFetcher, useParams } from "react-router";
import ChatBlock from "~/chat/chat-block";
import AvatarGroupBottomDemo from "./groupavatar";
import ChatList from "./ChatList";
import AnnotationList from "./AnnotationList";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"

type UIMessagePart = { type: string; text?: string }
type UIMessage = { role: string; parts: UIMessagePart[] }
type ChatListItem = { id: string; messages?: UIMessage[] }
type UserInfo = { name: string; email: string; avatar: string }
type SidebarAppProps = { data; user: UserInfo; side: "left" | "right"; selectionRef?: MutableRefObject<string> } & ComponentProps<typeof Sidebar>

export function SidebarApp({ side, data, user, selectionRef, includeSelection, setIncludeSelection, ...props }: SidebarAppProps) {
  const [mode, setMode] = useState("annotation")
  const { setOpen } = useSidebar()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<ChatListItem[]>(data.chats as ChatListItem[])
  const [annotations, setAnnotations] = useState(data.annotations)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const fetcher = useFetcher<any>()
  const params = useParams()

  const activeItems = mode === "chats" ? chats : annotations
  const selectedItemId = mode === "chats" ? selectedChatId : selectedAnnotationId

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
    setChats(data.chats as ChatListItem[])
    setAnnotations(data.annotations as AnnotationListItem[])
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
  const selectedAnnotation = useMemo(() => chats.find(c => c.id === selectedAnnotationId) || null, [chats, selectedAnnotationId])

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
        <Tabs defaultValue="tab-1" className="items-center">
          <div className="flex w-full items-center justify-between">
            <TabsList>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <TabsTrigger value="tab-1" className="py-3" onClick={() => {
                        setMode("annotation")
                        setSelectedChatId(null)
                        setSelectedAnnotationId(null)
                      }}>
                        <Highlighter size={16} aria-hidden="true" />
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Annotations
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <TabsTrigger value="tab-2" className="group py-3" onClick={() => {
                        setMode("chat")
                        setSelectedChatId(null)
                        setSelectedAnnotationId(null)
                      }}>
                        <span className="relative">
                          <MessageCircle size={16} aria-hidden="true" />
                        </span>
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Chats
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsList>
            {/* New Chat Button */}
            {/* <fetcher.Form method="post" action="chat-create"> */}
            <Form method="post" action={`/workspace/document/${useParams().id}/chat-create`}>
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
            </Form>
          </div>
          <TabsContent value="tab-1">
            <div className="flex items-center gap-2">
              <span className="text-md font-semibold">annotations</span>
            </div>
          </TabsContent>
          <TabsContent value="tab-2">
            <div className="flex items-center gap-2">
              {selectedChat && (
                <Button size="icon" variant="ghost" onClick={() => setSelectedChatId(null)}>
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back</span>
                </Button>
              )}
              <span className="text-md font-semibold">{headerTitle}</span>
            </div>
          </TabsContent>
        </Tabs>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-4">
          {!selectedChat && mode === "chat" && (
            <ChatList chats={chats} setSelectedChatId={setSelectedChatId} />
          )}
          {selectedChat && mode === "chat" && (
            <div className="h-full">
              <ChatBlock chatId={selectedChat.id} initialMessages={selectedChatMessages} docId={useParams().id as string} selectionRef={selectionRef} includeSelection={includeSelection} setIncludeSelection={setIncludeSelection} />
            </div>
          )}
          {mode === "annotation" && (
            <AnnotationList annotations={annotations} setSelectedAnnotationId={setSelectedAnnotationId} />

          )}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
