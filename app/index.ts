import { drizzle } from 'drizzle-orm/postgres-js'
// import { chatsTable } from './db/schema';
import postgres from 'postgres'
import { and, eq } from 'drizzle-orm';
import { chatTable, documentTable } from '~/db/schema'

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

export const getChats = async (userId: string) => {
  const results = await db.select().from(chatTable).where(eq(chatTable.userId, userId))
  return results
}

export const saveDocument = async (document) => {
  const dbDocument = documentObjectToRow(document)
  return await db.insert(documentTable).values(dbDocument).onConflictDoUpdate({ target: documentTable.id, set: dbDocument })
}

const documentRowToObject = (row) => {
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

const documentObjectToRow = (document) => {
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

export const getChat = async (id: string, userId: string) => {
  const results = await db.select().from(chatTable).where(and(eq(chatTable.id, id), eq(chatTable.userId, userId)))
  if (results.length == 0) {
    return null
  } else {
    return chatRowToObject(results[0])
  }
}

export const saveChat = async (chat) => {
  const dbChat = chatObjectToRow(chat)
  return await db.insert(chatTable).values(dbChat).onConflictDoUpdate({ target: chatTable.id, set: dbChat })
}

const chatRowToObject = (row) => {
  return {
    id: row.id,
    userId: row.userId,
    messages: JSON.parse(row.messages)
  }
}

const chatObjectToRow = (chat) => {
  return {
    id: chat.id,
    userId: chat.userId,
    messages: JSON.stringify(chat.messages)
  }
}

main();