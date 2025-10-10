import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form } from "react-router";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function NotePopover({
  docId,
  id,
  x,
  y,
  quote,
  note,
  onClose,
}: {
  docId: string;
  id: string;
  x: number;
  y: number;
  quote: string;
  note: string;
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

  return (
    <div
      ref={popRef}
      className="fixed bg-sidebar border border-gray-200 p-3 rounded-xl shadow-lg z-10 max-w-[420px] flex flex-row items-center gap-1"
      style={{ left: x, top: y }}
      role="dialog"
      aria-label="Annotation"
    >
      <p className="text-sm">{note || "(no note saved)"}</p>

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
              <Trash2 />
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
