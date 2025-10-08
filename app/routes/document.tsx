import { useState, useRef, useEffect, memo } from "react";
import {
  Form,
  redirect,
  useLoaderData,
  useOutletContext,
  useParams,
} from "react-router";
import { requireUser } from "~/server/auth.server";
import { getAnnotations } from "~/server/annotations.server";
import { getDocument } from "~/server/documents.server";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { MessageCirclePlus, MessageSquareReply } from "lucide-react";
import DocumentContents from "~/components/document/DocumentContents";
import { Tweet } from "./tweet";

type PopoverProps = {
  docId: string;
  docTitle: string;
  selectionText: string;
  annotationText: string;
  setAnnotationText: (v: string) => void;
  selectionRef: React.MutableRefObject<string>;
  // optional: position; if you want to move with selection
  x?: number;
  y?: number;
  onRequestClose: () => void;
};

// memo prevents unnecessary re-renders; most important is that the component
// TYPE is stable by being top-level. Memo is a nice-to-have.

// A simple read-only popover for viewing a saved note
function NotePopover({
  x,
  y,
  quote,
  note,
  onClose,
}: {
  x: number;
  y: number;
  quote: string;
  note: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const close = (e: PointerEvent) => onClose();
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        background: "white",
        border: "1px solid #e5e7eb",
        padding: "12px 14px",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,.18)",
        zIndex: 10,
        maxWidth: 420,
      }}
      role="dialog"
      aria-label="Annotation"
    >
      <p className="text-sm">{note || "(no note saved)"}</p>
    </div>
  );
}

export const CustomPopover = memo(function CustomPopover({
  docId,
  docTitle,
  selectionText,
  annotationText,
  setAnnotationText,
  selectionRef,
  onRequestClose,
  x = 0,
  y = 0,
}: PopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      // If click is outside the popover, close it
      if (!el.contains(e.target as Node)) {
        onRequestClose();
      }
    };
    // capture = true so we see the event even if inner handlers stopPropagation
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [onRequestClose]);
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(selectionRef.current);
    } catch {}
    if (!parsed) {
      e.preventDefault();
      return;
    }

    const payload = {
      documentId: docId,
      start: parsed.start,
      end: parsed.end,
      quote: parsed.quote,
      prefix: parsed.prefix,
      suffix: parsed.suffix,
      body: noteRef.current?.value ?? "",
    };

    if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(payload);
  };

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        left: x,
        top: y,
        background: "white",
        border: "1px solid #e5e7eb",
        padding: "16px 20px",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        zIndex: 1,
        minWidth: 320,
        maxWidth: 500,
        pointerEvents: "auto",
      }}
    >
      <p className="mb-3 text-sm text-gray-700 font-medium break-words">
        {selectionText}
      </p>
      <div className="flex flex-row gap-3 items-center">
        <Form
          method="post"
          action={`/workspace/document/${docId}/save-annotation`}
          onSubmit={onSubmit}
        >
          <input ref={hiddenRef} type="hidden" name="annotation" />
          <input
            ref={noteRef}
            type="text"
            name="note"
            placeholder="Type text..."
            value={annotationText}
            onChange={(e) => setAnnotationText(e.currentTarget.value)}
            autoFocus
            onMouseDown={(e) => e.stopPropagation()} // don’t bubble to selection logic
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-1"
                  type="submit"
                  onClick={() => {
                    setAnnotationText("");
                  }}
                >
                  <MessageSquareReply className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>add annotation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Form>
        <Form method="post" action={`/workspace/document/${docId}/chat-create`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={() => {}}>
                <MessageSquareReply className="h-2 w-2" />
                <span className="sr-only">add to existing chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>add to existing chat</p>
            </TooltipContent>
          </Tooltip>
        </Form>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => {
            }}>
              <MessageSquareReply className="h-2 w-2" />
              <span className="sr-only">add to existing chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>add to existing chat</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={() => {
            }}>
              <Tweet title={docTitle} annotationText={annotationText} selectionText={selectionText}></Tweet>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tweet Annotation</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});

type LoaderData = {
  document: { id: string; content: string, title: string };
  annotations: Array<{
    id: string;
    start: number;
    end: number;
    quote: string;
    note: string;
    prefix: string;
    suffix: string;
  }>;
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
  const { id } = useParams(); // ✅ read once

  const [notePopup, setNotePopup] = useState<null | {
    x: number;
    y: number;
    note: string;
    quote: string;
  }>(null);
  const { selectionRef, setShowHighlight, setIncludeSelection } =
    useOutletContext<{
      selectionRef: React.MutableRefObject<string>;
      setShowHighlight: React.Dispatch<React.SetStateAction<boolean>>;
    }>();
  const { document, annotations } = useLoaderData() as LoaderData;
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
    } catch {}

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
    const quote = mark.textContent ?? "";
    const rect = mark.getBoundingClientRect();

    setNotePopup({
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
            x={popup.x}
            y={popup.y}
            onRequestClose={() => setPopup(null)}
          />
        </div>
      )}

      <div
        id="doc-container"
        onMouseUp={handleSelectionEnd}
        onClick={handleDocClick} // 👈 add this
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
