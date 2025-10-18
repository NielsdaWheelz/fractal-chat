import { useRef, useState } from "react";
import { Outlet, redirect } from "react-router";
import { SidebarApp as SidebarLeft } from "~/components/sidebar-app-left";
import { SidebarApp as SidebarRight } from "~/components/sidebar-app-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import {
  SidebarProvider as LeftSidebarProvider,
  SidebarInset,
  SidebarTriggerLeft,
} from "~/components/ui/sidebar-left";
import {
  SidebarProvider as RightSidebarProvider,
  SidebarTriggerRight,
} from "~/components/ui/sidebar-right";
// import { getAnnotations } from "~/index.server";
import { getAnnotations } from "~/server/annotations.server";
import { getSession, getUser } from "~/server/auth.server";
import { getDocumentAuthors } from "~/server/authors.server";
import { getChats } from "~/server/chats.server";
import { getDocument, getDocuments } from "~/server/documents.server";
import { getDocumentLimitInfo } from "~/server/billing.server";
import { getGroups } from "~/server/groups.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/layout";
import { useTheme } from "~/hooks/use-theme";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request);
  if (!session?.user) return redirect("/");
  const user = session.user;
  const userId = await getUser(request);
  const docId = params?.id;
  const chats = userId && docId ? await getChats(userId, docId) : [];
  const documents = await getDocuments(userId);
  const groups = await getGroups(userId);
  const documentLimit = userId ? await getDocumentLimitInfo(userId) : null;

  const waitForDocument = async () => {
    if (params?.id) {
      const document = await getDocument(params.id, userId);
      return document;
    }
  };
  const waitForDocAuthors = async () => {
    if (params?.id) {
      return await getDocumentAuthors(params.id);
    }
  };

  const waitForAnnotations = async () => {
    if (params?.id) {
      return await getAnnotations(userId, params.id);
    }
  };

  const document = await waitForDocument();
  const authors = await waitForDocAuthors();
  const annotations = await waitForAnnotations();

  return { user, chats, groups, documents, documentLimit, document, authors, annotations };
};

const Layout = ({ loaderData }: Route.ComponentProps) => {
  const uiUser = {
    name: loaderData.user.name,
    email: loaderData.user.email,
    avatar: (loaderData.user.image as string | undefined) ?? "",
  };
  const selectionRef = useRef<string>("");
  const [showHighlight, setShowHighlight] = useState(false);
  const [includeSelection, setIncludeSelection] = useState<boolean>(
    () => !!selectionRef?.current?.trim()
  );
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* documents chats */}

      <LeftSidebarProvider>
        <SidebarLeft side="left" data={loaderData} user={uiUser} setTheme={setTheme} theme={theme} />
        <RightSidebarProvider>
          <SidebarInset className="flex flex-col h-screen overflow-y-auto">
            <header
              className={cn(
                "sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 rounded-md border-b bg-background/80 backdrop-blur-md transition-colors",
                theme === "neon" ? "border-sky-400/30 shadow-[0_0_25px_rgba(16,240,255,0.2)]" : "border-border/60"
              )}
            >
              <div className="relative flex flex-1 items-center justify-between gap-2 px-3">
                {theme === "neon" && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                )}

                <SidebarTriggerLeft
                  className={cn(
                    "transition-colors",
                    theme === "neon"
                      ? "hover:text-cyan-400"
                      : "hover:text-foreground/80"
                  )}
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1 items-center">
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <SidebarTriggerRight
                  className={cn(
                    "transition-colors",
                    theme === "neon"
                      ? "hover:text-pink-400"
                      : "hover:text-foreground/80"
                  )}
                />
              </div>
            </header>
            <Outlet
              context={{ selectionRef, setShowHighlight, setIncludeSelection, theme }}
            />
          </SidebarInset>
          <SidebarRight
            side="right"
            data={loaderData}
            user={uiUser}
            selectionRef={selectionRef}
            includeSelection={includeSelection}
            setIncludeSelection={setIncludeSelection}
            theme={theme}
          />
          {/* <SidebarInset className="flex flex-col h-screen overflow-y-auto">
            </SidebarInset> */}
        </RightSidebarProvider>
      </LeftSidebarProvider>
    </>
  );
};
export default Layout;
