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
import { rowToAnnotation } from "./annotations.server"
import { rowToComment } from "./comments.server"

export const getAllDocuments = async (): Promise<DocumentRow[]> => {
  const results = await db.select().from(documentTable)
  return results
}

export const getDocuments = async () => {
  const results = await db.select().from(documentTable)
  return results
}

export const getDocument = async (
  userId: string, 
  documentId: string
): Promise<DocumentWithDetails | null> => {
  const documentResult = await db
    .select()
    .from(documentTable)
    .where(eq(documentTable.id, documentId))
  
  if (documentResult.length === 0) return null
  
  const doc = documentResult[0]
  
  const allAnnotations = await db
    .select()
    .from(annotation)
    .where(eq(annotation.documentId, documentId))
  
  if (allAnnotations.length === 0) {
    return {
      ...rowToDocument(doc),
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
