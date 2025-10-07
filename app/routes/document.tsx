import { useState } from "react";
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
  HighlightPopover,
  useHighlightPopover,
} from "@omsimos/react-highlight-popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { MessageCirclePlus, MessageSquareReply } from "lucide-react";
import DocumentContents from "~/components/document/DocumentContents";

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

  const [typeAnnotate, settypeAnnotate] = useState();

  const [annotationJson, setAnnotationJson] = useState("");

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
    // The container is the element you pass to HighlightPopover; in your JSX it's the inner <div>
    const containerEl = window.document.getElementById("doc-container");
    if (!containerEl) return;

    const { start, end } = rangeToOffsets(containerEl, range);
    if (start < 0 || end < 0 || start === end) return;

    const textOnly = containerEl.textContent ?? "";
    const quote = sliceSafe(textOnly, start, end);
    const prefix = sliceSafe(textOnly, start - 30, start);
    const suffix = sliceSafe(textOnly, end, end + 30);

    // Save these where you need them (state, ref, or post immediately)
    // Example: put a JSON payload into your existing selectionRef for now:
    selectionRef.current = JSON.stringify({
      start,
      end,
      quote,
      prefix,
      suffix,
    });

    // If you want the popover to appear right away:
    // setShowHighlight(true); setIncludeSelection(true);
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

  function CustomPopover({
    docId,
    selectionRef,
  }: {
    docId: string;
    selectionRef: React.MutableRefObject<string>;
  }) {
    const [annotationJson, setAnnotationJson] = useState("");
    const { currentSelection, setShowPopover } = useHighlightPopover();

    let truncSel = ""
    if (currentSelection.length > 30) {
      // If the string is longer than maxLength, truncate it and add "..."
      truncSel = currentSelection.slice(0, 25) + '...' + currentSelection.slice(currentSelection.length - 25, currentSelection.length);
    } else {
      // If the string is not longer than maxLength, return it as is
      truncSel = currentSelection;
    }
    const prepare = () => {
      let parsed: any = null;
      try {
        parsed = JSON.parse(selectionRef.current);
      } catch {}
      if (!parsed) return false;

      setAnnotationJson(
        JSON.stringify({
          documentId: docId,
          start: parsed.start,
          end: parsed.end,
          quote: parsed.quote,
          prefix: parsed.prefix,
          suffix: parsed.suffix,
          body: "Empty Note Body",
        })
      );
      return true;
    };


    return (
      <div className="bg-white border rounded-md p-2 select-none text-xs flex flex-row items-center">
        <p className="">{truncSel}</p>
        <div className="flex flex-col">
          <Form method="post" action={`/workspace/document/${useParams().id}/chat-create`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" type="submit">
                  <MessageCirclePlus className="h-2 w-2" />
                  <span className="sr-only">New Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Form
        method="post"
        action={`save-annotation`}
      >
        <input type="hidden" name="annotation" value={annotationJson} />
       
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                type="submit"
                onClick={(e) => {
                  if (!prepare()) e.preventDefault(); 
                }}
              >
                <MessageSquareReply className="h-2 w-2" />
                <span className="sr-only">add annotation</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>add annotation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Form>
        </div>
      </div>
    );
  }

  return (
    <>
      <HighlightPopover
        renderPopover={() => <CustomPopover docId={id!} selectionRef={selectionRef} />}
        offset={{ x: 0, y: -10 }}
        minSelectionLength={5}
        onSelectionStart={handleSelectionStart}
        onSelectionEnd={handleSelectionEnd}
        onPopoverShow={handlePopoverShow}
        onPopoverHide={handlePopoverHide}
      >
        <DocumentContents documentHTML={docContent()} />
      </HighlightPopover>
    </>
  );
}
