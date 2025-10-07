import { useEffect, useMemo, useState } from "react";

type Ann = { id?: string; start: number; end: number };

export default function DocumentContents({
  documentHTML,
  annotations,
}: {
  documentHTML: { __html: string };      // you’re already passing this
  annotations: Ann[];                    // pass from loader
}) {
  const [html, setHtml] = useState(documentHTML.__html);

  useEffect(() => {
    // only run in browser
    if (typeof window === "undefined") return;

    // Build a DOM we can safely mutate
    const el = document.createElement("div");
    el.innerHTML = documentHTML.__html;

    // Collect text nodes with their cumulative positions
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: { node: Text; start: number; end: number }[] = [];
    let pos = 0;
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const len = node.nodeValue?.length ?? 0;
      nodes.push({ node, start: pos, end: pos + len });
      pos += len;
    }

    // Sort annotations left→right to keep things stable
    const anns = (annotations ?? [])
      .filter(a => typeof a.start === "number" && typeof a.end === "number" && a.end > a.start)
      .slice()
      .sort((a, b) => a.start - b.start);

    // For each annotation, split affected text nodes and wrap the selection
    anns.forEach(({ start, end }) => {
      nodes.forEach(({ node, start: ns, end: ne }) => {
        const overlapStart = Math.max(start, ns);
        const overlapEnd   = Math.min(end, ne);
        if (overlapStart >= overlapEnd) return; // no overlap

        const offStart = overlapStart - ns;
        const offEnd   = overlapEnd - ns;

        const full = node.nodeValue ?? "";
        const before = full.slice(0, offStart);
        const middle = full.slice(offStart, offEnd);
        const after  = full.slice(offEnd);

        const mark = document.createElement("mark");
        mark.textContent = middle;
        mark.className = "anno-mark";      // style in CSS (below)
        mark.setAttribute("data-start", String(start));
        mark.setAttribute("data-end", String(end));

        const frag = document.createDocumentFragment();
        if (before) frag.append(before);
        frag.append(mark);
        if (after) frag.append(after);

        node.parentNode?.replaceChild(frag, node);
      });
    });

    setHtml(el.innerHTML);
  }, [documentHTML.__html, annotations]);

  return (
    <div
      id="doc-container"                 // ← keep this id for selection math
      className="flex-1 flex flex-col h-full overflow-y-auto p-8 gap-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
