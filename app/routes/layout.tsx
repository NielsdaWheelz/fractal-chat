import type { Route } from "./+types/layout";
import { Outlet, redirect } from "react-router";
import { getSession } from "./api.auth";
import { getUser } from "~/utils/auth.server";
import { getChats, getDocuments } from "..";
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
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { SidebarApp as SidebarLeft } from "~/components/sidebar-left";
import { SidebarApp as SidebarRight } from "~/components/sidebar-right";


export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request)
  if (!session?.user) return redirect("/")
  const user = session.user
  const userId = await getUser(request)
  const chats = userId ? (await getChats(userId)) : []
  const documents = userId ? (await getDocuments(userId)) : []
  return { user, chats, documents }
}

const Layout = ({ loaderData }: Route.ComponentProps) => {
  return (
    <>
    {/* documents chats */}
      <SidebarProvider>
        <SidebarLeft side="left" data={loaderData.documents} user={loaderData.user} />
        <SidebarInset className="flex flex-col h-screen overflow-y-auto">
          <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      {/* Title */}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>

      {/* chats sidebar */}

      <SidebarProvider>
        <SidebarRight side="right" data={loaderData.chats} user={loaderData.user} />
        <SidebarInset className="flex flex-col h-screen overflow-y-auto">
          <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      {/* Title */}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
export default Layout