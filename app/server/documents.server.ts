import { annotation, comment, documentChunksTable, documentTable, permissionTable } from "~/db/schema"
import { db } from "~/server/index.server"
import { getGroups } from "./groups.server"
import { and, eq, inArray, or } from "drizzle-orm"
import type { Document, DocumentCreate, DocumentChunk, DocumentRow } from "~/types/types"

export const getAllDocuments = async (): Promise<DocumentRow[]> => {
  const results = await db.select().from(documentTable)
  return results
}

export const getDocuments = async (userId: string, documentIds?: string[]) => {
  // const documents = documentIds && documentIds.length > 0 ?
  //   await db
  //     .select()
  //     .from(documentTable)
  //     .where(inArray(documentTable.id, documentIds))
  //     .leftJoin(annotation, eq(annotation.documentId, documentTable.id))
  //     .leftJoin(comment, eq(comment.annotationId, annotation.id))
  //   :
  //   await db
  //     .select()
  //     .from(documentTable)
  //     .leftJoin(annotation, eq(annotation.documentId, documentTable.id))
  //     .leftJoin(comment, eq(comment.annotationId, annotation.id))

  // const userGroups = await getGroups(userId)
  // const userGroupIds = userGroups.map(g => g.id)

  // // group results by document (thanks chatty-g)
  // const docMap = new Map()

  // for (const row of documents) {
  //   const docId = row.document.id
  //   if (!docMap.has(docId)) {
  //     docMap.set(docId, {
  //       ...row.document,
  //       annotations: new Map()
  //     })
  //   }
  //   if (row.annotation) {
  //     const doc = docMap.get(docId)
  //     const annoId = row.annotation.id
  //     if (!doc.annotations.has(annoId)) {
  //       doc.annotations.set(annoId, {
  //         ...row.annotation,
  //         comments: []
  //       })
  //     }
  //     if (row.comment) {
  //       doc.annotations.get(annoId).comments.push(row.comment)
  //     }
  //   }
  // }

  // // resource ids
  // const allAnnotationIds: string[] = []
  // const allCommentIds: string[] = []

  // for (const doc of docMap.values()) {
  //   for (const [annoId, anno] of doc.annotations) {
  //     allAnnotationIds.push(annoId)
  //     allCommentIds.push(...anno.comments.map((c: any) => c.id))
  //   }
  // }

  // const allResourceIds = [
  //   ...(documentIds || []).map(id => ({ type: 'document' as const, id })),
  //   ...allAnnotationIds.map(id => ({ type: 'annotation' as const, id })),
  //   ...allCommentIds.map(id => ({ type: 'comment' as const, id }))
  // ]

  // // batch fetch perms
  // const permissions = allResourceIds.length > 0 ? await db
  //   .select()
  //   .from(permissionTable)
  //   .where(
  //     or(
  //       ...allResourceIds.map(r =>
  //         and(
  //           eq(permissionTable.resourceType, r.type as any),
  //           eq(permissionTable.resourceId, r.id)
  //         )
  //       )
  //     )
  //   ) : []

  // // map of perms so we can lookup resources
  // const permMap = new Map()

  // for (const perm of permissions) {
  //   const key = `${perm.resourceType}:${perm.resourceId}`
  //   if (!permMap.has(key)) {
  //     permMap.set(key, [])
  //   }

  //   // perm applies to user?
  //   const applies =
  //     (perm.principalType === 'user' && perm.principalId === userId) ||
  //     (perm.principalType === 'group' && userGroupIds.includes(perm.principalId))
  //   if (applies) {
  //     permMap.get(key).push(perm)
  //   }
  // }

  // const ownedAnnotations = allAnnotationIds.length > 0 ? await db
  //   .select()
  //   .from(annotation)
  //   .where(and(
  //     inArray(annotation.id, allAnnotationIds),
  //     eq(annotation.userId, userId)
  //   )) : []

  // const ownedComments = allCommentIds.length > 0 ? await db
  //   .select()
  //   .from(comment)
  //   .where(and(
  //     inArray(comment.id, allCommentIds),
  //     eq(comment.userId, userId)
  //   )) : []

  // const ownedSet = new Set([
  //   ...ownedAnnotations.map(a => `annotation:${a.id}`),
  //   ...ownedComments.map(c => `comment:${c.id}`)
  // ])

  // const hasAccess = (resourceType: string, resourceId: string, documentId?: string, annotationId?: string) => {
  //   // check ownership
  //   if (ownedSet.has(`${resourceType}:${resourceId}`)) return true

  //   // check direct permissions
  //   const key = `${resourceType}:${resourceId}`
  //   if (permMap.has(key) && permMap.get(key).length > 0) return true

  //   // check parent permissions (inheritance)
  //   if (resourceType === 'comment' && annotationId) {
  //     if (hasAccess('annotation', annotationId, documentId)) return true
  //   }

  //   if (resourceType === 'annotation' && documentId) {
  //     if (hasAccess('document', documentId)) return true
  //   }

  //   return false
  // }

  // // filter documents and their shit - chatty-g again with the save
  // const result = []
  // for (const doc of docMap.values()) {
  //   if (!hasAccess('document', doc.id)) continue

  //   const filteredAnnotations = []

  //   for (const [annoId, anno] of doc.annotations) {
  //     if (!hasAccess('annotation', annoId, doc.id)) continue

  //     const filteredComments = anno.comments.filter((c: any) =>
  //       hasAccess('comment', c.id, doc.id, annoId)
  //     )

  //     filteredAnnotations.push({
  //       ...anno,
  //       comments: filteredComments
  //     })
  //   }

  //   result.push({
  //     ...doc,
  //     annotations: filteredAnnotations
  //   })
  // }

  // return result
  const results = await db.select().from(documentTable)
  return results

}

