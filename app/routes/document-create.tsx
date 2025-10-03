import { redirect, type ActionFunctionArgs } from "react-router"
import { requireUser } from "~/utils/auth.server"
import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import { saveDocument, saveDocumentChunks } from "../index.server"
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

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

  if (!article || !article.textContent) return

  const rawText = article.textContent

  const chunkedDocs = await chunkText(rawText)

  const chunkTexts = chunkedDocs.map(doc => doc.pageContent)

  const embeddings = await generateEmbeddings(chunkTexts)

  const documentId = crypto.randomUUID()
  const document = {
    id: documentId,
    userId: userId,
    url: url,
    title: article.title ?? "Untitled Document",
    content: article.content ?? "",
    textContent: article.textContent,
    authors: article.byline ?? null,
    publishedTime: article.publishedTime ?? null,
  }
  await saveDocument(document)

  const documentChunks = chunkedDocs.map((doc, index) => ({
    id: crypto.randomUUID(),
    documentId: documentId,
    text: doc.pageContent,
    chunkIndex: index,
    embedding: embeddings[index],
  }))

  await saveDocumentChunks(documentChunks)

  throw redirect("/workspace/document/" + documentId)
}

export const chunkText = async (rawText: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const docs = await splitter.createDocuments([rawText]);
  return docs; // Each doc has { pageContent, metadata }
}

export const generateEmbeddings = async (chunkTexts: string[]) => {
  const { embeddings } = await embedMany({
    maxParallelCalls: 100,
    model: openai.textEmbeddingModel('text-embedding-3-small'),
    values: chunkTexts,
    providerOptions: {
      openai: {
        dimensions: 512,
      },
    },
  })
  return embeddings
};
