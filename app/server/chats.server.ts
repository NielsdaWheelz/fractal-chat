import { and, eq } from "drizzle-orm"
import { chatTable } from "~/db/schema"
import { db } from "~/server/index.server"
import type { Chat, ChatCreate, ChatRow } from "~/types/types"

export const getChats = async (userId: string, documentId: string): Promise<ChatRow[]> => {
  const results = await db.select().from(chatTable).where(and(eq(chatTable.userId, userId), eq(chatTable.documentId, documentId)))
  return results
}

export const getChat = async (id: string, userId: string, documentId: string): Promise<Chat | null> => {
  const results = await db.select().from(chatTable).where(and(eq(chatTable.id, id), eq(chatTable.userId, userId), eq(chatTable.documentId, documentId)))
  if (results.length == 0) {
    return null
  } else {
    return chatRowToObject(results[0])
  }
}

export const saveChat = async (chat: ChatCreate) => {
  const dbChat = chatObjectToRow(chat)
  return await db.insert(chatTable).values(dbChat).onConflictDoUpdate({ target: chatTable.id, set: dbChat })
}

const chatRowToObject = (row: ChatRow): Chat => {
  return {
    id: row.id,
    userId: row.userId,
    documentId: row.documentId,
    messages: JSON.parse(row.messages),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

const chatObjectToRow = (chat: ChatCreate) => {
  return {
    id: chat.id,
    userId: chat.userId,
    documentId: chat.documentId,
    messages: JSON.stringify(chat.messages),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt
  }
}
