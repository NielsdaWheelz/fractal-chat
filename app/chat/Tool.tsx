import { Tool, type ToolPart } from "~/components/ui/tool"

type ToolLikePart = {
  type: string
  state?: ToolPart["state"]
  input?: Record<string, unknown> | string
  output?: Record<string, unknown>
  toolCallId?: string
  errorText?: string
}

export function ToolComponent({ part }: { part: ToolLikePart }) {
  const normalizedInput =
    typeof part.input === 'string' ? { query: part.input } : part.input

  return (
    <Tool
      className="w-full max-w-md"
      toolPart={{
        type: part.type,
        state: part.state ?? 'input-available',
        input: normalizedInput,
        output: part.output,
        toolCallId: part.toolCallId,
        errorText: part.errorText,
      }}
    />
  )
}
