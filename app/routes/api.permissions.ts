import type { Route } from "../+types/root";
import { requireUser } from "~/server/auth.server";
import {
  createPermission,
  deletePermission,
  getPermissionsforResource,
  getPermissionsForPrincipal,
  makePrivate,
} from "~/server/permissions.server";
import { computeAccessLevel } from "~/server/permissions.server.helper";
import { BadRequestError, ForbiddenError, NotFoundError } from "~/server/errors.server";
import type { ApiError, ApiSuccess, PermissionLevel, PrincipalType, ResourceType } from "~/types/types";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await requireUser(request);
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "check") {
      const resourceType = url.searchParams.get("resourceType") as ResourceType;
      const resourceId = url.searchParams.get("resourceId");

      if (!resourceType || !resourceId) {
        return Response.json(
          {
            success: false,
            error: "Bad Request",
            message: "resourceType and resourceId are required",
            code: "MISSING_PARAMS",
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      const permissionLevel = await computeAccessLevel(userId, resourceType, resourceId);
      return Response.json(
        { success: true, data: { permissionLevel } }
      );
    }

    return Response.json(
      {
        success: false,
        error: "Bad Request",
        message: `Unknown action: ${action}`,
        code: "UNKNOWN_ACTION",
        statusCode: 400,
      },
      { status: 400 }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const userId = await requireUser(request);
    const method = request.method;

    if (method === "POST") {
      const body = await request.json();
      const { resourceType, resourceId, principalType, principalId, permissionLevel } = body;

      if (!resourceType || !resourceId || !principalType || !principalId) {
        return Response.json(
          {
            success: false,
            error: "Bad Request",
            message: "resourceType, resourceId, principalType, and principalId are required",
            code: "MISSING_PARAMS",
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      const result = await createPermission(
        userId,
        resourceType as ResourceType,
        resourceId,
        principalType as PrincipalType,
        principalId,
        permissionLevel || "read"
      );

      return Response.json(
        { success: true, data: result },
        { status: 201 }
      );
    }

    if (method === "DELETE") {
      const body = await request.json();
      const { resourceType, resourceId, principalType, principalId } = body;

      if (!resourceType || !resourceId || !principalType || !principalId) {
        return Response.json(
          {
            success: false,
            error: "Bad Request",
            message: "resourceType, resourceId, principalType, and principalId are required",
            code: "MISSING_PARAMS",
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      const result = await deletePermission(
        userId,
        resourceType as ResourceType,
        resourceId,
        principalType as PrincipalType,
        principalId
      );

      return Response.json({ success: true, data: result });
    }

    if (method === "PATCH") {
      const body = await request.json();
      const { resourceType, resourceId } = body;

      if (!resourceType || !resourceId) {
        return Response.json(
          {
            success: false,
            error: "Bad Request",
            message: "resourceType and resourceId are required",
            code: "MISSING_PARAMS",
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      const result = await makePrivate(userId, resourceType as ResourceType, resourceId);
      return Response.json({ success: true, data: result });
    }

    return Response.json(
      {
        success: false,
        error: "Method Not Allowed",
        message: `Method ${method} not allowed`,
        code: "METHOD_NOT_ALLOWED",
        statusCode: 405,
      },
      { status: 405 }
    );
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof BadRequestError) {
    return Response.json(
      {
        success: false,
        error: "Bad Request",
        message: error.message,
        code: "BAD_REQUEST",
        statusCode: 400,
      },
      { status: 400 }
    );
  }

  if (error instanceof ForbiddenError) {
    return Response.json(
      {
        success: false,
        error: "Forbidden",
        message: error.message,
        code: "FORBIDDEN",
        statusCode: 403,
      },
      { status: 403 }
    );
  }

  if (error instanceof NotFoundError) {
    return Response.json(
      {
        success: false,
        error: "Not Found",
        message: error.message,
        code: "NOT_FOUND",
        statusCode: 404,
      },
      { status: 404 }
    );
  }

  console.error("Unexpected error in permissions API:", error);
  return Response.json(
    {
      success: false,
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    },
    { status: 500 }
  );
}