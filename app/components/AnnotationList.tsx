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
  SidebarListButton,
  SidebarListItem
} from "~/components/ui/sidebar-right";

// Map color indices to border colors
const colorToBorder: Record<string, string> = {
  "0": "#d8b4fe", // purple
  "1": "#faa0a0", // red
  "2": "#a5b4fc", // blue
  "3": "#86efac", // green
  "4": "#fdba74", // orange
  "5": "#d1d5db", // gray
};

function scrollToAnnotation(annid: string) {
  const marks = document.querySelectorAll(`[data-annid="${annid}"]`);
  if (marks.length === 0) return;

  // pick the first mark (top-most on screen)
  const first = marks[0] as HTMLElement;
  first.scrollIntoView({ behavior: "smooth", block: "center" });

  // Optionally, visually emphasize all related marks
  marks.forEach(el => el.classList.add("ring-2", "ring-yellow-300"));
  setTimeout(() => marks.forEach(el => el.classList.remove("ring-2", "ring-yellow-300")), 1000);
}

const AnnotationList = (props: {annotations, setSelectedAnnotationId}) => {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {props.annotations?.sort((a: AnnotationListItem, b: AnnotationListItem) => a.start - b.start).map((annotation: AnnotationListItem) => {
          const borderColor = colorToBorder[annotation.color] || "#d1d5db";
          return (
            <SidebarListItem key={annotation.id}>
              <SidebarListButton
                className="w-full justify-start items-start p-3 hover:bg-accent/50"
                style={{ borderLeft: `4px solid ${borderColor}` }}
                onClick={() => {
                  props.setSelectedAnnotationId(annotation.id)
                  scrollToAnnotation(annotation.id)
                }}>
                {/* <Highlighter className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" /> */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="text-sm font-medium line-clamp-1">{annotation.quote}</span>
                  {annotation.body && (
                    <span className="text-xs text-muted-foreground pl-3 line-clamp-1 border-l-2 border-muted">{annotation.body}</span>
                  )}
                </div>
              </SidebarListButton>
            </SidebarListItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default AnnotationList