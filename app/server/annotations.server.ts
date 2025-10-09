import { db } from "~/server/index.server";
import { getUserGroupIds, getVisibleCommentIds, requirePermission } from "./permissions.server.helper";
import { annotation, comment, groupDocumentTable, groupMemberTable } from "~/db/schema";
import { eq, inArray } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "./errors.server";
import type { Annotation, AnnotationCreate, AnnotationRow, AnnotationWithComments } from "~/types/types";

export async function getAnnotation(
  userId: string,
  annotationId: string
): Promise<AnnotationWithComments> {
  const access = await checkPermission(userId, "annotation", annotationId);
  if (access === "none") {
    throw new ForbiddenError("No access to this annotation");
  }

  const anno = await db
    .select()
    .from(annotation)
    .where(eq(annotation.id, annotationId))
    .limit(1);

  if (anno.length === 0) {
    throw new NotFoundError("Annotation", annotationId);
  }

  const visibleCommentIds = await getVisibleCommentIds(userId, annotationId);
  const comments =
    visibleCommentIds.length > 0
      ? await db.select().from(comment).where(inArray(comment.id, visibleCommentIds))
      : [];

  return {
    ...anno[0],
    comments,
  };
}

export const saveAnnotations = async (annotationToSave: AnnotationCreate) => {
  const dbAnnotation = annotationObjectToRow(annotationToSave)
  return await db.insert(annotation).values(dbAnnotation).onConflictDoUpdate({ target: annotation.id, set: dbAnnotation })
}

export const deleteAnnotations = async (id: string) => {
  return await db.delete(annotation).where(eq(annotation.id, id));
}

// all annos for a doc
export const getAnnotations = async (userId: string, documentId: string) => {
  await requirePermission(userId, "document", documentId, "read");

  const userGroupIds = await getUserGroupIds(userId);

  const documentGroups = await db
    .select({ groupId: groupDocumentTable.groupId })
    .from(groupDocumentTable)
    .where(eq(groupDocumentTable.documentId, documentId));

  const documentGroupIds = documentGroups.map((g) => g.groupId);

  // intersection of user & doc gorups
  const sharedGroupIds = userGroupIds.filter((id) =>
    documentGroupIds.includes(id)
  );

  // all members of user's groups
  const groupMemberUserIds =
    sharedGroupIds.length > 0
      ? await db
        .select({ userId: groupMemberTable.userId })
        .from(groupMemberTable)
        .where(inArray(groupMemberTable.groupId, sharedGroupIds))
      : [];

  const memberIds = [
    ...new Set(groupMemberUserIds.map((m) => m.userId)),
    userId,
  ];

  const annotations = await db
    .select()
    .from(annotation)
    .where(eq(annotation.documentId, documentId));

  const accessibleAnnotations = annotations.filter((anno) => {
    // creator's annos
    if (anno.userId === userId) return true;

    if (anno.visibility === "private") return false

    // group member annos
    if (memberIds.includes(anno.userId)) return true

    // public annos
    if (anno.visibility === "public") return true

    // check if user has explicit permission?
    return false;
  });

  return accessibleAnnotations.map((a) => annotationRowToObject(a));
}


const annotationObjectToRow = (annotation: AnnotationCreate) => {
  return {
    id: annotation.id,
    userId: annotation.userId,
    documentId: annotation.documentId,
    body: annotation.body,
    start: annotation.start,
    end: annotation.end,
    quote: annotation.quote,
    prefix: annotation.prefix,
    suffix: annotation.suffix,
    visibility: annotation.visibility,
    createdAt: annotation.createdAt,
    updatedAt: annotation.updatedAt
  }
}

const annotationRowToObject = (row: AnnotationRow): Annotation => {
  return {
    id: row.id,
    userId: row.userId,
    documentId: row.documentId,
    body: row.body,
    start: row.start,
    end: row.end,
    quote: row.quote,
    prefix: row.prefix,
    suffix: row.suffix,
    visibility: row.visibility,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

// NEW
export async function createAnnotation(
  userId: string,
  annotData: {
    id: string;
    documentId: string;
    body?: string | null;
    visibility?: "public" | "private";
    start: number;
    end: number;
    quote?: string | null;
    prefix?: string | null;
    suffix?: string | null;
  }
): Promise<AnnotationWithComments> {
  // Verify document exists
  const doc = await db
    .select()
    .from(documentTable)
    .where(eq(documentTable.id, annotData.documentId))
    .limit(1);

  if (doc.length === 0) {
    throw new NotFoundError("Document", annotData.documentId);
  }

  const result = await db
    .insert(annotation)
    .values({
      ...annotData,
      userId,
      visibility: annotData.visibility || "private",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return {
    ...result[0],
    comments: [],
  };
}

export async function updateAnnotation(
  userId: string,
  annotationId: string,
  updates: {
    body?: string | null;
    visibility?: "public" | "private";
  }
): Promise<AnnotationWithComments> {
  await requirePermission(userId, "annotation", annotationId, "write");

  const result = await db
    .update(annotation)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(annotation.id, annotationId))
    .returning();

  if (result.length === 0) {
    throw new NotFoundError("Annotation", annotationId);
  }

  const visibleCommentIds = await getVisibleCommentIds(userId, annotationId);
  const comments =
    visibleCommentIds.length > 0
      ? await db.select().from(comment).where(inArray(comment.id, visibleCommentIds))
      : [];

  return {
    ...result[0],
    comments,
  };
}

export async function deleteAnnotation(userId: string, annotationId: string): Promise<boolean> {
  await requirePermission(userId, "annotation", annotationId, "write");

  await db.delete(annotation).where(eq(annotation.id, annotationId));
  return true;
}