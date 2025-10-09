import { db } from "~/server/index.server";
import { requirePermission } from "./permissions.server.helper";
import { comment } from "~/db/schema";
import { eq } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "./errors.server";
import type { Comment, CommentCreate, CommentRow } from "~/types/types";

export async function getComment(userId: string, commentId: string): Promise<CommentData> {
  const access = await checkPermission(userId, "comment", commentId);
  if (access === "none") {
    throw new ForbiddenError("No access to this comment");
  }

  const comm = await db
    .select()
    .from(comment)
    .where(eq(comment.id, commentId))
    .limit(1);

  if (comm.length === 0) {
    throw new NotFoundError("Comment", commentId);
  }

  return commentRowToObject(comm[0]);
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

export async function createComment(
  userId: string,
  commentData: {
    id: string;
    annotationId: string;
    body?: string | null;
    visibility?: "public" | "private";
  }
): Promise<CommentData> {
  // Verify annotation exists and user can see it
  const access = await checkPermission(userId, "annotation", commentData.annotationId);
  if (access === "none") {
    throw new ForbiddenError("Cannot comment on annotation you cannot see");
  }

  const result = await db
    .insert(comment)
    .values({
      ...commentData,
      userId,
      visibility: commentData.visibility || "private",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}

export async function updateComment(
  userId: string,
  commentId: string,
  updates: {
    body?: string | null;
    visibility?: "public" | "private";
  }
): Promise<CommentData> {
  await requirePermission(userId, "comment", commentId, "write");

  const result = await db
    .update(comment)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(comment.id, commentId))
    .returning();

  if (result.length === 0) {
    throw new NotFoundError("Comment", commentId);
  }

  return result[0];
}

export async function deleteComment(userId: string, commentId: string): Promise<boolean> {
  await requirePermission(userId, "comment", commentId, "write");

  await db.delete(comment).where(eq(comment.id, commentId));
  return true;
}
