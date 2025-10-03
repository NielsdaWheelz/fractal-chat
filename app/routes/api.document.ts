import { requireUser } from "~/utils/auth.server";
import type { Route } from "../+types/root";
import { semanticSearch } from "../index.server";
import { generateEmbeddings } from "./document-create";

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  const { query, topK = 5 }: { query: string, topK?: number } = await request.json();

  return embedAndSearch(userId, query, topK)
}

export const embedAndSearch = async (userId: string, query: string, topK: number) => {
  const queryEmbeddings = await generateEmbeddings([query]);
  const queryEmbedding = queryEmbeddings[0];

  const matches = await semanticSearch(userId, queryEmbedding, topK);

  return {
    success: true,
    results: matches,
    count: matches.length,
  };
}
