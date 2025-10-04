import { FileTextIcon, UserIcon, XIcon } from "lucide-react"
import { cn } from "~/lib/utils"

export function MentionPill({
  label,
  type,
  onRemove,
  variant = 'default',
  className
}) {
  const Icon = type === 'document' ? FileTextIcon : UserIcon
  const isRemovable = variant === 'default' && onRemove

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        "border transition-colors",
        type === 'document'
          ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
          : "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300",
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span className="truncate max-w-[200px]">{label}</span>
      {isRemovable && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className="shrink-0 hover:opacity-70 transition-opacity ml-1"
          aria-label={`Remove ${label}`}
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

