import { requireUser } from "~/utils/auth.server";
import type { Route } from "../+types/root";
import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import { saveDocument } from "..";

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  const { id, url }: { id: string, url: string } = await request.json();
  const res = await fetch(url)
  const html = await res.text()
  const dom = new JSDOM(html, { url })
  const doc = dom.window.document
  const reader = new Readability(doc)
  const article = reader.parse();

  saveDocument({
    id: id,
    userId: userId,
    url: url,
    title: article?.title,
    content: article?.content,
    textContent: article?.textContent,
    authors: article?.byline,
    publishedTime: article?.publishedTime
  })
}