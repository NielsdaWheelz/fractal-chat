"use client";

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
} from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { NavUser } from "~/components/nav-user";
import { MessageCircle, SquarePen } from "lucide-react";
import type { ComponentProps } from "react";
import { Form, NavLink } from "react-router";

type UIMessagePart = { type: string; text?: string }
type UIMessage = { role: string; parts: UIMessagePart[] }
type ChatListItem = { id: string; messages?: UIMessage[] }
type SidebarAppProps = { data: { chats: ChatListItem[]; user: { name: string; email: string; avatar: string } } } & ComponentProps<typeof Sidebar>

export function SidebarApp({  data, ...props }: SidebarAppProps) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">simple-ai</span>
          </div>
          {/* New Chat Button */}
          <Form method="post" action="chat-create">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" type="submit">
                    <SquarePen className="h-5 w-5" />
                    <span className="sr-only">New Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Form>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-4">
          {/* Recent Chats */}
          <SidebarGroup>
            <SidebarGroupLabel>Recent</SidebarGroupLabel>
            <SidebarMenu>
              {data.chats.map((chat: ChatListItem) => {
                let title = chat.id
                try {
                  const firstUserMessage = (chat.messages ?? []).find((m: UIMessage) => m.role === "user")
                  const firstLine = firstUserMessage?.parts?.find((p: UIMessagePart) => p.type === "text")?.text?.split("\n")[0]
                  if (firstLine && firstLine.trim().length > 0) {
                    title = firstLine.trim()
                  }
                } catch {}
                return (
                  <NavLink key={chat.id} to={"/workspace/chat/" + chat.id}>
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton className="w-full justify-start">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </NavLink>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
