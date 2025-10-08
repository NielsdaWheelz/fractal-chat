import { NavLink } from "react-router"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar-left"
import { FileText } from "lucide-react"

const SearchResultList = (props: { searchResults }) => {
  return (
    <>
      {props.searchResults.map((match) => {
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
    </>
  )
}

export default SearchResultList