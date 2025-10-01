import { drizzle } from 'drizzle-orm/postgres-js'
// import { chatsTable } from './db/schema';
import postgres from 'postgres'
import { and, eq } from 'drizzle-orm';
import { chatTable } from '~/db/schema'

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

async function main() {
  db
}

export async function listChats(userId: string): Promise<string[]> {
  const results = await db.select({ id: chatTable.id })
    .from(chatTable)
    .where(eq(chatTable.userId, userId))
  return results.map(row => row.id)
}

export async function getChat(id: string, userId: string): Promise<(Chat | null)> {
  const results = await db.select()
    .from(chatTable)
    .where(
      and(
        eq(chatTable.id, id),
        eq(chatTable.userId, userId)
      )
    )

  if (results.length == 0) {
    return null
  } else {
    return toChat(results[0])
  }
}

export async function saveChat(chat: Chat): Promise<any> {
  const dbChat = toDbChat(chat)
  return await db.insert(chatTable)
    .values(dbChat)
    .onConflictDoUpdate(
      { target: chatTable.id, set: dbChat }
    )
}

function toChat(row: DbChat): Chat {
  return {
    id: row.id,
    userId: row.userId,
    messages: JSON.parse(row.messages) as UIMessage[]
  }
}

function toDbChat(chat: Chat): DbChat {
  return {
    id: chat.id,
    userId: chat.userId,
    messages: JSON.stringify(chat.messages)
  }
}

main();