export const getDocument = async (userId: string, documentId: string) => {
  const documents = await db
      .select()
      .from(documentTable)
      .leftJoin(annotation, eq(annotation.documentId, documentTable.id))
      .leftJoin(comment, eq(comment.annotationId, annotation.id))

  const userGroups = await getGroups(userId)
  const userGroupIds = userGroups.map(g => g.id)

  // group results by document (thanks chatty-g)
  const docMap = new Map()

  for (const row of documents) {
    const docId = row.document.id
    if (!docMap.has(docId)) {
      docMap.set(docId, {
        ...row.document,
        annotations: new Map()
      })
    }
    if (row.annotation) {
      const doc = docMap.get(docId)
      const annoId = row.annotation.id
      if (!doc.annotations.has(annoId)) {
        doc.annotations.set(annoId, {
          ...row.annotation,
          comments: []
        })
      }
      if (row.comment) {
        doc.annotations.get(annoId).comments.push(row.comment)
      }
    }
  }

  // resource ids
  const allAnnotationIds: string[] = []
  const allCommentIds: string[] = []

  for (const doc of docMap.values()) {
    for (const [annoId, anno] of doc.annotations) {
      allAnnotationIds.push(annoId)
      allCommentIds.push(...anno.comments.map((c: any) => c.id))
    }
  }

  const allResourceIds = [
    ...allAnnotationIds.map(id => ({ type: 'annotation' as const, id })),
    ...allCommentIds.map(id => ({ type: 'comment' as const, id }))
  ]

  // batch fetch perms
  // const permissions = allResourceIds.length > 0 ? await db
  //   .select()
  //   .from(permissionTable)
  //   .where(
  //     or(
  //       ...allResourceIds.map(r =>
  //         and(
  //           eq(permissionTable.resourceType, r.type as any),
  //           eq(permissionTable.resourceId, r.id)
  //         )
  //       )
  //     )
  //   ) : []

  // // map of perms so we can lookup resources
  // const permMap = new Map()

  // for (const perm of permissions) {
  //   const key = `${perm.resourceType}:${perm.resourceId}`
  //   if (!permMap.has(key)) {
  //     permMap.set(key, [])
  //   }

  //   // perm applies to user?
  //   const applies =
  //     (perm.principalType === 'user' && perm.principalId === userId) ||
  //     (perm.principalType === 'group' && userGroupIds.includes(perm.principalId))
  //   if (applies) {
  //     permMap.get(key).push(perm)
  //   }
  // }

  // const ownedAnnotations = allAnnotationIds.length > 0 ? await db
  //   .select()
  //   .from(annotation)
  //   .where(and(
  //     inArray(annotation.id, allAnnotationIds),
  //     eq(annotation.userId, userId)
  //   )) : []

  // const ownedComments = allCommentIds.length > 0 ? await db
  //   .select()
  //   .from(comment)
  //   .where(and(
  //     inArray(comment.id, allCommentIds),
  //     eq(comment.userId, userId)
  //   )) : []

  // const ownedSet = new Set([
  //   ...ownedAnnotations.map(a => `annotation:${a.id}`),
  //   ...ownedComments.map(c => `comment:${c.id}`)
  // ])

  // const hasAccess = (resourceType: string, resourceId: string, documentId?: string, annotationId?: string) => {
  //   // check ownership
  //   if (ownedSet.has(`${resourceType}:${resourceId}`)) return true

  //   // check direct permissions
  //   const key = `${resourceType}:${resourceId}`
  //   if (permMap.has(key) && permMap.get(key).length > 0) return true

  //   // check parent permissions (inheritance)
  //   if (resourceType === 'comment' && annotationId) {
  //     if (hasAccess('annotation', annotationId, documentId)) return true
  //   }

  //   if (resourceType === 'annotation' && documentId) {
  //     if (hasAccess('document', documentId)) return true
  //   }

  //   return false
  // }

  // filter documents and their shit - chatty-g again with the save
  const result = []
  for (const doc of docMap.values()) {
    // if (!hasAccess('document', doc.id)) continue

    const filteredAnnotations = []

    for (const [annoId, anno] of doc.annotations) {
      // if (!hasAccess('annotation', annoId, doc.id)) continue

      // const filteredComments = anno.comments.filter((c: any) =>
      //   hasAccess('comment', c.id, doc.id, annoId)
      // )

      const filteredComments = anno.comments

      filteredAnnotations.push({
        ...anno,
        comments: filteredComments
      })
    }

    result.push({
      ...doc,
      annotations: filteredAnnotations
    })
  }

  return result[0]
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


const documentRowToObject = (row: DocumentRow): Document => {
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
