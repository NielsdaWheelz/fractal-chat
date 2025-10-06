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
import { FilePlus2, BookOpenText, FileText, Search, SearchX } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";
import { Form, NavLink, useFetcher } from "react-router";

type UIMessagePart = { type: string; text?: string }
type UIMessage = { role: string; parts: UIMessagePart[] }
type ChatListItem = { id: string; messages?: UIMessage[] }
type UserInfo = { name: string; email: string; avatar: string }
type SidebarAppProps = { data: any[]; user: UserInfo; side: "left" | "right" } & ComponentProps<typeof Sidebar>

export function SidebarApp({ side, data, user, ...props }: SidebarAppProps) {
  const [url, setUrl] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [query, setQuery] = useState("")

  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data && fetcher.data.length > 0) {
      setSearchResults(fetcher.data);
    } else if (fetcher.state === 'idle' && fetcher.data?.length === 0) {
      setSearchResults([]);
    }
  }, [fetcher.data, fetcher.state]);

  const handleSearchSubmit = (event) => {
    const form = event.currentTarget as HTMLFormElement
    const input = form.querySelector('input[name="query"]') as HTMLInputElement
    const value = input?.value || "";

    if (!value.trim()) {
      event.preventDefault() // Prevent submission if empty
      return
    }
  }

  const handleUrlInput = (event) => {
    setUrl(event.target.value)
  }

  const handleNewDocSubmit = (event) => {
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
        <fetcher.Form method="get" action="/workspace/document-search" onSubmit={handleSearchSubmit}>
          <input className="text-xs py-2 pl-4 pr-2" type="text" name="query" placeholder="search" value={query} onChange={(e) => { setQuery(e.target.value) }} />
          {searchResults.length > 0 ? <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => {
                    setSearchResults([])
                    setQuery("")
                  }}>
                    <SearchX className="h-5 w-5" />
                    <span className="sr-only">clear search</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear Search</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
            :
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" type="submit">
                      <Search className="h-5 w-5" />
                      <span className="sr-only">search</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </>
          }
        </fetcher.Form>
        <Form method="post" action="document-create" onSubmit={handleNewDocSubmit}>
          <input className="text-xs py-2 pl-4 pr-2" type="text" name="url" value={url} onInput={handleUrlInput} placeholder="new document url" />
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
          <SidebarGroup>
            {/* Recent Chats */}
            {searchResults.length > 0 ? <>
              <SidebarGroupLabel>Search Results</SidebarGroupLabel>
              <SidebarMenu>
                {searchResults.map((match) => {
                  const resultText = match.chunkText.slice(0, 25)
                  const title = (match.documentTitle && match.documentTitle.trim().length > 0)
                    ? match.documentTitle
                    : (match.documentUrl || match.documentId)
                  return (
                    <NavLink key={match.documentId} to={"/workspace/document/" + match.documentId}>
                      <SidebarMenuItem key={match.documentId}>
                        <SidebarMenuButton className="w-full justify-start text-xs flex flex-row">
                          <FileText className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="text-[10px]">{resultText}</span>
                            <div className="flex flex-row">
                              <span className="text-[7px]">{title} - </span><span className="text-[7px]">{match.documentAuthor}</span>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </NavLink>
                  )
                })}
              </SidebarMenu>
            </>
              : <>
                <SidebarGroupLabel>Recent</SidebarGroupLabel>
                <SidebarMenu>
                  {data.map((document: { id: string, title?: string | null, url?: string }) => {
                    const title = (document.title && document.title.trim().length > 0)
                      ? document.title
                      : (document.url || document.id)
                    return (
                      <NavLink className="truncate" key={document.id} to={"/workspace/document/" + document.id}>
                        <SidebarMenuItem key={document.id}>
                          <SidebarMenuButton className="w-full justify-start text-xs">
                            <FileText className="mr-2 h-4 w-4" />
                            {title}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </NavLink>
                    )
                  })}
                </SidebarMenu>
              </>
            }
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
