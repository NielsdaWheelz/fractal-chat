import type { Route } from "../+types/root";
import { requireUser } from "~/server/auth.server";
import {
  saveGroup,
  getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  getGroupMembers,
  addDocumentToGroup,
  removeDocumentFromGroup,
  listGroupDocuments,
} from "~/server/groups.server";
import { getAllUsers } from "~/server/users.server";
import { getAllDocuments } from "~/server/documents.server";
import { BadRequestError, ForbiddenError, NotFoundError } from "~/server/errors.server";
import type { ApiError, ApiSuccess, GroupCreate } from "~/types/types";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await requireUser(request);
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "get") {
      const groupId = url.searchParams.get("id");

      if (!groupId) {
        return Response.json(
          {
            success: false,
            error: "Bad Request",
            message: "Group id is required",
            code: "MISSING_PARAMS",
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      const group = await getGroup(userId, groupId);
      return Response.json({ success: true, data: group });
    }

    if (action === "list") {
      const groups = await getGroups(userId);
      return Response.json({ success: true, data: groups });
    }

    if (action === "members") {
      const groupId = url.searchParams.get("id");

      if (!groupId) {
        return Response.json(
          {
            success: false,
            error: "Bad Request",
            message: "Group id is required",
            code: "MISSING_PARAMS",
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      const members = await getGroupMembers(userId, groupId);
      return Response.json({ success: true, data: members });
    }

    if (action === "documents") {
      const groupId = url.searchParams.get("id");

      if (!groupId) {
        return Response.json(
          {
            success: false,
            error: "Bad Request",
            message: "Group id is required",
            code: "MISSING_PARAMS",
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      const documents = await listGroupDocuments(userId, groupId);
      return Response.json({ success: true, data: documents });
    }

    if (action === "allUsers") {
      const users = await getAllUsers();
      return Response.json({ success: true, data: users });
    }

    if (action === "allDocuments") {
      const documents = await getAllDocuments();
      const formattedDocuments = documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        url: doc.url,
        publishedTime: doc.publishedTime,
        createdAt: doc.createdAt,
      }));
      return Response.json({ success: true, data: formattedDocuments });
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
      const { action } = body;

      if (action === "create") {
        const { id, name } = body;

        if (!id || !name) {
          return Response.json(
            {
              success: false,
              error: "Bad Request",
              message: "id and name are required",
              code: "MISSING_PARAMS",
              statusCode: 400,
            },
            { status: 400 }
          );
        }

        const groupData: GroupCreate = {
          id,
          name,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const group = await saveGroup(groupData);
        return Response.json(
          { success: true, data: group },
          { status: 201 }
        );
      }

      if (action === "addMember") {
        const { groupId, userId: newUserId } = body;

        if (!groupId || !newUserId) {
          return Response.json(
            {
              success: false,
              error: "Bad Request",
              message: "groupId and userId are required",
              code: "MISSING_PARAMS",
              statusCode: 400,
            },
            { status: 400 }
          );
        }

        const result = await addGroupMember(userId, groupId, newUserId);
        return Response.json(
          { success: true, data: result },
          { status: 201 }
        );
      }

      if (action === "addDocument") {
        const { groupId, documentId } = body;

        if (!groupId || !documentId) {
          return Response.json(
            {
              success: false,
              error: "Bad Request",
              message: "groupId and documentId are required",
              code: "MISSING_PARAMS",
              statusCode: 400,
            },
            { status: 400 }
          );
        }

        const result = await addDocumentToGroup(userId, groupId, documentId);
        return Response.json(
          { success: true, data: result },
          { status: 201 }
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
    }

    if (method === "PATCH") {
      const body = await request.json();
      const { groupId, name } = body;

      if (!groupId) {
        return Response.json(
          {
            success: false,
            error: "Bad Request",
            message: "groupId is required",
            code: "MISSING_PARAMS",
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      const updates: { name?: string } = {};
      if (name !== undefined) updates.name = name;

      const group = await updateGroup(userId, groupId, updates);
      return Response.json({ success: true, data: group });
    }

    if (method === "DELETE") {
      const body = await request.json();
      const { action } = body;

      if (action === "delete") {
        const { groupId } = body;

        if (!groupId) {
          return Response.json(
            {
              success: false,
              error: "Bad Request",
              message: "groupId is required",
              code: "MISSING_PARAMS",
              statusCode: 400,
            },
            { status: 400 }
          );
        }

        const result = await deleteGroup(userId, groupId);
        return Response.json({ success: true, data: { deleted: result } });
      }

      if (action === "removeMember") {
        const { groupId, userId: memberUserId } = body;

        if (!groupId || !memberUserId) {
          return Response.json(
            {
              success: false,
              error: "Bad Request",
              message: "groupId and userId are required",
              code: "MISSING_PARAMS",
              statusCode: 400,
            },
            { status: 400 }
          );
        }

        const result = await removeGroupMember(userId, groupId, memberUserId);
        return Response.json({ success: true, data: { removed: result } });
      }

      if (action === "removeDocument") {
        const { groupId, documentId } = body;

        if (!groupId || !documentId) {
          return Response.json(
            {
              success: false,
              error: "Bad Request",
              message: "groupId and documentId are required",
              code: "MISSING_PARAMS",
              statusCode: 400,
            },
            { status: 400 }
          );
        }

        const result = await removeDocumentFromGroup(userId, groupId, documentId);
        return Response.json({ success: true, data: result });
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

  console.error("Unexpected error in groups API:", error);
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
