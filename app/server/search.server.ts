import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm"
import { documentChunksTable, documentTable } from "~/db/schema"
import { db } from "~/server/index.server"

export async function semanticSearch(userId: string, queryEmbedding: number[], topK = 5, documentIds?: string[]) {
  // cosine similarity: 1 - (vector1 <=> vector2)
  // <=> computes cosine distance, so `1 -` for similarity
  // const similarity = sql<number>`1 - (${documentChunksTable.embedding} <=> ${queryEmbedding}::vector)`
  // Format the embedding array as a PostgreSQL vector literal string: '[1,2,3,...]'
  const vectorString = `[${queryEmbedding.join(',')}]`
  const similarity = sql<number>`1 - (${documentChunksTable.embedding} <=> ${vectorString}::vector)`

  const whereConditions = []

  if (documentIds && documentIds.length > 0) {
    whereConditions.push(inArray(documentTable.id, documentIds))
  }

  const results = await db
    .select({
      chunkId: documentChunksTable.id,
      chunkText: documentChunksTable.text,
      chunkIndex: documentChunksTable.chunkIndex,
      documentId: documentTable.id,
      documentTitle: documentTable.title,
      documentUrl: documentTable.url,
      publishedTime: documentTable.publishedTime,
      similarity,
    })
    .from(documentChunksTable)
    .innerJoin(documentTable, eq(documentChunksTable.documentId, documentTable.id))
    .where(and(...whereConditions))
    .orderBy(desc(similarity))
    .limit(topK)
  // i'm a fucking genius

  return results
}

export const searchDocumentsForMention = async (searchTerm?: string) => {
  const whereConditions = []

  if (searchTerm) {
    whereConditions.push(ilike(documentTable.title, `%${searchTerm}%`))
  }

  const results = await db
    .select({ id: documentTable.id, title: documentTable.title, url: documentTable.url })
    .from(documentTable)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(documentTable.id))
    .limit(10)

  return results
}
