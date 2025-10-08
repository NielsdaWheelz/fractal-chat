import { Highlighter, MessageCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar-right";


const AnnotationList = (props: {annotations, setSelectedAnnotationId}) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <SidebarMenu>
        {props.annotations.map((annotation: AnnotationListItem) => {
          return (
            <SidebarMenuItem key={annotation.id}>
              <SidebarMenuButton className="w-full justify-start" onClick={() => props.setSelectedAnnotationId(annotation.id)}>
                <Highlighter className="mr-2 h-4 w-4" />
                <span className="text-xs">{annotation.quote}</span>
                <span className="text-xs">{annotation.body}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default AnnotationList