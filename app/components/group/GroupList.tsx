import { NavLink } from "react-router"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar-left"
import { FileText } from "lucide-react"

const GroupList = (props: { groups }) => {
  return (
    <>
      {props?.groups?.map((group: { id: string, name?: string | null}) => {
        const name = (group.name && group.name.trim().length > 0)
          ? group.name
          : (group.id)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink key={group.id} to={"/workspace/group/" + group.id}>
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton className="w-full text-xs flex items-start gap-2 h-auto px-2 py-2">
                    <FileText className="mr-2 h-4 w-4 shrink-0 mt-[2px]" />
                    <div className="w-0 flex-1 overflow-hidden">
                      <span className="line-clamp-2 leading-snug break-words text-left overflow-hidden text-ellipsis whitespace-normal">
                        {name}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="max-w-xs">
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        )
      })
      }
    </>
  )
}

export default GroupList