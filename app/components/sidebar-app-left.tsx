"use client";

import { ArrowLeft, FilePlus2, Library, Search, SearchX, UserPlus, Users } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";
import { Form, useFetcher } from "react-router";
import { NavUser } from "~/components/nav-user";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail
} from "~/components/ui/sidebar-left";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import DocumentList from "./document/DocumentList";
import GroupList from "./group/GroupList";
import SearchResultList from "./SearchResultList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import UploadForm from "./upload-form";

type UIMessagePart = { type: string; text?: string }
type UIMessage = { role: string; parts: UIMessagePart[] }
type ChatListItem = { id: string; messages?: UIMessage[] }
type UserInfo = { name: string; email: string; avatar: string }
type SidebarAppProps = { data: any[]; user: UserInfo; side: "left" | "right" } & ComponentProps<typeof Sidebar>

export function SidebarApp({ side, data, user, ...props }: SidebarAppProps) {
  const [mode, setMode] = useState("document")
  const [groupId, setGroupId] = useState(null)
  const [documentId, setDocumentId] = useState(null)
  const [url, setUrl] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [query, setQuery] = useState("")

  const fetcher = useFetcher();

  useEffect(() => {
    if (data?.document) setDocumentId(document.id)
  }), [data]


  useEffect(() => {
    if (fetcher.data && fetcher.data.length > 0) {
      setSearchResults(fetcher.data);
      setMode("search")
    } else if (fetcher.state === 'idle' && fetcher.data?.length === 0) {
      setSearchResults([]);
    //  setMode("group")
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

  const openNewGroupModal = () => {

  }

  return (
    <Sidebar className="border-r-0" {...props} side="left">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <img
              src="/logo-transparent-bg.png"
              alt="App logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <Tabs defaultValue="tab-1" className="items-center">
          <div className="flex w-full items-center justify-between">
            <Button size="icon" variant="ghost" onClick={() => {
              setGroupId(null)
              setDocumentId(null)
            }}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <TabsList>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <TabsTrigger value="tab-2" className="group py-3" onClick={() => {
                      setMode("groups")
                      setGroupId(null)
                      setDocumentId(null)
                    }}>
                      <span className="relative">
                        <Users size={16} aria-hidden="true" />
                      </span>
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  Groups
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <TabsTrigger value="tab-1" className="py-3" onClick={() => {
                      setMode("document")
                      setGroupId(null)
                      setDocumentId(null)
                    }}>
                      <Library size={16} aria-hidden="true" />
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  Reads
                </TooltipContent>
              </Tooltip>
            </TabsList>
            <Button size="icon" variant="ghost" onClick={openNewGroupModal}>
              <UserPlus className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>

          </div>
          <TabsContent value="tab-1">
            <div className="flex items-center gap-2">
              <span className="text-md font-semibold">Reads</span>
            </div>
          </TabsContent>
          <TabsContent value="tab-2">
            <div className="flex items-center gap-2">
              <span className="text-md font-semibold">Groups</span>
            </div>
          </TabsContent>
        </Tabs>
      </SidebarHeader>
      <SidebarContent>
        <fetcher.Form method="get" action="/workspace/document-search" onSubmit={handleSearchSubmit}>
          <input className="text-xs py-2 pl-4 pr-2" type="text" name="query" placeholder="search" value={query} onChange={(e) => { setQuery(e.target.value) }} />
          {searchResults.length > 0 ?
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => {
                    setSearchResults([])
                    setMode("group")
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
            </>
            :
            <>
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
            </>
          }
        </fetcher.Form>
        <Form method="post" action="document-create" onSubmit={handleNewDocSubmit}>
          <input className="text-xs py-2 pl-4 pr-2" type="text" name="url" value={url} onInput={handleUrlInput} placeholder="new document url" />
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
        </Form>
        <UploadForm />
        <div className="flex flex-col gap-4">
          <SidebarGroup>
            {searchResults.length > 0 ?
              <>
                <SidebarGroupLabel>Search Results</SidebarGroupLabel>
                <SidebarMenu>
                  <SearchResultList results={searchResults} />
                </SidebarMenu>
              </>
              :
              mode === "document" ?
                <>
                  <SidebarGroupLabel>Recent</SidebarGroupLabel>
                  <SidebarMenu>
                    <DocumentList documents={data.documents} />
                  </SidebarMenu>
                </>
                : mode === "document" &&
                <>
                  <SidebarGroupLabel>Recent</SidebarGroupLabel>
                  <SidebarMenu>
                    <GroupList groups={data.groups} />
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
