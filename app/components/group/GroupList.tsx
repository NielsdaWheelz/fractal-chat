import { NavLink } from "react-router"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar-left"
import { FileText, Pencil, Users } from "lucide-react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import DocumentList from "../document/DocumentList"
import GroupAvatarStack from "../groupavatar"
import type { Group } from "~/types/types"

const GroupList = (props: { groups: Group }) => {
import { Button } from "../ui/button"

const GroupList = (props: { groups, onEditGroup }) => {
  console.log("GROUP:", props.groups[0].documents)
  return (
    <>
      {props?.groups?.map((group: { id: string, name?: string | null }) => {
        const name = (group.name && group.name.trim().length > 0)
          ? group.name
          : (group.id)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <AccordionItem value={group.id} key={group.id} className="">
                <AccordionTrigger className="">
                  <SidebarMenuButton className="w-full text-xs flex items-start gap-2 h-auto px-2 py-2">
                    <div className="w-0 flex-1 overflow-hidden">
                      <GroupAvatarStack users={group?.members} />
                      <span className="line-clamp-2 leading-snug break-words text-center overflow-hidden text-ellipsis whitespace-normal">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 p-0 shrink-0 mt-[2px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onEditGroup({
                          id: group.id,
                          name: name,
                          members: group.members?.map(m => m.id) || [],
                          documents: group.documents?.map(d => d.id) || []
                        });
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4 shrink-0 mt-[2px]" />
                    </Button>
                    <div className="w-0 flex-1 overflow-hidden">
                      <span className="line-clamp-2 leading-snug break-words text-left overflow-hidden text-ellipsis whitespace-normal">
                        {name}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <DocumentList documents={group.documents} />
                </AccordionContent>
              </AccordionItem>
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