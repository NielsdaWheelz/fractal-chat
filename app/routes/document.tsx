import { useState, useRef, useEffect, memo } from "react";
import {
  Form,
  redirect,
  useLoaderData,
  useOutletContext,
  useParams,
} from "react-router";
import { requireUser } from "~/utils/auth.server";
import { getAnnotations, getDocument } from "../index.server";


import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { MessageCirclePlus, MessageSquareReply } from "lucide-react";
import DocumentContents from "~/components/document/DocumentContents";


type PopoverProps = {
  docId: string;
  selectionText: string;
  annotationText: string;
  setAnnotationText: (v: string) => void;
  selectionRef: React.MutableRefObject<string>;
  // optional: position; if you want to move with selection
  x?: number; y?: number;
};

// memo prevents unnecessary re-renders; most important is that the component
// TYPE is stable by being top-level. Memo is a nice-to-have.
export const CustomPopover = memo(function CustomPopover({
  docId,
  selectionText,
  annotationText,
  setAnnotationText,
  selectionRef,
  x = 0,
  y = 0,
}: PopoverProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    let parsed: any = null;
    try { parsed = JSON.parse(selectionRef.current); } catch {}
    if (!parsed) { e.preventDefault(); return; }

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
      style={{
        position: "fixed",
        left: x,
        top: y,
        background: "white",
        border: "1px solid #ccc",
        padding: "6px 8px",
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
      // Don’t let mouse down collapse selection; but DO allow focus.
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="max-w-[380px] truncate">{selectionText}</p>

      {/* Example: “new chat” button kept here if you want */}
      <Form method="post" action={`/workspace/document/${docId}/chat-create`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" type="submit">
                <MessageCirclePlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Form>

      <Form method="post" action={`/workspace/document/${docId}/save-annotation`} onSubmit={onSubmit}>
        <input ref={hiddenRef} type="hidden" name="annotation" />
        <input
          ref={noteRef}
          type="text"
          name="note"
          placeholder="Type text..."
          value={annotationText}
          onChange={(e) => setAnnotationText(e.currentTarget.value)}
          // Quality-of-life:
          autoFocus
          onMouseDown={(e) => e.stopPropagation()} // don’t bubble to selection logic
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" type="submit">
                <MessageSquareReply className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>add annotation</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Form>
    </div>
  );
});


type LoaderData = {
  document: { id: string; content: string };
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
    selectionRef.current = JSON.stringify({ start, end, quote, prefix, suffix });
     const rect = range.getBoundingClientRect();
  setSelectionText(quote);
  setPopup({
    text: quote,
    x: rect.left + rect.width / 2,
    y: rect.top - 30,
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

    const [popup, setPopup] = useState<{ text: string; x: number; y: number } | null>(null);
    
  return (
    <>
      {popup && (
        <div data-annotation-popover>
          <CustomPopover
            docId={id!}
            selectionText={selectionText}
            annotationText={annotationText}
            setAnnotationText={setannotationText}
            selectionRef={selectionRef}
            x={popup.x}
            y={popup.y}
          />
        </div>
      )}

      <div
        id="doc-container"
        onMouseUp={handleSelectionEnd}
        style={{ userSelect: "text" }}
      >
        <DocumentContents documentHTML={docContent()} annotations={annotations} />
      </div>
    </>
  );
}