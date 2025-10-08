import { requireUser } from "~/server/auth.server";
import type { Route } from "../+types/root";

// search authors and documents for @ mentions
// get /api/mentions
export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUser(request);

  const url = new URL(request.url);
  const action = url.searchParams.get("action")

  if (action === "checkPermission") {
    const resourceType = url.searchParams.get("resourceType")
    const resourceId = url.searchParams.get("resourceId")

    const perm = await checkPermission(userId, resourceType, resourceId)
    return perm
  }
}

