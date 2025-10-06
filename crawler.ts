import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import { saveDocument } from "~/index.server"

const url = "https://paulgraham.com/index.html"
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const parseDomain = async (url) => {
  const urlsToVisit = [url]
  const urlsVisited = new Set()

  const parsePage = async (url) => {
    if (!urlsVisited.has(url)) {
      try {
        const res = await fetch(url)
        await delay(2000)
        const html = await res.text()
        const dom = new JSDOM(html, { url })
        const doc = dom.window.document
        const pageLinkElements = doc.querySelectorAll('a')
        pageLinkElements.forEach(link => {
          const targetUrl = link.href
          let fullUrl = ""
          if (targetUrl.endsWith(".pdf") || targetUrl.endsWith(".doc")) {
            return
          } else if (targetUrl.slice(0, url.length) === url || targetUrl[0] === "/") {
            fullUrl = new URL(targetUrl, url).href
          } else {
            return
          }
          if (!urlsVisited.has(fullUrl)) {
            urlsToVisit.push(fullUrl)
          }
        });
        const reader = new Readability(doc)
        const article = reader.parse();
        const documentId = crypto.randomUUID()
        const document = {
          id: documentId,
          // userId: userId,
          url: url,
          title: article.title ?? "Untitled Document",
          content: article.content ?? "",
          textContent: article.textContent,
          publishedTime: article.publishedTime ?? null,
        }
        // await saveDocument(document)
      } catch {

      }
    }
  }
  while (urlsToVisit.length > 0) {
    const currentUrl = urlsToVisit.shift()
    await parsePage(currentUrl)
    urlsVisited.add(currentUrl)
  }
}

parseDomain(url)