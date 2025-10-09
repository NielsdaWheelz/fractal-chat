import { memo, useEffect, useRef, useState } from "react";
import {
  Form,
  redirect,
  useLoaderData,
  useOutletContext,
  useParams,
} from "react-router";
import { getAnnotations } from "~/server/annotations.server";
import { requireUser } from "~/server/auth.server";
import { getDocument } from "~/server/documents.server";

import { CornerDownLeft, MessageCirclePlus, MessageSquareReply, Trash2 } from "lucide-react";
import DocumentContents from "~/components/document/DocumentContents";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Tweet } from "./tweet";
import { CustomPopover } from "~/components/document/CustomPopover";
import type { Annotation } from "~/types/types";


// memo prevents unnecessary re-renders; most important is that the component
// TYPE is stable by being top-level. Memo is a nice-to-have.

function NotePopover({
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
      className="fixed bg-white border border-gray-200 p-3 rounded-xl shadow-lg z-10 max-w-[420px] flex flex-row items-center gap-1"
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



type LoaderData = {
  document: { id: string; content: string, title: string };
  annotations: Annotation[];
};

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { id?: string };
}) {
  const userId = await requireUser(request);
  if (!params.id) {
    throw redirect("/");
  }
  const document = await getDocument(params.id);
  const annotations = await getAnnotations(userId, params.id);
  if (!document) {
    throw redirect("/");
  }
  return { document: document, annotations: annotations };
}

export default function Document() {

  const [notePopup, setNotePopup] = useState<null | {
    x: number;
    id: string;
    y: number;
    note: string;
    quote: string;
  }>(null);
  const { selectionRef, setShowHighlight, setIncludeSelection } =
    useOutletContext<{
      selectionRef: React.MutableRefObject<string>;
      setShowHighlight: React.Dispatch<React.SetStateAction<boolean>>;
      setIncludeSelection: React.Dispatch<React.SetStateAction<boolean>>;
    }>();

  const { document, annotations } = useLoaderData() as LoaderData;
  const id = document.id
  const docContent = () => {
    return { __html: document.content };
  };
  const [annotationJson, setAnnotationJson] = useState("");
  const [annotationText, setannotationText] = useState("");
  const [selectionText, setSelectionText] = useState("");

  const docRef = useRef<HTMLDivElement>(null);
  function onPrepareSubmit() {
    // parse what you stored in selectionRef (from your selection code)
    let parsed: any = null;
    try {
      parsed = JSON.parse(selectionRef.current);
    } catch { }

    if (!parsed) return false;

    // build the payload your action expects
    const payload = {
      documentId: id,
      start: parsed.start,
      end: parsed.end,
      quote: parsed.quote,
      prefix: parsed.prefix,
      suffix: parsed.suffix,
      body: "Empty Note Body",
    };

    setAnnotationJson(JSON.stringify(payload));
    return true;
  }

  const handleSelectionStart = () => console.log("Selection started");
  const handleSelectionEnd = () => {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const containerEl = window.document.getElementById("doc-container");
    if (!containerEl) return;

    const { start, end } = rangeToOffsets(containerEl, range);
    if (start < 0 || end <= start) return;

    const textOnly = containerEl.textContent ?? "";
    const quote = sliceSafe(textOnly, start, end);
    const prefix = sliceSafe(textOnly, start - 30, start);
    const suffix = sliceSafe(textOnly, end, end + 30);
    selectionRef.current = JSON.stringify({
      start,
      end,
      quote,
      prefix,
      suffix,
    });
    const rect = range.getBoundingClientRect();
    setSelectionText(quote);
    setPopup({
      text: quote,
      x: rect.left,
      y: rect.top + 40,
    });
  };
  const handlePopoverShow = () => console.log("Popover shown");
  const handlePopoverHide = () => console.log("Popover hidden");

  function getCharOffset(
    containerEl: HTMLElement,
    node: Node,
    nodeOffset: number
  ) {
    const walker = window.document.createTreeWalker(
      containerEl,
      NodeFilter.SHOW_TEXT,
      null
    );
    let charCount = 0;

    while (walker.nextNode()) {
      const current = walker.currentNode as Text;
      if (current === node) {
        return charCount + nodeOffset;
      }
      charCount += current.nodeValue?.length ?? 0;
    }
    return -1; // not found
  }

  function rangeToOffsets(containerEl: HTMLElement, range: Range) {
    const start = getCharOffset(
      containerEl,
      range.startContainer,
      range.startOffset
    );
    const end = getCharOffset(containerEl, range.endContainer, range.endOffset);
    return { start, end };
  }

  function sliceSafe(s: string, start: number, end: number) {
    const a = Math.max(0, Math.min(s.length, start));
    const b = Math.max(0, Math.min(s.length, end));
    return s.slice(a, b);
  }

  const [popup, setPopup] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  function handleDocClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const mark = target.closest(".anno-mark") as HTMLElement | null;
    if (!mark) return;

    // prevent selection handler from running
    e.stopPropagation();

    const note = mark.getAttribute("data-note") ?? "";
    const id = mark.getAttribute("data-id") ?? "";
    const quote = mark.textContent ?? "";
    const rect = mark.getBoundingClientRect();

    setNotePopup({
      id,
      note,
      quote,
      x: rect.left,
      y: rect.bottom + 8,
    });
  }
  return (
    <>
      {notePopup && (
        <NotePopover
          docId={id}
          id={notePopup.id}
          x={notePopup.x}
          y={notePopup.y}
          note={notePopup.note}
          quote={notePopup.quote}
          onClose={() => setNotePopup(null)}
        />
      )}
      {popup && (
        <div data-annotation-popover>
          <CustomPopover
            docId={id!}
            docTitle={document.title}
            selectionText={selectionText}
            annotationText={annotationText}
            setAnnotationText={setannotationText}
            selectionRef={selectionRef}
            setIncludeSelection={setIncludeSelection}
            x={popup.x}
            y={popup.y}
            onRequestClose={() => setPopup(null)}
          />
        </div>
      )}

      <div
        id="doc-container"
        onMouseUp={handleSelectionEnd}
        onClick={handleDocClick}
        style={{ userSelect: "text" }}
      >
        <DocumentContents
          documentHTML={docContent()}
          annotations={annotations}
        />
      </div>
    </>
  );
}
