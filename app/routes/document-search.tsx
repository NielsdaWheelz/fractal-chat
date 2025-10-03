import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { generateEmbeddings } from "./document-create";
import { semanticSearch } from "../server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUser(request)
  const topK = 5
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";

  const queryEmbeddings = await generateEmbeddings([query]);
  const queryEmbedding = queryEmbeddings[0];

  const matches = await semanticSearch(userId, queryEmbedding, topK);

  // return Response.json({
  //   success: true,
  //   results: matches,
  //   count: matches.length,
  // });

  return matches
}
