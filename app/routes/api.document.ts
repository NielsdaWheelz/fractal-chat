import { requireUser } from "~/utils/auth.server";
import type { Route } from "../+types/root";
import { embedAndSearch } from "~/utils/document.server";

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  const { query, topK = 5 }: { query: string, topK?: number } = await request.json();

  return embedAndSearch(userId, query, topK)
}
