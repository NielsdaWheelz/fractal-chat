import { useEffect, useRef, useState } from "react";
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
import { getGroups } from "~/server/groups.server";
import type { Route } from "./+types/layout";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request);
  if (!session?.user) return redirect("/");
  const user = session.user;
  const userId = await getUser(request);
  const docId = params?.id;
  const chats = userId && docId ? await getChats(userId, docId) : [];
  const documents = await getDocuments(userId);
  const groups = await getGroups(userId);

  const waitForDocument = async () => {
    if (params?.id) {
      const document = await getDocument(userId, params.id);
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

  return { user, chats, groups, documents, document, authors, annotations };
};

const Layout = ({ loaderData }: Route.ComponentProps) => {
  const uiUser = {
    name: loaderData.user.name,
    email: loaderData.user.email,
    avatar: (loaderData.user.image as string | undefined) ?? "",
  };
  const selectionRef = useRef<string>("");
  const [showHighlight, setShowHighlight] = useState(false);
  const [theme, setTheme] = useState("light");
  const [includeSelection, setIncludeSelection] = useState<boolean>(
    () => !!selectionRef?.current?.trim()
  );

  useEffect(() => {
    if (theme == "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    }

  }, [theme]);

  return (
    <>
      {/* documents chats */}

      <LeftSidebarProvider>
        <SidebarLeft side="left" data={loaderData} user={uiUser} setTheme={setTheme} theme={theme} />
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
                        <span className="">
                          {loaderData.document?.title ?? ""} -{" "}
                        </span>
                        <span className="text-xs">
                          {loaderData.authors ?? ""}
                        </span>
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <SidebarTriggerRight />
              </div>
            </header>
            <Outlet
              context={{ selectionRef, setShowHighlight, setIncludeSelection }}
            />
          </SidebarInset>
          <SidebarRight
            side="right"
            data={loaderData}
            user={uiUser}
            selectionRef={selectionRef}
            includeSelection={includeSelection}
            setIncludeSelection={setIncludeSelection}
          />
          {/* <SidebarInset className="flex flex-col h-screen overflow-y-auto">
            </SidebarInset> */}
        </RightSidebarProvider>
      </LeftSidebarProvider>
    </>
  );
};
export default Layout;
