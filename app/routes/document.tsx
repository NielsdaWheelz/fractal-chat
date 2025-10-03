import { useState } from "react";
import { Form, redirect, useLoaderData, useOutletContext, useParams } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { getDocument } from "../index.server";
import { HighlightPopover, useHighlightPopover } from '@omsimos/react-highlight-popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { MessageCirclePlus, MessageSquareReply } from "lucide-react";

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

export default function Document() {
  const { selectionRef, setShowHighlight, setIncludeSelection } = useOutletContext<{ selectionRef: React.MutableRefObject<string>, setShowHighlight: React.Dispatch<React.SetStateAction<boolean>> }>();
  const { document } = useLoaderData<typeof loader>() as { document: { id: string; content: string } };
  const docContent = () => {
    return { __html: document.content }
  }
  const handleSelectionStart = () => console.log('Selection started');
  const handleSelectionEnd = (selection: string) => {
    selectionRef.current = selection
    // setIncludeSelection(true)
  };
  const handlePopoverShow = () => console.log('Popover shown');
  const handlePopoverHide = () => console.log('Popover hidden');

  const CustomPopover = () => {
    const { currentSelection, setShowPopover } = useHighlightPopover();

    let truncSel = ""
    if (currentSelection.length > 30) {
      // If the string is longer than maxLength, truncate it and add "..."
      truncSel = currentSelection.slice(0, 25) + '...' + currentSelection.slice(currentSelection.length - 25, currentSelection.length);
    } else {
      // If the string is not longer than maxLength, return it as is
      truncSel = currentSelection;
    }
    return (
      <div className="bg-white border rounded-md p-2 shadow-lg select-none text-xs flex flex-row items-center">
        <p>{truncSel}</p>
        <div className="flex flex-col">
          <Form method="post" action={`/workspace/document/${useParams().id}/chat-create`}>
            <TooltipProvider>
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
          </Form>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => {
                  setShowHighlight(true)
                  setIncludeSelection(true)
                  }}>
                  <MessageSquareReply className="h-2 w-2" />
                  <span className="sr-only">add to existing chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>add to existing chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }


  return (
    <>
      <HighlightPopover renderPopover={() => <CustomPopover />}
        offset={{ x: 0, y: -10 }}
        minSelectionLength={5}
        onSelectionStart={handleSelectionStart}
        onSelectionEnd={handleSelectionEnd}
        onPopoverShow={handlePopoverShow}
        onPopoverHide={handlePopoverHide}>
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-8 gap-4" dangerouslySetInnerHTML={docContent()}>
        </div>
      </HighlightPopover>
    </>
  );
}
