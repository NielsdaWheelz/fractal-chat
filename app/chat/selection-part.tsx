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
        "my-1.5 rounded-lg bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20",
        "border-l-4 border-blue-400/60 dark:border-blue-500/50",
        "pl-3 pr-3 py-2.5",
        "shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <Quote className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-500/70 dark:text-blue-400/60" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium text-blue-600/80 dark:text-blue-400/70 mb-1">
            Selected from document
          </div>
          <div className="text-xs leading-relaxed text-foreground/90">
            {prefix && (
              <span className="text-muted-foreground/80 italic text-[11px]">
                ...{prefix}{" "}
              </span>
            )}
            <span className="whitespace-pre-wrap">{text}</span>
            {suffix && (
              <span className="text-muted-foreground/80 italic text-[11px]">
                {" "}{suffix}...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

