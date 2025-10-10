import { useEffect, useState } from "react";
import type { Annotation } from "~/types/types";

type TextSpan = { node: Text; start: number; end: number };

export default function DocumentContents({
  documentHTML,
  annotations,
}: {
  documentHTML: { __html: string };
  annotations: Annotation[];
}) {
  const colors = ["red", "purple", "blue", "green", "orange", "gray"];
  const [html, setHtml] = useState(documentHTML.__html);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) build a detached DOM we can mutate safely
    const root = document.createElement("div");
    root.innerHTML = documentHTML.__html;

    // 2) collect text nodes w/ absolute offsets
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: TextSpan[] = [];
    {
      let pos = 0;
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const len = node.nodeValue?.length ?? 0;
        if (len > 0) nodes.push({ node, start: pos, end: pos + len });
        pos += len;
      }
    }

    // normalize annotations
    const anns = (annotations ?? [])
      .filter(
        (a) =>
          Number.isFinite(a.start) &&
          Number.isFinite(a.end) &&
          a.end > a.start
      )
      .slice()
      .sort((a, b) => a.start - b.start);

    // 3) map annotations to per-node relative ranges
    const perNode = new Map<Text, Array<{ rs: number; re: number; ann: Annotation }>>();

    let ni = 0;
    for (const ann of anns) {
      const aStart = ann.start;
      const aEnd = ann.end;

      while (ni < nodes.length && nodes[ni].end <= aStart) ni++;

      for (let j = ni; j < nodes.length; j++) {
        const { node, start: ns, end: ne } = nodes[j];
        if (ns >= aEnd) break;
        const s = Math.max(aStart, ns);
        const e = Math.min(aEnd, ne);
        if (s < e) {
          const arr = perNode.get(node) ?? (perNode.set(node, []), perNode.get(node)!);
          arr.push({ rs: s - ns, re: e - ns, ann });
        }
      }
    }

    // 4) split each text node into minimal segments, wrap covered parts
    for (const [node, rangesRaw] of perNode) {
      const full = node.nodeValue ?? "";
      if (!full) continue;

      type Ev = { x: number; type: "start" | "end"; ann: Annotation };
      const events: Ev[] = [];

      for (const { rs, re, ann } of rangesRaw) {
        if (rs < re) {
          events.push({ x: rs, type: "start", ann });
          events.push({ x: re, type: "end", ann });
        }
      }

      events.sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        if (a.type === b.type) return 0;
        return a.type === "end" ? -1 : 1; // end before start at same x
      });

      const frag = document.createDocumentFragment();
      const active: Annotation[] = [];
      let cursor = 0;

      const pushPlain = (text: string) => {
        if (text) frag.append(text);
      };

      const pushMarked = (text: string, covering: Annotation[]) => {
        const primary = covering[0];
        const mark = document.createElement("mark");
        mark.textContent = text;
        mark.className = "anno-mark";

        // color class from index if provided
        const colorIndex =
          typeof primary.color === "string" ? Number(primary.color) : Number(primary.color);
        if (!Number.isNaN(colorIndex) && Number.isFinite(colorIndex)) {
          const c = colors[colorIndex as number];
          if (c) mark.className += ` ${c}`;
        }

        // ids: keep all for advanced behavior, store primary for fast lookup
        const ids = covering.map((a) => (a.id ? String(a.id) : "")).filter(Boolean);
        if (ids.length) {
          mark.dataset.annids = JSON.stringify(ids);
          mark.dataset.annid = ids[0]; // primary id used for hover/select grouping
        }

        // convenience
        const noteVal = (primary as any)?.note ?? (primary as any)?.body ?? "";
        if (noteVal) mark.dataset.note = String(noteVal);

        mark.dataset.ranges = JSON.stringify(
          covering.map((a) => ({ start: a.start, end: a.end }))
        );

        frag.append(mark);
      };

      const emitSegment = (from: number, to: number) => {
        if (from >= to) return;
        const text = full.slice(from, to);
        if (active.length === 0) pushPlain(text);
        else pushMarked(text, active);
      };

      for (const ev of events) {
        if (cursor < ev.x) emitSegment(cursor, ev.x);

        if (ev.type === "start") {
          if (!active.includes(ev.ann)) active.push(ev.ann);
        } else {
          const idx = active.indexOf(ev.ann);
          if (idx !== -1) active.splice(idx, 1);
        }

        cursor = ev.x;
      }

      if (cursor < full.length) emitSegment(cursor, full.length);

      node.parentNode?.replaceChild(frag, node);
    }

    setHtml(root.innerHTML);
  }, [documentHTML.__html, annotations]);

  // delegate hover/click so it survives innerHTML changes
  useEffect(() => {
    const container = document.getElementById("doc-container");
    if (!container) return;

    let lastHoverId: string | null = null;
    let lastSelectedId: string | null = null;

    const related = (annid: string) =>
      container.querySelectorAll<HTMLElement>(
        `.anno-mark[data-annid="${CSS.escape(annid)}"]`
      );

    const clearClass = (cls: string) => {
      container
        .querySelectorAll<HTMLElement>(`.anno-mark.${cls}`)
        .forEach((el) => el.classList.remove(cls));
    };

    const handleMouseOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".anno-mark") as HTMLElement | null;
      if (!el) return;
      const annid = el.dataset.annid;
      if (!annid || annid === lastHoverId) return;

      clearClass("is-hovered");
      related(annid).forEach((n) => n.classList.add("is-hovered"));
      lastHoverId = annid;
    };

    const handleMouseOut = (e: MouseEvent) => {
      const to = e.relatedTarget as HTMLElement | null;
      if (to && to.closest(".anno-mark")) return; // still on some mark
      clearClass("is-hovered");
      lastHoverId = null;
    };

    const handleClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".anno-mark") as HTMLElement | null;
      if (!el) return;
      const annid = el.dataset.annid;
      if (!annid) return;

      if (annid === lastSelectedId) {
        clearClass("is-selected");
        lastSelectedId = null;
        getSelection()?.removeAllRanges();
        return;
      }

      clearClass("is-selected");
      const pieces = Array.from(related(annid));
      pieces.forEach((n) => n.classList.add("is-selected"));
      lastSelectedId = annid;

      // select text across all pieces (for copy, accessibility)
      const first = pieces[0]?.firstChild as Text | null;
      const last = pieces[pieces.length - 1]?.firstChild as Text | null;
      if (first && last && first.nodeType === Node.TEXT_NODE && last.nodeType === Node.TEXT_NODE) {
        const r = document.createRange();
        r.setStart(first, 0);
        r.setEnd(last, last.data.length);
        const sel = getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(r);
        }
      }
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      container.removeEventListener("click", handleClick);
    };
  }, [html]);

  return (
    <div
      id="doc-container"
      className="flex-1 flex flex-col h-full overflow-y-auto p-8 gap-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/*
add css somewhere (tailwind or plain):

.anno-mark.is-hovered {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.anno-mark.is-selected {
  outline: 3px solid currentColor;
  outline-offset: 2px;
  filter: brightness(0.95);
}
*/
