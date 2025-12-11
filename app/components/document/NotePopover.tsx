import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form } from "react-router";
import { cva } from "class-variance-authority";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "~/lib/utils";
import type { ThemeName } from "~/types/theme";

const notePopoverShell = cva("note-popover", {
  variants: {
    theme: {
      light: "note-popover--light",
      dark: "note-popover--dark",
      neon: "note-popover--neon",
    },
  },
  defaultVariants: {
    theme: "light",
  },
});

export function NotePopover({
  docId,
  id,
  x,
  y,
  quote,
  note,
  onClose,
  theme,
}: {
  docId: string;
  id: string;
  x: number;
  y: number;
  quote: string;
  note: string;
  onClose: () => void;
  theme: ThemeName;
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
      className={cn(notePopoverShell({ theme }))}
      style={{ left: x, top: y, borderRadius: 2 }}
      role="dialog"
      aria-label="Annotation"
      data-theme={theme}
    >
      <div className="note-popover__texture" />
      <div className="note-popover__accent-vertical" />
      <div className="note-popover__accent-bottom" />

      <div className="relative z-10 space-y-3">
        <p className="note-popover__note">
          {note || <span className="note-popover__placeholder">// no note saved</span>}
        </p>

        <Form
          method="post"
          action={`/workspace/delete-annotation/${docId}/${id}`}
          className="note-popover__actions"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                type="submit"
                className="h-8 w-8 hover:bg-destructive/20 hover:border-destructive/40 transition-all hover:text-destructive"
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
    </div>
  );
}
