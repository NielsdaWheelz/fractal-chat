import { and, eq } from "drizzle-orm"
import { chatTable } from "~/db/schema"
import { db } from "~/server/index.server"

export const getChats = async (userId: string, documentId: string) => {
  const results = await db.select().from(chatTable).where(and(eq(chatTable.userId, userId), eq(chatTable.documentId, documentId)))
  return results
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
  id: string
  userId: string
  documentId: string
  messages: any[]
  createdAt: Date
  updatedAt: Date
}) => {
  const dbChat = chatObjectToRow(chat)
  return await db.insert(chatTable).values(dbChat).onConflictDoUpdate({ target: chatTable.id, set: dbChat })
}

const chatRowToObject = (row: typeof chatTable.$inferSelect) => {
  return {
    id: row.id,
    userId: row.userId,
    documentId: row.documentId,
    messages: JSON.parse(row.messages),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

const chatObjectToRow = (chat: {
  id: string
  userId: string
  documentId: string
  messages: any[]
  createdAt: Date
  updatedAt: Date
}) => {
  return {
    id: chat.id,
    userId: chat.userId,
    documentId: chat.documentId,
    messages: JSON.stringify(chat.messages),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt
  }
}
