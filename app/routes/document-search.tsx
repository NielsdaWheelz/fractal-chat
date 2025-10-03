import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { embedAndSearch } from "~/utils/document.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUser(request)
  const topK = 5
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";

  const result = await embedAndSearch(userId, query, topK);

  return result.results
}
