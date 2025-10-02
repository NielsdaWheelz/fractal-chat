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
} from "~/components/ui/sidebar-left";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { NavUser } from "~/components/nav-user";
import { FilePlus2, BookOpenText, FileText } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Form, NavLink } from "react-router";

type UIMessagePart = { type: string; text?: string }
type UIMessage = { role: string; parts: UIMessagePart[] }
type ChatListItem = { id: string; messages?: UIMessage[] }
type UserInfo = { name: string; email: string; avatar: string }
type SidebarAppProps = { data: any[]; user: UserInfo; side: "left" | "right" } & ComponentProps<typeof Sidebar>

export function SidebarApp({ side, data, user, ...props }: SidebarAppProps) {
  const [url, setUrl] = useState("")

  const handleInput = (event) => {
    setUrl(event.target.value)
  }

  const handleSubmit = (event) => {
    // event.preventDefault()
    const form = event.currentTarget as HTMLFormElement

    const input = form.querySelector('input[name="url"]') as HTMLInputElement
    // const value = window.prompt("Enter a URL to import", input?.value || "") || ""
    if (!value.trim()) {
      event.preventDefault()
      return
    }
    if (input) input.value = value.trim()
  }

  return (
    <Sidebar className="border-r-0" {...props} side="left">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpenText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">reader-ai</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* New Document Button */}
        <Form method="post" action="document-create" onSubmit={handleSubmit}>
          <input className="" type="text" name="url" value={url} onInput={handleInput} placeholder="new document url"/>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" type="submit">
                  <FilePlus2 className="h-5 w-5" />
                  <span className="sr-only">New Document</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Form>
        <div className="flex flex-col gap-4">
          {/* Recent Chats */}
          <SidebarGroup>
            <SidebarGroupLabel>Recent</SidebarGroupLabel>
            <SidebarMenu>
              {data.map((document: { id: string, title?: string | null, url?: string }) => {
                const title = (document.title && document.title.trim().length > 0)
                  ? document.title
                  : (document.url || document.id)
                return (
                  <NavLink key={document.id} to={"/workspace/document/" + document.id}>
                    <SidebarMenuItem key={document.id}>
                      <SidebarMenuButton className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
