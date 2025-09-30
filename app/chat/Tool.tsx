import { Tool } from "~/components/ui/tool"

export function ToolComponent(props: { i, message, part }) {
  return (
    <Tool key={`${props.message.id}-${props.i}`}
      className="w-full max-w-md"
      toolPart={{
        type: props.part.type,
        state: props.part.state,
        input: {
          query: props.part.input,
        },
        output: {
          results: [
            JSON.stringify(props.part, null, 2)
          ]
        },
      }}
    />
  )
}
