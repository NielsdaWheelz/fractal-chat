import twitterImage from "../assets/twitter-icon.png"


type TweetProps = {
    title: string
    selectionText: string
    annotationText: string
    url?: string
    hashtags?: string[]
    via?: string // your handle without @
}

export function Tweet({ title, annotationText, selectionText, url, hashtags = [], via }: TweetProps) {
    const params = new URLSearchParams()
    const text = `"${selectionText}"\n-${title}\n\n${annotationText}`

    if (text) params.set("text", text)
    if (url) params.set("url", url)
    if (hashtags.length) params.set("hashtags", hashtags.join(","))
    if (via) params.set("via", via)

    const href = `https://twitter.com/intent/tweet?${params.toString()}`
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl px-3 py-2"
        >
            <img
                src={twitterImage}
                alt="Tweet"
                className="w-4 h-4"
            />
        </a>
    )
}