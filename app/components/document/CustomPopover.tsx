import { CornerDownLeft, MessageCirclePlus, MessageSquareReply } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form } from "react-router";
import { Tweet } from "~/routes/tweet";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type PopoverProps = {
    docId: string;
    docTitle: string;
    color: string;
    selectionText: string;
    annotationText: string;
    setAnnotationText: (v: string) => void;
    selectionRef: React.MutableRefObject<string>;
    setIncludeSelection: React.Dispatch<React.SetStateAction<boolean>>,
    // optional: position; if you want to move with selection
    x?: number;
    y?: number;
    theme: string;
    onRequestClose: () => void;
};


export function CustomPopover({
    docId,
    docTitle,
    selectionText,
    color,
    setIncludeSelection,
    selectionRef,
    onRequestClose,
    theme,
    x = 0,
    y = 0,
}: PopoverProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const hiddenRef = useRef<HTMLInputElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);

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
        window.document.addEventListener("pointerdown", handlePointerDown, true);
        return () =>
            window.document.removeEventListener("pointerdown", handlePointerDown, true);
    }, [onRequestClose]);
    const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        let parsed: any = null;
        try {
            parsed = JSON.parse(selectionRef.current);
            onRequestClose();
        } catch { }
        if (!parsed) {
            e.preventDefault();
            return;
        }

        const payload = {
            documentId: docId,
            start: parsed.start,
            end: parsed.end,
            color: color,
            quote: parsed.quote,
            prefix: parsed.prefix,
            suffix: parsed.suffix,
            body: noteRef.current?.value ?? "",
        };

        if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(payload);
    };

    const [tweetSidenote, setTweetSidenote] = useState("");

    return (
        <div
            ref={rootRef}
            className="bg-sidebar text-accent-foreground"
            style={{
                position: "fixed",
                left: x,
                top: y,
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
            <p className="mb-3 text-sm font-medium break-words">
                {selectionText}
            </p>
            <div className="flex flex-col gap-3 items-center">
                <Form
                    className="flex w-full items-end"
                    method="post"
                    action={`/workspace/document/${docId}/save-annotation`}
                    onSubmit={onSubmit}
                >
                    <input ref={hiddenRef} type="hidden" name="annotation" />
                    <textarea
                        ref={noteRef}
                        name="note"
                        placeholder="Type text..."
                        onChange={(e) => {
                            setTweetSidenote(e.target.value);
                            e.currentTarget.style.height = "auto";
                            e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 3 * 24)}px`; // 3 lines max (assuming 24px line-height)
                        }}
                        rows={1}
                        className="w-full resize-none overflow-y-auto bg-transparent border p-1 rounded-sm focus:ring-0 focus:outline-none leading-6"
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="ml-1"
                                    type="submit"

                                >
                                    <CornerDownLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add annotation</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Form>
                <div className="flex flex-row">
                    <Form method="post" action={`/workspace/document/${docId}/chat-create`}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => { }}>
                                    <MessageCirclePlus className="h-2 w-2" />
                                    <span className="sr-only">Create new chat</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Create new chat</p>
                            </TooltipContent>
                        </Tooltip>
                    </Form>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => {
                                setIncludeSelection(true);
                            }}>
                                <MessageSquareReply className="h-2 w-2" />
                                <span className="sr-only">Add to existing chat</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add to existing chat</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => {
                            }}>
                                <Tweet title={docTitle} annotationText={tweetSidenote} selectionText={selectionText} docId={docId} theme={theme}></Tweet>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Tweet annotation</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};