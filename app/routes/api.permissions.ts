import { requireUser } from "~/utils/auth.server";
import type { Route } from "../+types/root";
import { createPermission, deletePermission, getPermissionsforResource, getPermissionsForPrincipal , checkPermission, makePrivate } from "~/index.server";

// search authors and documents for @ meÍntions
// get /api/mentions
export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUser(request);

  const url = new URL(request.url);
  const action = url.searchParams.get("action")

  if (action === "checkPermission") {
    const resourceType = url.searchParams.get("resourceType")
    const resourceId = url.searchParams.get("resourceId")

    const perms = await checkPermission(userId, resourceType, resourceId)
    return perms
  }
}

