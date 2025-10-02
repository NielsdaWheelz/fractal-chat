import { requireUser } from "~/utils/auth.server";
import type { Route } from "../+types/root";
import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import { saveDocument } from "..";

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  const { id, url }: { id: string, url: string } = await request.json();

  if (!url || !id) {
    return new Response(JSON.stringify({ error: "Missing id or url" }), { status: 400, headers: { "Content-Type": "application/json" } })
  }

  const res = await fetch(url)
  const html = await res.text()
  const dom = new JSDOM(html, { url })
  const doc = dom.window.document
  const reader = new Readability(doc)
  const article = reader.parse();

  const safeTitle = (article?.title && article.title.trim().length > 0) ? article.title : (new URL(url)).hostname
  const safeContent = (article?.content && article.content.trim().length > 0) ? article.content : ""
  const safeAuthors = (article?.byline && article.byline.trim().length > 0) ? article.byline : ""
  const safePublishedTime = (article?.publishedTime && String(article.publishedTime).trim().length > 0) ? String(article.publishedTime) : ""
  const safeTextContent = article?.textContent ?? ""

  await saveDocument({
    id: id,
    userId: userId,
    url: url,
    title: safeTitle,
    content: safeContent,
    textContent: safeTextContent,
    authors: safeAuthors,
    publishedTime: safePublishedTime
  })

  return new Response(JSON.stringify({ id, ok: true }), { status: 200, headers: { "Content-Type": "application/json" } })
}