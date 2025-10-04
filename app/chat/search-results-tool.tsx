"use client"

import { Button } from "~/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import { cn } from "~/lib/utils"
import {
  CheckCircle,
  ChevronDown,
  Loader2,
  Search,
  XCircle,
  ExternalLink,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

type SearchResult = {
  chunkId: string
  chunkText: string
  chunkIndex: number
  documentId: string
  documentTitle: string
  documentUrl: string
  publishedTime: string | null
  similarity: number
}

type ToolPart = {
  type: string
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error"
  input?: Record<string, unknown>
  output?: {
    success?: boolean
    results?: SearchResult[]
    count?: number
  }
  toolCallId?: string
  errorText?: string
}

type SearchResultsToolProps = {
  toolPart: ToolPart
  defaultOpen?: boolean
  className?: string
}

const SNIPPET_PREVIEW_LENGTH = 150

const SearchResultSnippet = ({ result }: { result: SearchResult }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const needsTruncation = result.chunkText.length > SNIPPET_PREVIEW_LENGTH
  const displayText = isExpanded || !needsTruncation
    ? result.chunkText
    : `${result.chunkText.slice(0, SNIPPET_PREVIEW_LENGTH)}...`

  return (
    <div className="space-y-1.5 rounded-md border bg-muted/30 p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <Link
              to={`/workspace/document/${result.documentId}`}
              className="group flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <span className="line-clamp-1">{result.documentTitle}</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {(result.similarity * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="text-xs leading-relaxed">
        <p className="whitespace-pre-wrap">{displayText}</p>
        {needsTruncation && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary mt-0.5 text-[10px] font-medium hover:underline"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="border-t pt-1.5">
        <Link
          to={`/workspace/document/${result.documentId}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[10px] transition-colors"
        >
          <span>View full document</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </div>
    </div>
  )
}

export const SearchResultsTool = ({
  toolPart,
  defaultOpen = true,
  className,
}: SearchResultsToolProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const { state, input, output, toolCallId } = toolPart

  const getStateIcon = () => {
    switch (state) {
      case "input-streaming":
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case "input-available":
        return <Search className="h-3 w-3 text-orange-500" />
      case "output-available":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "output-error":
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return <Search className="text-muted-foreground h-3 w-3" />
    }
  }

  const getStateBadge = () => {
    const baseClasses = "px-1.5 py-0.5 rounded-full text-[10px] font-medium"
    switch (state) {
      case "input-streaming":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            )}
          >
            Searching
          </span>
        )
      case "input-available":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            )}
          >
            Ready
          </span>
        )
      case "output-available":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            )}
          >
            {output?.count ?? 0} {output?.count === 1 ? "result" : "results"}
          </span>
        )
      case "output-error":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            Error
          </span>
        )
      default:
        return (
          <span
            className={cn(
              baseClasses,
              "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
            )}
          >
            Pending
          </span>
        )
    }
  }

  const results = output?.results ?? []

  return (
    <div
      className={cn(
        "border-border mt-2 overflow-hidden rounded-md border",
        className
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="bg-background h-auto w-full justify-between rounded-b-none px-2 py-1.5 font-normal"
          >
            <div className="flex items-center gap-1.5">
              {getStateIcon()}
              <span className="font-mono text-xs font-medium">
                Document Search
              </span>
              {getStateBadge()}
            </div>
            <ChevronDown className={cn("h-3 w-3", isOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent
          className={cn(
            "border-border border-t",
            "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden"
          )}
        >
          <div className="bg-background space-y-2 p-2">
            {input && Object.keys(input).length > 0 && (
              <div>
                <h4 className="text-muted-foreground mb-1 text-xs font-medium">
                  Search Query
                </h4>
                <div className="bg-background rounded border p-1.5 font-mono text-[10px]">
                  {Object.entries(input).map(([key, value]) => (
                    <div key={key} className="mb-0.5">
                      <span className="text-muted-foreground">{key}:</span>{" "}
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state === "output-available" && results.length > 0 && (
              <div>
                <h4 className="text-muted-foreground mb-1 text-xs font-medium">
                  Search Results
                </h4>
                <div className="space-y-2">
                  {results.map((result) => (
                    <SearchResultSnippet key={result.chunkId} result={result} />
                  ))}
                </div>
              </div>
            )}

            {state === "output-available" && results.length === 0 && (
              <div className="text-muted-foreground text-xs">
                No results found for this query.
              </div>
            )}

            {state === "output-error" && toolPart.errorText && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-red-500">Error</h4>
                <div className="bg-background rounded border border-red-200 p-1.5 text-xs dark:border-red-950 dark:bg-red-900/20">
                  {toolPart.errorText}
                </div>
              </div>
            )}

            {state === "input-streaming" && (
              <div className="text-muted-foreground text-xs">
                Searching documents...
              </div>
            )}

            {toolCallId && (
              <div className="text-muted-foreground border-t pt-1.5 text-[10px]">
                <span className="font-mono">Call ID: {toolCallId}</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

