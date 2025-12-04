import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form } from "react-router";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function NotePopover({
  docId,
  id,
  x,
  y,
  quote,
  note,
  color,
  onClose,
}: {
  docId: string;
  id: string;
  x: number;
  y: number;
  quote: string;
  note: string;
  color: string;
  onClose: () => void;
}) {
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      const el = popRef.current;
      if (!el) return;

      // Prefer composedPath to handle portals/shadow DOM correctly
      const path = (e.composedPath?.() ?? []) as EventTarget[];
      if (path.includes(el) || (e.target && el.contains(e.target as Node))) {
        // Click started inside the popover → do not close
        return;
      }
      onClose();
    };

    // Keep capture=true so outside clicks still win, but we now guard inside clicks
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, [onClose]);

  // Hardcode which avatar shows for each annotation
  let userData, avatarColor;

  if (id === "annotation-1") {
    userData = { name: "Alex Johnson", initials: "AJ" };
    avatarColor = "0"; // purple border
  } else if (id === "annotation-2") {
    userData = { name: "Dan Abramov", initials: "DA" };
    avatarColor = "1"; // red border
  } else if (id === "ml-annotation-1") {
    userData = { name: "Riley Park", initials: "RP" };
    avatarColor = "3"; // green border
  } else if (id === "ml-annotation-2") {
    userData = { name: "Sam Chen", initials: "SC" };
    avatarColor = "2"; // blue border
  } else {
    userData = { name: "Demo User", initials: "DU" };
    avatarColor = color; // fallback to passed color
  }

  const mockUser = {
    id: "demo-user",
    name: userData.name,
    email: "demo@example.com",
    color: avatarColor,
    emailVerified: false,
    image: null,
    friends: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div
      ref={popRef}
      className="fixed bg-sidebar border border-gray-200 p-3 rounded-xl shadow-lg z-10 max-w-[420px] flex flex-row items-center gap-3"
      style={{ left: x, top: y }}
      role="dialog"
      aria-label="Annotation"
    >
      <Avatar user={mockUser} color={avatarColor} className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">{userData.initials}</AvatarFallback>
      </Avatar>

      <p className="text-sm flex-1">{note || "(no note saved)"}</p>

      <Form method="post" action={`/workspace/delete-annotation/${docId}/${id}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              // Optional: also stop propagation at capture just to be extra safe
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>delete annotation</p>
          </TooltipContent>
        </Tooltip>
      </Form>
    </div>
  );
}
