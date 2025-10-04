import { useEffect, useState, useRef } from "react"
import { FileTextIcon, UserIcon, Loader2Icon } from "lucide-react"
import { cn } from "~/lib/utils"

export function MentionDropdown({
  query,
  onSelect,
  onClose,
  position
}) {
  const [results, setResults] = useState({ authors: [], documents: [] })
  const [selected, setSelected] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/mentions?q=${query}`)
        const data = await response.json()
        setResults(data)
        setSelected(0)
      } catch (error) {
        console.error('Error fetching mentions:', error)
        setResults({ authors: [], documents: [] })
      }
    }

    fetchResults
  }, [query])

  const allItems = [
    ...results.authors.map(author => ({ type: 'author', item: author })),
    ...results.documents.map(document => ({ type: 'document', item: document })),
  ]

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelected((prev) => (prev + 1) % allItems.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelected((prev) => (prev - 1 + allItems.length) % allItems.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (allItems[selected]) {
        handleSelect(allItems[selected])
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  const handleSelect = (item) => {
    const mention = {
      type: item.type,
      id: item.item.id,
      label: item.type === 'author' ? (item.item).name : (item.item).title,
    }
    onSelect(mention)
  }

  const totalItems = results.authors.length + results.documents.length

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute z-50 w-80 max-h-80 overflow-y-auto",
        "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700",
        "rounded-lg shadow-lg",
        "animate-in fade-in slide-in-from-top-2 duration-200"
      )}
      style={position ? { top: position.top, left: position.left } : { bottom: '100%', left: 0, marginBottom: '0.5rem' }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="py-2">
        {/* Authors Section */}
        {results.authors.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Authors
            </div>
            {results.authors.map((author, i) => {
              const index = i
              return (
                <button
                  key={author.id}
                  type="button"
                  onClick={() => handleSelect({ type: 'author', item: author })}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
                    "hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                    selected === index && "bg-gray-100 dark:bg-zinc-800"
                  )}
                >
                  <UserIcon className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                  <span className="truncate">{author.name}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Documents Section */}
        {results.documents.length > 0 && (
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Documents
            </div>
            {results.documents.map((doc, i) => {
              const index = results.authors.length + i
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelect({ type: 'document', item: doc })}
                  className={cn(
                    "w-full flex items-start gap-2 px-3 py-2 text-sm text-left",
                    "hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                    selected === index && "bg-gray-100 dark:bg-zinc-800"
                  )}
                >
                  <FileTextIcon className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{doc.title}</div>
                    <div className="truncate text-xs text-gray-500 dark:text-gray-400">{doc.url}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

