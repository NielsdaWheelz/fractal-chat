import { NavLink } from "react-router"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar-left"
import { FileText } from "lucide-react"

const DocumentList = (props: { documents }) => {
  return (
    <>
      {props.documents.map((document: { id: string, title?: string | null, url?: string }) => {
        const title = (document.title && document.title.trim().length > 0)
          ? document.title
          : (document.url || document.id)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink key={document.id} to={"/workspace/document/" + document.id}>
                <SidebarMenuItem key={document.id}>
                  <SidebarMenuButton className="w-full text-xs flex items-start gap-2 h-auto px-2 py-2">
                    <FileText className="mr-2 h-4 w-4 shrink-0 mt-[2px]" />
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