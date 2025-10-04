import { requireUser } from "~/utils/auth.server";
import type { Route } from "../+types/root";
import { getAuthors, searchDocumentsForMention } from "~/index.server";

// search authors and documents for @ meÍntions
// get /api/mentions
export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUser(request);

  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('q') || '';

  const authors = getAuthors(userId, searchTerm)
  const documents = searchDocumentsForMention(userId, searchTerm)

  return Response.json({
    authors,
    documents
  });
}

