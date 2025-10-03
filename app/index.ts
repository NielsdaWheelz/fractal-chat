import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { and, eq, sql, desc } from 'drizzle-orm';
import { chatTable, documentChunksTable, documentTable } from '~/db/schema'

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

async function main() {
  db
}

export const getDocuments = async (userId: string) => {
  const results = await db.select().from(documentTable).where(eq(documentTable.userId, userId))
  return results
}

export const getDocument = async (id: string, userId: string) => {
  const results = await db.select().from(documentTable).where(and(eq(documentTable.id, id), eq(documentTable.userId, userId)))
  if (results.length == 0) {
    return null
  } else {
    return documentRowToObject(results[0])
  }
}

export const getChats = async (userId: string, documentId: string) => {
  const results = await db.select().from(chatTable).where(and(eq(chatTable.userId, userId), eq(chatTable.documentId, documentId)))
  return results
}

export const saveDocument = async (document: {
  id: string;
  userId: string;
  url: string;
  title: string;
  content: string;
  textContent: string | null;
  authors: string | null;
  publishedTime: string | null;
}) => {
  const dbDocument = documentObjectToRow(document)
  return await db.insert(documentTable).values(dbDocument).onConflictDoUpdate({ target: documentTable.id, set: dbDocument })
}

export const saveDocumentChunks = async (chunks: Array<{
  id: string;
  documentId: string;
  text: string;
  chunkIndex: number;
  embedding: number[];
}>) => {
  if (chunks.length === 0) return;
  
  const dbChunks = chunks.map(chunk => ({
    id: chunk.id,
    documentId: chunk.documentId,
    text: chunk.text,
    chunkIndex: chunk.chunkIndex,
    embedding: chunk.embedding
  }));
  
  return await db.insert(documentChunksTable).values(dbChunks);
}

const documentRowToObject = (row: typeof documentTable.$inferSelect) => {
  return {
    id: row.id,
    userId: row.userId,
    url: row.url,
    title: row.title,
    content: row.content,
    textContent: row.textContent,
    authors: row.authors,
    publishedTime: row.publishedTime
  }
}

const documentObjectToRow = (document: {
  id: string;
  userId: string;
  url: string;
  title: string;
  content: string;
  textContent: string | null;
  authors: string | null;
  publishedTime: string | null;
}) => {
  return {
    id: document.id,
    userId: document.userId,
    url: document.url,
    title: document.title,
    content: document.content,
    textContent: document.textContent,
    authors: document.authors,
    publishedTime: document.publishedTime
  }
}

export async function semanticSearch(userId: string, queryEmbedding: number[], topK = 5) {
  // cosine similarity: 1 - (vector1 <=> vector2)
  // <=> computes cosine distance, so subtract from 1 for similarity
  const similarity = sql<number>`1 - (${documentChunksTable.embedding} <=> ${queryEmbedding}::vector)`;

  const results = await db
    .select({
      chunkId: documentChunksTable.id,
      chunkText: documentChunksTable.text,
      chunkIndex: documentChunksTable.chunkIndex,
      documentId: documentTable.id,
      documentTitle: documentTable.title,
      documentUrl: documentTable.url,
      authors: documentTable.authors,
      publishedTime: documentTable.publishedTime,
      similarity,
    })
    .from(documentChunksTable)
    .innerJoin(documentTable, eq(documentChunksTable.documentId, documentTable.id))
    .where(eq(documentTable.userId, userId))
    .orderBy(desc(similarity))
    .limit(topK);

  return results;
}


export const getChat = async (id: string, userId: string, documentId: string) => {
  const results = await db.select().from(chatTable).where(and(eq(chatTable.id, id), eq(chatTable.userId, userId), eq(chatTable.documentId, documentId)))
  if (results.length == 0) {
    return null
  } else {
    return chatRowToObject(results[0])
  }
}

export const saveChat = async (chat: {
  id: string;
  userId: string;
  documentId: string;
  messages: any[];
}) => {
  const dbChat = chatObjectToRow(chat)
  return await db.insert(chatTable).values(dbChat).onConflictDoUpdate({ target: chatTable.id, set: dbChat })
}

const chatRowToObject = (row: typeof chatTable.$inferSelect) => {
  return {
    id: row.id,
    userId: row.userId,
    documentId: row.documentId,
    messages: JSON.parse(row.messages)
  }
}

const chatObjectToRow = (chat: {
  id: string;
  userId: string;
  documentId: string;
  messages: any[];
}) => {
  return {
    id: chat.id,
    userId: chat.userId,
    documentId: chat.documentId,
    messages: JSON.stringify(chat.messages)
  }
}

main();