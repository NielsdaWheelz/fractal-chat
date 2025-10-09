import { annotation, comment, documentChunksTable, documentTable, permissionTable } from "~/db/schema"
import { db } from "~/server/index.server"
import { getGroups } from "./groups.server"
import { and, eq, inArray, or } from "drizzle-orm"
import type { Document, DocumentCreate, DocumentChunk, DocumentRow } from "~/types/types"
import { getVisibleAnnotationIds, getVisibleCommentIds } from "./permissions.server.helper"
import { NotFoundError } from "./errors.server"

export async function getAllDocuments(): Promise<DocumentBasic[]> {
  // Return all documents (they're public)
  const docs = await db
    .select({
      id: documentTable.id,
      title: documentTable.title,
      url: documentTable.url,
      publishedTime: documentTable.publishedTime,
      createdAt: documentTable.createdAt,
    })
    .from(documentTable);

  return docs;
}

export const getDocuments = async () => {
  // get all documents in groups where the user is
  const results = await db.select().from(documentTable)
  return results
}

export async function getDocument(
  userId: string,
  documentId: string
): Promise<DocumentWithAnnotations> {
  const doc = await db
    .select()
    .from(documentTable)
    .where(eq(documentTable.id, documentId))
    .limit(1);

  if (doc.length === 0) {
    throw new NotFoundError("Document", documentId);
  }

  // Get visible annotations
  const visibleAnnotationIds = await getVisibleAnnotationIds(userId, documentId);

  const annotations =
    visibleAnnotationIds.length > 0
      ? await db
        .select()
        .from(annotation)
        .where(inArray(annotation.id, visibleAnnotationIds))
      : [];

  // Get comments for each annotation
  const annotationsWithComments = await Promise.all(
    annotations.map(async (annot) => {
      const visibleCommentIds = await getVisibleCommentIds(userId, annot.id);

      const comments =
        visibleCommentIds.length > 0
          ? await db
            .select()
            .from(comment)
            .where(inArray(comment.id, visibleCommentIds))
          : [];

      return {
        ...annot,
        comments,
      };
    })
  );

  return {
    ...doc[0],
    annotations: annotationsWithComments,
  };
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

export async function createDocument(
  userId: string,
  docData: {
    id: string;
    url?: string | null;
    title: string;
    content: string;
    textContent?: string | null;
    publishedTime?: string | null;
  }
): Promise<DocumentWithAnnotations> {
  const result = await db
    .insert(documentTable)
    .values({
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return {
    ...result[0],
    annotations: [],
  };
}

export async function updateDocument(
  userId: string,
  documentId: string,
  updates: {
    title?: string;
    content?: string;
    textContent?: string | null;
    url?: string | null;
    publishedTime?: string | null;
  }
): Promise<DocumentWithAnnotations> {
  // Documents are ownerless, anyone can update
  const result = await db
    .update(documentTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(documentTable.id, documentId))
    .returning();

  if (result.length === 0) {
    throw new NotFoundError("Document", documentId);
  }

  return getDocument(userId, documentId);
}

export async function deleteDocument(userId: string, documentId: string): Promise<boolean> {
  // Documents are ownerless, anyone can delete
  await db.delete(documentTable).where(eq(documentTable.id, documentId));
  return true;
}