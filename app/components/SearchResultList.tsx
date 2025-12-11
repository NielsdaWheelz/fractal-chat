import { NavLink } from "react-router";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar-left";
import { FileText } from "lucide-react";
import { cn } from "~/lib/utils";
import type { ThemeName } from "~/types/theme";

type SearchResult = {
  documentId: string;
  chunkText: string;
  documentTitle?: string | null;
  documentUrl?: string | null;
  documentAuthor?: string | null;
};

type SearchResultListProps = {
  results: SearchResult[];
  theme: ThemeName;
};

const iconTone: Record<ThemeName, string> = {
  light: "text-muted-foreground",
  dark: "text-muted-foreground",
  neon: "text-sidebar-primary",
};

const SearchResultList = ({ results, theme }: SearchResultListProps) => {

  return (
    <>
      {results.map((match) => {
        const resultText = match.chunkText.slice(0, 25)
        const title = (match.documentTitle && match.documentTitle.trim().length > 0)
          ? match.documentTitle
          : (match.documentUrl || match.documentId)
        return (
          <NavLink key={match.documentId} to={"/workspace/document/" + match.documentId}>
            <SidebarMenuItem key={match.documentId}>

              <SidebarMenuButton className="flex w-full flex-row items-start justify-start gap-2 text-xs">
                <FileText className={cn("mr-2 h-4 w-4 shrink-0", iconTone[theme])} />
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
    </>
  )
}

export default SearchResultList
