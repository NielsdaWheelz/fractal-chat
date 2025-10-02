import type { Route } from "./+types/layout";
import { Outlet, redirect } from "react-router";
import { getSession } from "./api.auth";
import { getUser } from "~/utils/auth.server";
import { getChats, getDocument, getDocuments } from "..";
import { Button } from "~/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider as LeftSidebarProvider,
  SidebarTriggerLeft,
} from "~/components/ui/sidebar-left";
import {
  SidebarProvider as RightSidebarProvider,
  SidebarTriggerRight,
} from "~/components/ui/sidebar-right";
import { SidebarApp as SidebarLeft } from "~/components/sidebar-app-left";
import { SidebarApp as SidebarRight } from "~/components/sidebar-app-right";
import { useRef, useState } from "react";


export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request)
  if (!session?.user) return redirect("/")
  const user = session.user
  const userId = await getUser(request)
  const docId = params?.id
  const chats = userId && docId ? (await getChats(userId, docId)) : []
  const documents = userId ? (await getDocuments(userId)) : []
  let document
  if (params?.id) {
    document = await getDocument(params.id, userId)
  }
  return { user, chats, documents, document }
}

const Layout = ({ loaderData }: Route.ComponentProps) => {
  const uiUser = {
    name: loaderData.user.name,
    email: loaderData.user.email,
    avatar: (loaderData.user.image as string | undefined) ?? "",
  }
  // ref to store the selection string
  const selectionRef = useRef<string>("");
console.log(selectionRef.current)
  // optional state to force UI for the chat highlight box
  const [showHighlight, setShowHighlight] = useState(false);

  return (
    <>
      {/* documents chats */}
      <LeftSidebarProvider>
        <SidebarLeft side="left" data={loaderData.documents} user={uiUser} />
        <RightSidebarProvider>
          <SidebarInset className="flex flex-col h-screen overflow-y-auto">
            <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
              <div className="flex flex-1 justify-between items-center gap-2 px-3">
                <SidebarTriggerLeft />
                {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">
                        {loaderData.document?.title ?? ""}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <SidebarTriggerRight />
              </div>
            </header>
            <Outlet context={{ selectionRef, setShowHighlight }} />
          </SidebarInset>
          <SidebarRight side="right" data={loaderData.chats} user={uiUser} selectionRef={selectionRef} />
          {/* <SidebarInset className="flex flex-col h-screen overflow-y-auto">
          </SidebarInset> */}
        </RightSidebarProvider>
      </LeftSidebarProvider>
    </>
  )
}
export default Layout