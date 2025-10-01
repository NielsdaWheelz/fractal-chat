import { useEffect } from 'react'
import { Markdown } from "~/components/ui/markdown"
import { useTextStream } from "~/components/ui/response-stream"

const Content = ({ text }: { text: string }) => {
  const { displayedText, startStreaming } = useTextStream({
    textStream: text,
    mode: "typewriter",
    speed: 30,
  })

  useEffect(() => {
    startStreaming()
  }, [startStreaming])

  return (
    <div className="w-full min-w-full">
      <Markdown className="prose prose-sm dark:prose-invert prose-h2:mt-0! prose-h2:scroll-m-0!">
        {displayedText}
      </Markdown>
    </div>
  )
}

export default Content