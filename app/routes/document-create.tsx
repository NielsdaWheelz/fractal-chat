import { redirect, type ActionFunctionArgs } from "react-router"
import { requireUser } from "~/utils/auth.server"
import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import { saveDocument } from ".."

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUser(request)
  const formData = await request.formData()
  const url = String(formData.get("url") || "").trim()
  if (!url || url.length < 1) {
    throw redirect("/workspace")
  }

  const res = await fetch(url)
  const html = await res.text()
  const dom = new JSDOM(html, { url })
  const doc = dom.window.document
  const reader = new Readability(doc)
  const article = reader.parse();

  if (!article) return

  const id = crypto.randomUUID()

  const document = {
    id: id,
    userId: userId,
    url: url,
    title: article.title,
    content: article.content,
    textContent: article.textContent,
    authors: article.byline,
    publishedTime: article.publishedTime
  }

  await saveDocument(document)
  throw redirect("/workspace/document/" + document.id)
}