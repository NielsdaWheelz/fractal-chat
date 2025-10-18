import { NavLink } from "react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar-left";
import { FileText } from "lucide-react";
import { cn } from "~/lib/utils";
import type { ThemeName } from "~/types/theme";

export type DocumentListItem = {
  id: string;
  title?: string | null;
  url?: string | null;
};

type DocumentListProps = {
  documents: DocumentListItem[];
  theme: ThemeName;
};

const iconTone: Record<ThemeName, string> = {
  light: "text-muted-foreground",
  dark: "text-muted-foreground",
  neon: "text-sidebar-primary",
};

const DocumentList = ({ documents, theme }: DocumentListProps) => {
  return (
    <>
      {documents.map((document) => {
        const title = (document.title && document.title.trim().length > 0)
          ? document.title
          : (document.url || document.id)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink key={document.id} to={"/workspace/document/" + document.id}>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex h-auto w-full items-start gap-2 px-2 py-2 text-xs">
                    <FileText className={cn("mr-2 mt-[2px] h-4 w-4 shrink-0", iconTone[theme])} />
                    <div className="w-0 flex-1 overflow-hidden">
                      <span className="line-clamp-2 leading-snug break-words text-left overflow-hidden text-ellipsis whitespace-normal">
                        {title}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="max-w-xs">
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        )
      })
      }
    </>
  )
}

export default DocumentList
