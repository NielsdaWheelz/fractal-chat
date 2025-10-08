import { and, eq, ilike } from "drizzle-orm"
import { authorTable, documentAuthorsTable, documentTable } from "~/db/schema"
import { db } from "~/server/index.server"

// Author-related functions
export const getAuthors = async (searchTerm?: string) => {
  const whereConditions = []

  if (searchTerm) {
    whereConditions.push(ilike(authorTable.name, `%${searchTerm}%`))
  }

  const results = await db
    .select()
    .from(authorTable)
    .where(and(...whereConditions))
    .orderBy(authorTable.name)
    .limit(10)

  return results.map(r => ({ id: r.id, name: r.name }))
}

export const getAuthor = async (id: string) => {
  const results = await db.select().from(authorTable).where(eq(authorTable.id, id))
  if (results.length === 0) return null
  return authorRowToObject(results[0])
}

export const createAuthor = async (name: string) => {
  const id = crypto.randomUUID()
  const result = await db.insert(authorTable).values({ id: id, name: name }).returning()
  return { id: result[0].id, name: result[0].name }
}

export const getAuthorDocuments = async (authorId: string) => {
  const results = await db
    .select({ documentId: documentAuthorsTable.documentId })
    .from(documentAuthorsTable)
    .innerJoin(documentTable, eq(documentAuthorsTable.documentId, documentTable.id))
    .where(eq(documentAuthorsTable.authorId, authorId))

  return results.map(r => r.documentId)
}

export const linkDocumentToAuthor = async (documentId: string, authorId: string) => {
  const id = crypto.randomUUID()
  await db.insert(documentAuthorsTable).values({ id, documentId, authorId }).onConflictDoNothing()
}

export const getDocumentAuthors = async (documentId: string) => {
  const results = await db
    .select({ id: authorTable.id, name: authorTable.name })
    .from(documentAuthorsTable)
    .innerJoin(authorTable, eq(documentAuthorsTable.authorId, authorTable.id))
    .where(eq(documentAuthorsTable.documentId, documentId))

  return results
}

const authorRowToObject = (row: typeof authorTable.$inferSelect) => {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

const authorObjectToRow = (author: {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}) => {
  return {
    id: author.id,
    name: author.name,
    createdAt: author.createdAt,
    updatedAt: author.updatedAt
  }
}
