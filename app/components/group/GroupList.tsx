import { Pencil } from "lucide-react"
import DocumentList, { type DocumentListItem } from "../document/DocumentList"
import GroupAvatarStack from "../groupavatar"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import type { ThemeName } from "~/types/theme"

type GroupShape = {
  id: string;
  name?: string | null;
  members?: any[];
  documents?: DocumentListItem[];
};

type GroupListProps = {
  groups: GroupShape[];
  onEditGroup: (group: { id: string; name: string; members: any[]; documents: DocumentListItem[] }) => void;
  theme: ThemeName;
};

const GroupList = ({ groups, onEditGroup, theme }: GroupListProps) => {
  // console.log("GROUP:", props.groups[0].documents)
  return (
    <>
      {groups?.map(
        (group) => {
          const name = (group.name && group.name.trim().length > 0)
            ? group.name
            : (group.id)
          return (
            <Tooltip key={group.id}>
              <TooltipTrigger asChild>
                <AccordionItem value={group.id} className="border-b">
                  <AccordionTrigger className="py-2 hover:no-underline [&[data-state=open]>div]:pb-2">
                    <div className="flex flex-col gap-2 w-full overflow-hidden">
                      <div className="text-left text-xs pr-6">
                        <span className="line-clamp-2">
                          {name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pr-6">
                        {group?.members && group.members.length > 0 && (
                          <div className="shrink-0 overflow-hidden">
                            <GroupAvatarStack users={group.members} />
                          </div>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 shrink-0 ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditGroup({
                              id: group.id,
                              name: name,
                              members: group.members || [],
                              documents: group.documents || []
                            });
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <DocumentList documents={group.documents ?? []} theme={theme} />
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
