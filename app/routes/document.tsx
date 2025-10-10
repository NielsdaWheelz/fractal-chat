import { useRef, useState } from "react";
import {
  redirect,
  useLoaderData,
  useOutletContext
} from "react-router";
import { getAnnotations } from "~/server/annotations.server";
import { requireUser } from "~/server/auth.server";
import { getDocument } from "~/server/documents.server";

import { CustomPopover } from "~/components/document/CustomPopover";
import DocumentContents from "~/components/document/DocumentContents";
import { NotePopover } from "~/components/document/NotePopover";
import { getColorFromID } from "~/server/users.server";
import type { Annotation } from "~/types/types";


type LoaderData = {
  document: { id: string; content: string, title: string };
  color: string,
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
  const color = await getColorFromID(userId);
  if (!document) {
    throw redirect("/");
  }
  return { document: document, annotations: annotations, color: color };
}

export default function Document() {

  const [notePopup, setNotePopup] = useState<null | {
    x: number;
    id: string;
    y: number;
    note: string;
    quote: string;
  }>(null);
  const { selectionRef, setShowHighlight, setIncludeSelection, theme } =
    useOutletContext<{
      selectionRef: React.MutableRefObject<string>;
      setShowHighlight: React.Dispatch<React.SetStateAction<boolean>>;
      setIncludeSelection: React.Dispatch<React.SetStateAction<boolean>>;
      theme: string
    }>();

  const { document, annotations, color } = useLoaderData() as LoaderData;
  const id = document.id
  const docContent = () => {
    return { __html: document.content };
  };
  const [annotationJson, setAnnotationJson] = useState("");
  const [rerenderToShowHighlight, setRerenderToShowHighlight] = useState(0);
  const [annotationText, setannotationText] = useState("");
  const [selectionText, setSelectionText] = useState("");

  const docRef = useRef<HTMLDivElement>(null);

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

    const sendAnnotationToDocument: Annotation = {
      id: "",
      userId: "",
      documentId: document.id,
      body: "",
      start: start,
      color: color,
      end: end,
      quote: "",
      prefix: "",
      suffix: "",
      visibility: "private",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    annotations.push(sendAnnotationToDocument)
    setRerenderToShowHighlight(() => rerenderToShowHighlight + 1);
  };

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
    const id = mark.getAttribute("data-annid") ?? "";
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
            theme={theme}
            color={color}
            docTitle={document.title}
            selectionText={selectionText}
            annotationText={annotationText}
            setAnnotationText={setannotationText}
            selectionRef={selectionRef}
            setIncludeSelection={setIncludeSelection}
            x={popup.x}
            y={popup.y}
            onRequestClose={
              () => {
                setPopup(null)
                annotations.pop();
              }
            }
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
          annotations={[...annotations]}
          theme={theme}
        />
      </div>
    </>
  );
}
