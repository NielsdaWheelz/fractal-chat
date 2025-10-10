import { eq, inArray, and } from "drizzle-orm";
import { annotation, comment, groupDocumentTable, groupMemberTable } from "~/db/schema";
import { db } from "~/server/index.server";
import type { Annotation, AnnotationCreate, AnnotationRow, AnnotationWithComments, Comment } from "~/types/types";
import { NotFoundError } from "./errors.server";
import { getUserGroupIds, requirePermission } from "./permissions.server.helper";
import { rowToComment } from "./comments.server";

export const getAnnotation = async (userId: string, annotationId: string) => {
  await requirePermission(userId, "annotation", annotationId, "read");

  const annotationRow = await db
    .select()
    .from(annotation)
    .where(eq(annotation.id, annotationId));

  if (annotationRow.length === 0) {
    throw new NotFoundError("Annotation", annotationId);
  }

  return annotationRowToObject(annotationRow[0]);
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
  const allAnnotations = await db
    .select()
    .from(annotation)
    .where(eq(annotation.documentId, documentId))
  
  if (allAnnotations.length === 0) {
    return {
      annotations: []
    }
  }
  
  const annotationIds = allAnnotations.map(a => a.id)
  const allComments = await db
    .select()
    .from(comment)
    .where(inArray(comment.annotationId, annotationIds))
  
  const userGroupIds = await getUserGroupIds(userId)
  
  const documentGroups = userGroupIds.length > 0 
    ? await db
        .select({ groupId: groupDocumentTable.groupId })
        .from(groupDocumentTable)
        .where(
          and(
            eq(groupDocumentTable.documentId, documentId),
            inArray(groupDocumentTable.groupId, userGroupIds)
          )
        )
    : []
  
  const documentInUserGroups = documentGroups.length > 0
  
  const allCreatorIds = new Set<string>()
  allAnnotations.forEach(a => allCreatorIds.add(a.userId))
  allComments.forEach(c => allCreatorIds.add(c.userId))
  allCreatorIds.delete(userId)
  
  const creatorsWhoShareGroups = new Set<string>()
  
  if (allCreatorIds.size > 0 && userGroupIds.length > 0) {
    const sharedGroupMembers = await db
      .select({ userId: groupMemberTable.userId })
      .from(groupMemberTable)
      .where(
        and(
          inArray(groupMemberTable.groupId, userGroupIds),
          inArray(groupMemberTable.userId, Array.from(allCreatorIds))
        )
      )
    
    sharedGroupMembers.forEach(m => creatorsWhoShareGroups.add(m.userId))
  }
  
  const hasPermission = (
    resourceType: 'annotation' | 'comment',
    creatorId: string,
    visibility: string | null
  ): boolean => {
    if (creatorId === userId) return true
    
    if (visibility === 'private') return false
    
    if (visibility === 'public') return true
    
    if (documentInUserGroups && creatorsWhoShareGroups.has(creatorId)) {
      return true
    }
    
    return false
  }
  
  const visibleAnnotations: AnnotationWithComments[] = []
  
  for (const anno of allAnnotations) {
    if (hasPermission('annotation', anno.userId, anno.visibility)) {
      const annoComments = allComments.filter(c => c.annotationId === anno.id)
      
      const visibleComments: Comment[] = annoComments
        .filter(comm => hasPermission('comment', comm.userId, comm.visibility))
        .map(comm => rowToComment(comm))
      
      visibleAnnotations.push({
        ...rowToAnnotation(anno),
        comments: visibleComments
      })
    }
  }
  
  return { annotations: visibleAnnotations }
}

export const rowToAnnotation = (row: AnnotationRow): Annotation => {
  return {
    id: row.id,
    userId: row.userId,
    documentId: row.documentId,
    body: row.body,
    color: row.color,
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

const annotationObjectToRow = (annotation: AnnotationCreate) => {
  return {
    id: annotation.id,
    userId: annotation.userId,
    documentId: annotation.documentId,
    body: annotation.body,
    start: annotation.start,
    color: annotation.color,
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
    color: row.color,
    end: row.end,
    quote: row.quote,
    prefix: row.prefix,
    suffix: row.suffix,
    visibility: row.visibility,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}
