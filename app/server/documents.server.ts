import { 
  annotation, 
  comment, 
  documentChunksTable, 
  documentTable, 
  permissionTable,
  groupDocumentTable,
  groupMemberTable
} from "~/db/schema"
import { db } from "~/server/index.server"
import { getGroups } from "./groups.server"
import { and, eq, inArray, or } from "drizzle-orm"
import type { 
  Document, 
  DocumentCreate, 
  DocumentChunk, 
  DocumentRow,
  DocumentWithDetails,
  AnnotationWithComments,
  Annotation,
  Comment,
  AnnotationRow,
  CommentRow
} from "~/types/types"
import { getUserGroupIds } from "./permissions.server.helper"

export const getAllDocuments = async (): Promise<DocumentRow[]> => {
  const results = await db.select().from(documentTable)
  return results
}

export const getDocuments = async () => {
  const results = await db.select().from(documentTable)
  return results
}

/**
 * Get a document with all annotations and comments that the user has permission to view.
 * 
 * OPTIMIZED VERSION: Batches all data fetching and permission checks to minimize DB queries.
 * 
 * Performance: O(1) database queries instead of O(N+M) where N=annotations, M=comments
 * - Original: ~2000+ queries for 50 annotations + 200 comments
 * - Optimized: ~6 queries total
 * 
 * Permission Logic:
 * - Documents are always readable by anyone
 * - Annotations are filtered based on user permissions (creator, visibility, group sharing)
 * - Comments inherit annotation visibility (hidden if parent annotation is not visible)
 * 
 * @param userId - The ID of the user requesting the document
 * @param documentId - The ID of the document to retrieve
 * @returns Document with nested annotations and comments, or null if not found
 */
export const getDocument = async (
  userId: string, 
  documentId: string
): Promise<DocumentWithDetails | null> => {
  // 1. Fetch the document (always readable)
  const documentResult = await db
    .select()
    .from(documentTable)
    .where(eq(documentTable.id, documentId))
  
  if (documentResult.length === 0) return null
  
  const doc = documentResult[0]
  
  // 2. Fetch all annotations for this document
  const allAnnotations = await db
    .select()
    .from(annotation)
    .where(eq(annotation.documentId, documentId))
  
  // 3. If no annotations, return document without annotations
  if (allAnnotations.length === 0) {
    return {
      ...rowToDocument(doc),
      annotations: []
    }
  }
  
  // 4. Fetch all comments for these annotations
  const annotationIds = allAnnotations.map(a => a.id)
  const allComments = await db
    .select()
    .from(comment)
    .where(inArray(comment.annotationId, annotationIds))
  
  // 5. OPTIMIZATION: Fetch user groups once (instead of per-permission-check)
  const userGroupIds = await getUserGroupIds(userId)
  
  // 6. OPTIMIZATION: Check which groups contain this document (one query)
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
  
  // 7. Build a set of creator IDs from annotations/comments to check group sharing
  const allCreatorIds = new Set<string>()
  allAnnotations.forEach(a => allCreatorIds.add(a.userId))
  allComments.forEach(c => allCreatorIds.add(c.userId))
  allCreatorIds.delete(userId) // Remove self, we already know we share groups with ourselves
  
  // 8. OPTIMIZATION: Batch check which creators share groups with user
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
  
  // 9. Helper: Check permission in-memory (no DB calls)
  const hasPermission = (
    resourceType: 'annotation' | 'comment',
    creatorId: string,
    visibility: string | null
  ): boolean => {
    // Rule 1: Creator always has access
    if (creatorId === userId) return true
    
    // Rule 2: Private resources only visible to creator
    if (visibility === 'private') return false
    
    // Rule 3: Public resources are readable by everyone
    if (visibility === 'public') return true
    
    // Rule 4: Shared group visibility
    // Users must share a group AND document must be in a shared group
    if (documentInUserGroups && creatorsWhoShareGroups.has(creatorId)) {
      return true
    }
    
    return false
  }
  
  // 10. Filter annotations by permissions (in-memory, no DB calls)
  const visibleAnnotations: AnnotationWithComments[] = []
  
  for (const anno of allAnnotations) {
    if (hasPermission('annotation', anno.userId, anno.visibility)) {
      // Get comments for this annotation
      const annoComments = allComments.filter(c => c.annotationId === anno.id)
      
      // Filter comments by permissions (in-memory)
      const visibleComments: Comment[] = annoComments
        .filter(comm => hasPermission('comment', comm.userId, comm.visibility))
        .map(comm => rowToComment(comm))
      
      // Add annotation with its visible comments
      visibleAnnotations.push({
        ...rowToAnnotation(anno),
        comments: visibleComments
      })
    }
  }
  
  // 11. Return document with filtered annotations and comments
  return {
    ...rowToDocument(doc),
    annotations: visibleAnnotations
  }
}

export const saveDocument = async (document: DocumentCreate) => {
  const dbDocument = documentObjectToRow(document)
  return await db.insert(documentTable).values(dbDocument).onConflictDoUpdate({ target: documentTable.id, set: dbDocument })
}

export const saveDocumentChunks = async (chunks: DocumentChunk[]) => {
  if (chunks.length === 0) return

  const dbChunks = chunks.map(chunk => ({
    id: chunk.id,
    documentId: chunk.documentId,
    text: chunk.text,
    chunkIndex: chunk.chunkIndex,
    embedding: chunk.embedding
  }))

  return await db.insert(documentChunksTable).values(dbChunks)
}


/**
 * Convert database row to Document type
 */
const rowToDocument = (row: DocumentRow): Document => {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    content: row.content,
    textContent: row.textContent,
    publishedTime: row.publishedTime,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

/**
 * Convert database row to Annotation type
 */
const rowToAnnotation = (row: AnnotationRow): Annotation => {
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

/**
 * Convert database row to Comment type
 */
const rowToComment = (row: CommentRow): Comment => {
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

/**
 * Convert Document to database row format (legacy, kept for compatibility)
 */
const documentRowToObject = (row: DocumentRow): Document => {
  return rowToDocument(row)
}

/**
 * Convert DocumentCreate to database row format
 */
const documentObjectToRow = (doc: DocumentCreate) => {
  return {
    id: doc.id,
    url: doc.url,
    title: doc.title,
    content: doc.content,
    textContent: doc.textContent,
    publishedTime: doc.publishedTime,
    visibility: doc.visibility,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }
}
