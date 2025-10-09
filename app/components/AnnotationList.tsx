import { Highlighter } from "lucide-react";
import {
  SidebarGroup,
  SidebarListButton,
  SidebarListItem,
  SidebarMenu
} from "~/components/ui/sidebar-right";

function scrollToAnnotation(annid: string) {
  const marks = document.querySelectorAll(`[data-annid="${annid}"]`);
  if (marks.length === 0) return;

  // pick the first mark (top-most on screen)
  const first = marks[0];
  first.scrollIntoView({ behavior: "smooth", block: "center" });

  // Optionally, visually emphasize all related marks
  marks.forEach(el => el.classList.add("ring-2", "ring-yellow-300"));
  setTimeout(() => marks.forEach(el => el.classList.remove("ring-2", "ring-yellow-300")), 1000);
}

const AnnotationList = (props: { annotations, setSelectedAnnotationId }) => {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {props.annotations?.sort((a: AnnotationListItem, b: AnnotationListItem) => a.start - b.start).map((annotation: AnnotationListItem) => {
          return (
            <SidebarListItem key={annotation.id}>
              <SidebarListButton className="w-full justify-start" onClick={() => {
                props.setSelectedAnnotationId(annotation.id)
                scrollToAnnotation(annotation.id)
              }}>
                <Highlighter className="mr-2 h-4 w-4" />
                <span className="text-xs">{annotation.quote}</span>
                <span className="text-xs">{annotation.body}</span>
              </SidebarListButton>
            </SidebarListItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default AnnotationList