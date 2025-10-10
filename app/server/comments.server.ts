import { db } from "~/server/index.server";
import { requirePermission } from "./permissions.server.helper";
import { comment } from "~/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "./errors.server";
import type { Comment, CommentCreate, CommentRow } from "~/types/types";

export const getComment = async (userId: string, commentId: string): Promise<Comment> => {
  await requirePermission(userId, "comment", commentId, "read");

  const commentRow = await db
    .select()
    .from(comment)
    .where(eq(comment.id, commentId));

  if (commentRow.length === 0) {
    throw new NotFoundError("Comment", commentId);
  }

  return commentRowToObject(commentRow[0]);
}


const commentObjectToRow = (commentData: CommentCreate) => {
  return {
    id: commentData.id,
    body: commentData.body,
    userId: commentData.userId,
    annotationId: commentData.annotationId,
    createdAt: commentData.createdAt,
    updatedAt: commentData.updatedAt
  }
}

const commentRowToObject = (row: CommentRow): Comment => {
  return {
    id: row.id,
    body: row.body,
    userId: row.userId,
    annotationId: row.annotationId,
    visibility: row.visibility,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

export const rowToComment = (row: CommentRow): Comment => {
  return {
    id: row.id,
    body: row.body,
    userId: row.userId,
    annotationId: row.annotationId,
    visibility: row.visibility,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}