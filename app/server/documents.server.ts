import { comment, documentChunksTable, documentTable } from "~/db/schema"
import { db } from "~/server/index.server"
import { eq } from "drizzle-orm"
import type { Document, DocumentCreate, DocumentChunk, DocumentRow } from "~/types/types"

export const getAllDocuments = async (): Promise<DocumentRow[]> => {
  const results = await db.select().from(documentTable)
  return results
}

export const getDocuments = async () => {
  const results = await db.select().from(documentTable)
  return results
}

export const getDocument = async (id: string) => {
  const document = await db.select().from(documentTable).where(eq(documentTable.id, id))
  if (!document) return null
  // const annotations = await db.select().from(annotation).where(eq(annotation.docId, id))
  // const comments = await db.select().from(comment).leftJoin(annotation, eq(comment.annotationId, annotation.id)).where(inArray(comment.annotationId, annotations.map(annotation => annotation.id)))
  // const annotationsWithComments = annotations.map(annotation => ({
  //   ...annotation, comments: comments.filter(comment => comment.annotationId === annotation.id)
  // }))
  // const results = { ...document[0], annotations: annotationsWithComments }
  // return results
  return document[0]
}

export const saveDocument = async (document: DocumentCreate) => {
  const dbDocument = documentObjectToRow(document)
  return await db.insert(documentTable).values(dbDocument).onConflictDoUpdate({ target: documentTable.id, set: dbDocument })
}

export const saveDocumentChunks = async (chunks: DocumentChunk[]) => {
  if (chunks.length === 0) return

  const dbChunks = chunks.map(chunk => ({
    id: chunk.id,
    documentId: chunk.documentId,
    text: chunk.text,
    chunkIndex: chunk.chunkIndex,
    embedding: chunk.embedding
  }))

  return await db.insert(documentChunksTable).values(dbChunks)
}

const documentRowToObject = (row: DocumentRow): Document => {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    content: row.content,
    textContent: row.textContent,
    publishedTime: row.publishedTime,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

const documentObjectToRow = (doc: DocumentCreate) => {
  return {
    id: doc.id,
    url: doc.url,
    title: doc.title,
    content: doc.content,
    textContent: doc.textContent,
    publishedTime: doc.publishedTime,
    visibility: doc.visibility,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }
}
