import { MessageCircle } from "lucide-react";
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

const ChatList = (props: {chats, setSelectedChatId}) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <SidebarMenu>
        {props.chats.map((chat: ChatListItem) => {
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
              <SidebarMenuButton className="w-full justify-start" onClick={() => props.setSelectedChatId(chat.id)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                <span className="text-xs">{title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default ChatList