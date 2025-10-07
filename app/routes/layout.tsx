import type { Route } from "./+types/layout";
import { Outlet, redirect } from "react-router";
import { getSession, getUser } from "~/utils/auth.server";
import { getChats, getDocument, getDocumentAuthors, getDocuments } from "../index.server";
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
  const documents = await getDocuments()

  const waitForDocument = async () => {
    if (params?.id) {
      return await getDocument(params.id)
    }
  }
  const waitForDocAuthors = async () => {
    if (params?.id) {
      return await getDocumentAuthors(params.id)
    }
  }

  const document = await waitForDocument();
  const authors = await waitForDocAuthors();

  return { user, chats, documents, document, authors }
}

const Layout = ({ loaderData }: Route.ComponentProps) => {
  const uiUser = {
    name: loaderData.user.name,
    email: loaderData.user.email,
    avatar: (loaderData.user.image as string | undefined) ?? "",
  }
  const selectionRef = useRef<string>("");
  const [showHighlight, setShowHighlight] = useState(false);
  const [includeSelection, setIncludeSelection] = useState<boolean>(() => !!selectionRef?.current?.trim());

  return (
    <>
      {/* documents chats */}
      <LeftSidebarProvider>
        <SidebarLeft side="left" data={loaderData.documents} user={uiUser} />
        <RightSidebarProvider>
          <SidebarInset className="flex flex-col h-screen overflow-y-auto">
            <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 z-50 backdrop-blur-sm rounded-md">
              <div className="flex flex-1 justify-between items-center gap-2 px-3">
                <SidebarTriggerLeft />
                {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1 items-center">
                        <span className="">{loaderData.document?.title ?? ""} - </span>
                        <span className="text-xs">{loaderData.authors ?? ""}</span>
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <SidebarTriggerRight />
              </div>
            </header>
            <Outlet context={{ selectionRef, setShowHighlight, setIncludeSelection }} />
          </SidebarInset>
          <SidebarRight side="right" data={loaderData.chats} user={uiUser} selectionRef={selectionRef} includeSelection={includeSelection} setIncludeSelection={setIncludeSelection} />
          {/* <SidebarInset className="flex flex-col h-screen overflow-y-auto">
          </SidebarInset> */}
        </RightSidebarProvider>
      </LeftSidebarProvider>
    </>
  )
}
export default Layout