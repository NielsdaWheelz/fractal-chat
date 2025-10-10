import { Quote } from "lucide-react"
import { cn } from "~/lib/utils"

type SelectionPartProps = {
  text: string
  prefix?: string
  suffix?: string
  className?: string
}

export function SelectionPart({
  text,
  prefix,
  suffix,
  className,
}: SelectionPartProps) {
  return (
    <div
      className={cn(
        "border-border my-2 overflow-hidden rounded-md border bg-muted/30",
        className
      )}
    >
      <div className="bg-muted/50 flex items-center gap-1.5 border-b px-2 py-1">
        <Quote className="text-muted-foreground h-3 w-3" />
        <span className="text-muted-foreground text-xs font-medium">
          Selected Text
        </span>
      </div>
      <div className="p-2">
        <div className="text-xs leading-relaxed">
          {prefix && (
            <span className="text-muted-foreground italic">...{prefix} </span>
          )}
          <span className="whitespace-pre-wrap font-medium">{text}</span>
          {suffix && (
            <span className="text-muted-foreground italic"> {suffix}...</span>
          )}
        </div>
      </div>
    </div>
  )
}

