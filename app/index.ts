import { drizzle } from 'drizzle-orm/postgres-js'
// import { chatsTable } from './db/schema';
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

async function main() {
  db
}

main();