import { useEffect, useMemo, useState } from "react";

type Ann = { id?: string; start: number; end: number; note?: string };

export default function DocumentContents({
  documentHTML,
  annotations,
}: {
  documentHTML: { __html: string }; // you’re already passing this
  annotations: Ann[]; // pass from loader
}) {
  const annBySpan = new Map(
    (annotations ?? []).map((a) => [`${a.start}:${a.end}`, a])
  );

  const [html, setHtml] = useState(documentHTML.__html);

  useEffect(() => {

    if (typeof window === "undefined") return;

    const el = document.createElement("div");
    el.innerHTML = documentHTML.__html;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: { node: Text; start: number; end: number }[] = [];
    let pos = 0;
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const len = node.nodeValue?.length ?? 0;
      nodes.push({ node, start: pos, end: pos + len });
      pos += len;
    }

    const anns = (annotations ?? [])
      .filter(
        (a) =>
          typeof a.start === "number" &&
          typeof a.end === "number" &&
          a.end > a.start
      )
      .slice()
      .sort((a, b) => a.start - b.start);

    // For each annotation, split affected text nodes and wrap the selection
    anns.forEach(({ start, end }) => {
      nodes.forEach(({ node, start: ns, end: ne }) => {
        const overlapStart = Math.max(start, ns);
        const overlapEnd = Math.min(end, ne);
        if (overlapStart >= overlapEnd) return; // no overlap

        const offStart = overlapStart - ns;
        const offEnd = overlapEnd - ns;

        const full = node.nodeValue ?? "";
        const before = full.slice(0, offStart);
        const middle = full.slice(offStart, offEnd);
        const after = full.slice(offEnd);

        const mark = document.createElement("mark");
        const key = `${start}:${end}`;
        const meta = annBySpan.get(key);
        mark.textContent = middle;
        mark.className = "anno-mark";

        mark.setAttribute("data-start", String(start));
        mark.setAttribute("data-end", String(end));
        if (meta?.id) mark.setAttribute("data-annid", meta.id);
        const noteVal = (meta as any)?.note ?? (meta as any)?.body ?? "";
        const noteID = (meta as any)?.note ?? (meta as any)?.id ?? "";
        mark.setAttribute("data-note", noteVal);
        mark.setAttribute("data-id", noteID);
        if ((meta as any)?.id)
          mark.setAttribute("data-annid", String((meta as any).id));

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
      id="doc-container" // ← keep this id for selection math
      className="flex-1 flex flex-col h-full overflow-y-auto p-8 gap-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
