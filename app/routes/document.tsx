import { useRef, useState } from "react";
import {
  redirect,
  useLoaderData,
  useOutletContext
} from "react-router";
import { getAnnotations } from "~/server/annotations.server";
import { requireUser, getSession } from "~/server/auth.server";
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
  // Check for session first - bypass auth for screenshots
  const session = await getSession(request);

  if (!params.id) {
    throw redirect("/");
  }

  if (session?.user) {
    // Real user - use database
    const userId = await requireUser(request);
    const document = await getDocument(params.id);
    const annotations = await getAnnotations(userId, params.id);
    const color = await getColorFromID(userId);
    if (!document) {
      throw redirect("/");
    }
    return { document: document, annotations: annotations, color: color };
  } else {
    // Mock user - return mock data based on document ID
    if (params.id === "doc-1") {
      // Introduction to Machine Learning
      const mockDocument = {
        id: params.id,
        title: "Introduction to Machine Learning",
        content: `<h1>Introduction to Machine Learning</h1>
<p style="font-size: 0.875rem; color: #888; margin-top: -0.5rem; margin-bottom: 2rem;">by Dr. Sarah Chen</p>

<p>Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.</p>

<p>At its core, machine learning is about pattern recognition. The goal is to train models that can identify patterns in data and make predictions or decisions based on those patterns.</p>

<p>There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning. Each approach has its own strengths and use cases.</p>

<p>Supervised learning involves training a model on labeled data, where the correct output is already known. The model learns to map inputs to outputs by finding patterns in the training examples.</p>

<p>Common applications include image classification, spam detection, and predictive analytics. These systems have become increasingly accurate as datasets have grown larger and algorithms have become more sophisticated.</p>

<p>Understanding these fundamentals is essential for anyone looking to work with AI systems or apply machine learning to real-world problems.</p>`
      };

      const mockAnnotations = [
        {
          id: "ml-annotation-1",
          userId: "demo-user-id",
          documentId: params.id,
          body: "Key definition - this is the foundation of ML",
          start: 204,
          end: 263,
          color: "3",
          quote: "At its core, machine learning is about pattern recognition.",
          prefix: "programmed.\n\n",
          suffix: " The goal",
          visibility: "private" as const,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15")
        },
        {
          id: "ml-annotation-2",
          userId: "demo-user-id",
          documentId: params.id,
          body: "Important distinction between learning approaches",
          start: 387,
          end: 506,
          color: "2",
          quote: "There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.",
          prefix: "patterns.\n\n",
          suffix: " Each approach",
          visibility: "private" as const,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15")
        }
      ];

      return {
        document: mockDocument,
        annotations: mockAnnotations,
        color: "0"
      };
    } else {
      // Default: Jason Fried article (doc-4)
      const mockDocument = {
        id: params.id,
        title: "When Design Drives Behavior",
        content: `<h1>When Design Drives Behavior</h1>
<p style="font-size: 0.875rem; color: #888; margin-top: -0.5rem; margin-bottom: 2rem;">by Jason Fried</p>

<p>In some cases, design is what something looks like.</p>

<p>In other cases, design is how something works.</p>

<p>But the most interesting designs to me are when design changes your behavior. Even the smallest details can change how someone interacts with something.</p>

<p>Take the power reserve indicator on the A. Lange & Söhne Lange 1 watch. The power reserve indicator indicates how much "power" (wind) is left. It's pictured below on the right side of the dial. It starts with AUF ("up") and ends with AB ("down"). A fully wound Lange 1 (indicator up at AUF) will give you about 72 hours before the watch fully runs out of power, stops, and must be wound again. It moves down as the watch runs until you're out of power. Wind it again to fill it back up.</p>

<p><img src="https://world.hey.com/jason/49baf157/blobs/eyJfcmFpbHMiOnsiZGF0YSI6MjI5MTUzNTg5OSwicHVyIjoiYmxvYl9pZCJ9fQ--8a5e070419da19277ebc2c0dd73503ff4d80e44e845643d361781b2106d55814/a-lange-sohne-lange-1-pink-gold-191.032-power-reserve-indication.jpg" alt="A. Lange & Söhne Lange 1 Watch" style="max-width: 100%; height: auto;" /></p>

<p>Simple enough, right? An indicator and a scale for fully wound through unwound. Just like a car's fuel gauge. You have full through empty, with a few ticks in between to indicate 3/4 or 1/4 tank left, and typically a red zone at the end saying you really need to fill this thing up soon or you're going to be stranded.</p>

<p>However, all is not as it seems on the Lange 1. There's something very clever going on here to change your behavior.</p>

<p>First you'll notice five triangles between AUF and AUB. They aren't equally spaced. At first you might think it looks like each is about a quarter of the scale, and then the last two at the bottom would be like the red zone on your fuel gage.</p>

<p>But no. The indicator follows a non-linear progression downwards. It doesn't sweep from top to bottom evenly over time. It's actually accelerated early.</p>

<p><img src="https://world.hey.com/jason/49baf157/blobs/eyJfcmFpbHMiOnsiZGF0YSI6MjI5MTU2Mjk0NywicHVyIjoiYmxvYl9pZCJ9fQ--09a33414b685c89a8af23fa6c72a2e093ca7d87cf41b1b99a5945859e86acbb0/Note%20Oct%207,%202025.png" alt="Power Reserve Indicator Diagram" style="max-width: 100%; height: auto;" /></p>

<p>When fully wound, It takes just a day for the indicator to drop down two markers to the halfway point. From there, it takes a day each to hit the lower two markers. This makes it look like it's unwinding faster than it is because the indicator covers more distance in that first 24 hours. If the spacing were uniform, and the indicator was linear, the owner might not feel the need to wind it until the power reserve was nearly fully depleted. Then you might have a dead watch when you pick it up the next morning.</p>

<p>So what's the net effect of this tiny little design detail that the owner may not even understand? Well, it looks like the watch is already half-way out of power after the first day, so it encourages the owner to wind the watch more frequently. To keep it closer to topped off, even when it's not necessary. This helps prevents the watch from running out of power, losing time, and, ultimately, stopping. A stopped watch may be right twice a day, but it's rarely at the times you want.</p>

<p>Small detail, material behavior change. Well considered, well executed, well done.</p>`
      };

      const mockAnnotations = [
        {
          id: "annotation-1",
          userId: "demo-user-id",
          documentId: params.id,
          body: "This is brilliant - the design subtly changes behavior without the user even realizing it",
          start: 145,
          end: 222,
          color: "1",
          quote: "But the most interesting designs to me are when design changes your behavior.",
          prefix: "works.\n\n",
          suffix: " Even the",
          visibility: "private" as const,
          createdAt: new Date("2024-04-02"),
          updatedAt: new Date("2024-04-02")
        },
        {
          id: "annotation-2",
          userId: "demo-user-id",
          documentId: params.id,
          body: "Great example to illustrate the concept",
          start: 299,
          end: 371,
          color: "0",
          quote: "Take the power reserve indicator on the A. Lange & Söhne Lange 1 watch.",
          prefix: "something.\n\n",
          suffix: " The power",
          visibility: "private" as const,
          createdAt: new Date("2024-04-02"),
          updatedAt: new Date("2024-04-02")
        }
      ];

      return {
        document: mockDocument,
        annotations: mockAnnotations,
        color: "0"
      };
    }
  }
}

export default function Document() {

  const [notePopup, setNotePopup] = useState<null | {
    x: number;
    id: string;
    y: number;
    note: string;
    quote: string;
    color: string;
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
    const annotationColor = mark.getAttribute("data-color") ?? color;
    const quote = mark.textContent ?? "";
    const rect = mark.getBoundingClientRect();

    console.log("Clicked annotation, id:", id);

    // Add visual selection to all related highlights
    const container = window.document.getElementById("doc-container");
    if (container && id) {
      // Clear previous selection
      container.querySelectorAll(".anno-mark.is-selected").forEach((el: Element) => {
        el.classList.remove("is-selected");
      });

      // Add selection to all marks with same annid
      const marks = container.querySelectorAll(`.anno-mark[data-annid="${CSS.escape(id)}"]`);
      console.log("Found", marks.length, "marks to select");
      marks.forEach((el: Element) => {
        el.classList.add("is-selected");
        console.log("Added is-selected, classes now:", el.className);
      });
    }

    setNotePopup({
      id,
      note,
      quote,
      color: annotationColor,
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
          color={notePopup.color}
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
