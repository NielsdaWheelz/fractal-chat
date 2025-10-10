import twitterImageDark from "../assets/twitter-icon-dark.png"
import twitterImageLight from "../assets/twitter-icon-light.png"



type TweetProps = {
    title: string
    selectionText: string
    annotationText: string
    url?: string
    hashtags?: string[]
    via?: string // your handle without @
    docId: string
    theme: string
}

export function Tweet({ title, annotationText, selectionText, url, hashtags = [], via, docId, theme }: TweetProps) {
    const params = new URLSearchParams()
    const text = `"${selectionText}"\n-${title}\n\nSidenote:\n${annotationText}\n\nhttps://fractal-chat.vercel.app//workspace/document/${docId}/`

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
                src={theme == "light" ? twitterImageLight : twitterImageDark}
                alt="Tweet"
                className="w-4 h-4"
            />
        </a>
    )
}