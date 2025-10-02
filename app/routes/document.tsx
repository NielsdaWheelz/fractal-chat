import { useState } from "react";
import { redirect, useLoaderData } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { getDocument } from "..";
import { HighlightPopover, useHighlightPopover } from '@omsimos/react-highlight-popover';

export async function loader({ request, params }: { request: Request; params: { id?: string } }) {
  const userId = await requireUser(request)
  if (!params.id) {
    throw redirect("/")
  }
  const document = await getDocument(params.id, userId)
  if (!document) {
    throw redirect("/")
  }
  return { document: document }
}

function CustomPopover() {
  const { currentSelection, setShowPopover } = useHighlightPopover();

  return (
    <div className="bg-white border rounded-md p-2 shadow-lg select-none">
      <p>You selected: {currentSelection}</p>
      <button className="font-semibold" onClick={() => setShowPopover(false)}>Close</button>
    </div>
  );
}

export default function Document() {
  const { document } = useLoaderData<typeof loader>() as { document: { id: string; content: string } };
  const docContent = () => {
    return { __html: document.content }
  }
  const handleSelectionStart = () => console.log('Selection started');
  const handleSelectionEnd = (selection) => console.log('Selected:', selection);
  const handlePopoverShow = () => console.log('Popover shown');
  const handlePopoverHide = () => console.log('Popover hidden');

  return (
    <>
      <HighlightPopover renderPopover={() => <CustomPopover />}
        offset={{ x: 0, y: -10 }}
        minSelectionLength={5}
        onSelectionStart={handleSelectionStart}
        onSelectionEnd={handleSelectionEnd}
        onPopoverShow={handlePopoverShow}
        onPopoverHide={handlePopoverHide}>
        <div className="flex-1 flex flex-col h-full overflow-y-auto" dangerouslySetInnerHTML={docContent()}>
        </div>
      </HighlightPopover>
    </>
  );
}
