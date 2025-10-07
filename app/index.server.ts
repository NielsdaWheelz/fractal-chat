import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { and, eq, sql, desc, ilike, inArray, or } from 'drizzle-orm';
import { chatTable, documentChunksTable, groupTable, documentTable, authorTable, documentAuthorsTable, user, annotation, groupMemberTable, groupDocumentTable, comment, permissionTable } from '~/db/schema'

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

async function main() {
  db
}
// createGroup(userId, name)
export const saveGroup = async (group) => {
  const dbGroup = documentObjectToRow(group)
  return await db.insert(groupTable).values(dbGroup).onConflictDoUpdate({ target: groupTable.id, set: dbGroup })
}

// getGroup(groupId)
export const getGroup = async (groupId) => {
  const groups = await db.select().from(groupTable).where(eq(groupTable.id, groupId))
  if (!groups) return null
  const users = await db.select().from(groupMemberTable).leftJoin(user, eq(groupMemberTable.userId, user.id)).where(eq(groupMemberTable.userId, groupId))
  const documents = await db.select().from(groupDocumentTable).leftJoin(documentTable, eq(groupDocumentTable.documentId, documentTable.id)).where(eq(groupDocumentTable.groupId, groupId))
  const results = { ...groups, users, documents }
  if (results.length === 0) {
    return null
  } else {
    return results
  }
}

// getGroups(userId)
export const getGroups = async (userId) => {
  return await db.select().from(groupTable)
}

// updateGroup(groupId, data)
export const updateGroup = async (group) => {
  return await db.insert(groupTable).values(group).onConflictDoUpdate({ target: groupTable.id, set: group })
}

// deleteGroup(groupId)
export const deleteGroup = async (groupId) => {
  return await db.delete(groupTable).where(eq(groupTable.id, groupId))
}

// addGroupMember(groupId, userId)
export const addGroupMember = async (groupId, userId) => {
  return await db.insert(groupMemberTable).values({ groupId: groupId, userId: userId })
}

// removeGroupMember(groupId, userId)
export const removeGroupMember = async (groupId, userId) => {
  return await db.delete(groupMemberTable).where(and(eq(groupMemberTable.groupId, groupId), eq(groupMemberTable.userId, userId)))
}

// listGroupMembers(groupId)
export const getGroupMembers = async (groupId) => {
  return await db.select().from(groupMemberTable).leftJoin(user, eq(user.id, groupMemberTable.userId)).where(eq(groupMemberTable.groupId, groupId))
}

// addDocumentToGroup(groupId, documentId)
export const addDocumentToGroup = async (groupId, documentId) => {
  return await db.insert(groupDocumentTable).values({ groupId: groupId, documentId: documentId })
}

// removeDocumentFromGroup(groupId, documentId)
export const removeDocumentFromGroup = async (groupId, documentId) => {
  return await db.delete(groupDocumentTable).where(and(eq(groupDocumentTable.groupId, groupId), eq(groupDocumentTable.documentId, documentId)))
}

// listGroupDocuments(groupId)
export const listGroupDocuments = async (groupId) => {
  return await db.select().from(groupDocumentTable).leftJoin(documentTable, eq(documentTable.id, groupDocumentTable.documentId)).where(eq(groupDocumentTable.groupId, groupId))
}

// createPermission(resourceType, resourceId, principalType, principalId)
export const createPermission = async (resourceType, resourceId, principalType, principalId) => {
  return await db.insert(permissionTable).values({ resourceType: resourceType, resourceId: resourceId, principalType: principalType, principalId: principalId })
}

// deletePermission(resourceType, resourceId, principalType, principalId)
export const deletePermission = async (resourceType, resourceId, principalType, principalId) => {
  return await db.delete(permissionTable).where(and(eq(resourceType, resourceType), eq(resourceId, resourceId), eq(principalType, principalType), eq(principalId, principalId)))
}

// getPermissionsForResource(resourceType, resourceId)
// → All principals that can access a resource.
export const getPermissionsforResource = async (resourceType, resourceId) => {
  return await db
    .select()
    .from(permissionTable)
    .leftJoin(user, and(
      eq(permissionTable.principalType, "user"),
      eq(user.id, permissionTable.principalId)
    ))
    .leftJoin(groupTable, and(
      eq(permissionTable.principalType, "group"),
      eq(groupTable.id, permissionTable.principalId)
    ))
    .where(and(
      eq(permissionTable.resourceType, resourceType),
      eq(permissionTable.resourceId, resourceId)
    ))
}

// getPermissionsForPrincipal(principalType, principalId)
// All resources a user/group/link can access.
export const getPermissionsForPrincipal = async (principalType, principalId) => {
  return await db
    .select()
    .from(permissionTable)
    .leftJoin(chatTable, and(
      eq(permissionTable.resourceType, "chat"),
      eq(permissionTable.resourceId, chatTable.id)
    ))
    .leftJoin(documentTable, and(
      eq(permissionTable.resourceType, "document"),
      eq(permissionTable.resourceId, documentTable.id)
    ))
    .leftJoin(annotation, and(
      eq(permissionTable.resourceType, "annotation"),
      eq(permissionTable.resourceId, annotation.id)
    ))
    .leftJoin(comment, and(
      eq(permissionTable.resourceType, "comment"),
      eq(permissionTable.resourceId, comment.id)
    ))
    .where(and(
      eq(permissionTable.principalType, principalType),
      eq(permissionTable.principalId, principalId)
    ))
}

// checkPermission(userId, resourceType, resourceId)
export const checkPermission = async (userId, resourceType, resourceId) => {
  let resourceTable
  switch (resourceType) {
    case "chat":
      resourceTable = chatTable
      break
    case "annotation":
      resourceTable = annotation
      break
    case "comment":
      resourceTable = comment
      break
    case "document":
      resourceTable = documentTable
      break
    default:
      resourceTable = "invalid resource type"
      break
  }
  // Direct permission exists for the user
  const owned = await db
    .select()
    .from(resourceTable)
    .where(and(eq(resourceTable.id, resourceId), eq(resourceTable.userId, userId)));

  if (owned.length > 0) return "write";

  const userGroupIds = (await getGroups(userId)).map(group => group.id)
  const results = await db
    .select()
    .from(permissionTable)
    .where(
      and(
        eq(permissionTable.resourceType, resourceType),
        eq(permissionTable.resourceId, resourceId),
        or(
          and(
            eq(permissionTable.principalType, "user"),
            eq(permissionTable.principalId, userId),
          ),
          // OR The user is in a group that has permission
          and(
            eq(permissionTable.principalType, "group"),
            inArray(permissionTable.principalId, userGroupIds),
          ),
          // OR A public/share_link permission exists.
          and(
            eq(permissionTable.principalType, "public"),
          ),
          and(
            eq(permissionTable.principalType, "share_link"),
          ),
        )
      )
    )
  if (results.length === 0) return "none"
}

// makePrivate(useraId, resourceType, resourceId)

// getSharedResources(userId) — list all docs/comments shared with that user.

// resolveAccess(userId, resourceType, resourceId) — all the above

const groupRowToObject = (row: typeof groupTable.$inferSelect) => {
  return {
    id: row.id,
    name: row.name,
    userId: row.userId
  }
}

const groupObjectToRow = (group: {
  id: string;
  name: string;
  userId: string;
}) => {
  return {
    id: group.id,
    name: group.name,
    userId: group.userId,
  }
}

export const saveAnnotations = async (annotationToSave: any) => {
  const dbAnnotation = annotationObjectToRow(annotationToSave)
  return await db.insert(annotation).values(dbAnnotation).onConflictDoUpdate({ target: annotation.id, set: dbAnnotation })
}

export const getAnnotations = async (userID: string, doc_id: string) => {
  const result = await db.select().from(annotation).where(and(eq(annotation.userId, userID), eq(annotation.docId, doc_id)));
  return result
}

export const getDocuments = async () => {
  const results = await db.select().from(documentTable)
  return results
}

export const getDocument = async (id: string) => {
  const document = await db.select().from(documentTable).where(eq(documentTable.id, id))
  if (!document) return null
  // const annotations = await db.select().from(annotation).where(eq(annotation.docId, id))
  // const comments = await db.select().from(comment).leftJoin(annotation, eq(comment.annotationId, annotation.id)).where(inArray(comment.annotationId, annotations.map(annotation => annotation.id)))
  // const annotationsWithComments = annotations.map(annotation => ({
  //   ...annotation, comments: comments.filter(comment => comment.annotationId === annotation.id)
  // }))
  // const results = { ...document[0], annotations: annotationsWithComments }
  // return results
  return document
}

export const getChats = async (userId: string, documentId: string) => {
  const results = await db.select().from(chatTable).where(and(eq(chatTable.userId, userId), eq(chatTable.documentId, documentId)))
  return results
}

export const saveDocument = async (document: any) => {
  const dbDocument = documentObjectToRow(document)
  return await db.insert(documentTable).values(dbDocument).onConflictDoUpdate({ target: documentTable.id, set: dbDocument })
}

export const saveDocumentChunks = async (chunks: Array<{
  id: string;
  documentId: string;
  text: string;
  chunkIndex: number;
  embedding: number[];
}>) => {
  if (chunks.length === 0) return;

  const dbChunks = chunks.map(chunk => ({
    id: chunk.id,
    documentId: chunk.documentId,
    text: chunk.text,
    chunkIndex: chunk.chunkIndex,
    embedding: chunk.embedding
  }));

  return await db.insert(documentChunksTable).values(dbChunks);
}

const documentRowToObject = (row: typeof documentTable.$inferSelect) => {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    content: row.content,
    textContent: row.textContent,
    publishedTime: row.publishedTime
  }
}

const documentObjectToRow = (document: {
  id: string;
  userId: string;
  url: string;
  title: string;
  content: string;
  textContent: string | null;
  publishedTime: string | null;
}) => {
  return {
    id: document.id,
    userId: document.userId,
    url: document.url,
    title: document.title,
    content: document.content,
    textContent: document.textContent,
    publishedTime: document.publishedTime
  }
}

const annotationObjectToRow = (annotation: {
  id: string;
  userId: string;
  docId: string;
  perms: string;
  body: string;
  highlight: string;
  start: number;
  end: number;
}) => {
  return {
    id: annotation.id,
    userId: annotation.userId,
    docId: annotation.docId,
    perms: annotation.perms ? [annotation.perms] : [],
    body: annotation.body,
    highlight: annotation.highlight,
    start: annotation.start,
    end: annotation.end,
  }
}



export async function semanticSearch(userId: string, queryEmbedding: number[], topK = 5, documentIds?: string[]) {
  // cosine similarity: 1 - (vector1 <=> vector2)
  // <=> computes cosine distance, so `1 -` for similarity
  // const similarity = sql<number>`1 - (${documentChunksTable.embedding} <=> ${queryEmbedding}::vector)`;
  // Format the embedding array as a PostgreSQL vector literal string: '[1,2,3,...]'
  const vectorString = `[${queryEmbedding.join(',')}]`;
  const similarity = sql<number>`1 - (${documentChunksTable.embedding} <=> ${vectorString}::vector)`;

  const whereConditions = [eq(documentTable.userId, userId)];

  if (documentIds && documentIds.length > 0) {
    whereConditions.push(inArray(documentTable.id, documentIds));
  }

  const results = await db
    .select({
      chunkId: documentChunksTable.id,
      chunkText: documentChunksTable.text,
      chunkIndex: documentChunksTable.chunkIndex,
      documentId: documentTable.id,
      documentTitle: documentTable.title,
      documentUrl: documentTable.url,
      publishedTime: documentTable.publishedTime,
      similarity,
    })
    .from(documentChunksTable)
    .innerJoin(documentTable, eq(documentChunksTable.documentId, documentTable.id))
    .where(and(...whereConditions))
    .orderBy(desc(similarity))
    .limit(topK);
  // i'm a fucking genius

  return results;
}


export const getChat = async (id: string, userId: string, documentId: string) => {
  const results = await db.select().from(chatTable).where(and(eq(chatTable.id, id), eq(chatTable.userId, userId), eq(chatTable.documentId, documentId)))
  if (results.length == 0) {
    return null
  } else {
    return chatRowToObject(results[0])
  }
}

export const saveChat = async (chat: {
  id: string;
  userId: string;
  documentId: string;
  messages: any[];
}) => {
  const dbChat = chatObjectToRow(chat)
  return await db.insert(chatTable).values(dbChat).onConflictDoUpdate({ target: chatTable.id, set: dbChat })
}

const chatRowToObject = (row: typeof chatTable.$inferSelect) => {
  return {
    id: row.id,
    userId: row.userId,
    documentId: row.documentId,
    messages: JSON.parse(row.messages)
  }
}

const chatObjectToRow = (chat: {
  id: string;
  userId: string;
  documentId: string;
  messages: any[];
}) => {
  return {
    id: chat.id,
    userId: chat.userId,
    documentId: chat.documentId,
    messages: JSON.stringify(chat.messages)
  }
}

// Author-related functions
export const getAuthors = async (userId: string, searchTerm?: string) => {
  const whereConditions = [eq(authorTable.userId, userId)];

  if (searchTerm) {
    whereConditions.push(ilike(authorTable.name, `%${searchTerm}%`));
  }

  const results = await db
    .select()
    .from(authorTable)
    .where(and(...whereConditions))
    .orderBy(authorTable.name)
    .limit(10);

  return results.map(r => ({ id: r.id, name: r.name }));
}

export const getAuthor = async (id: string, userId: string) => {
  const results = await db.select().from(authorTable).where(and(eq(authorTable.id, id), eq(authorTable.userId, userId)));
  if (results.length === 0) return null;
  return { id: results[0].id, name: results[0].name };
}

export const createAuthor = async (userId: string, name: string) => {
  const id = crypto.randomUUID();
  const result = await db.insert(authorTable).values({ id, userId, name }).returning();
  return { id: result[0].id, name: result[0].name };
}

export const getAuthorDocuments = async (authorId: string, userId: string) => {
  const results = await db
    .select({ documentId: documentAuthorsTable.documentId })
    .from(documentAuthorsTable)
    .innerJoin(documentTable, eq(documentAuthorsTable.documentId, documentTable.id))
    .where(and(eq(documentAuthorsTable.authorId, authorId), eq(documentTable.userId, userId)));

  return results.map(r => r.documentId);
}

export const linkDocumentToAuthor = async (documentId: string, authorId: string) => {
  const id = crypto.randomUUID();
  await db.insert(documentAuthorsTable).values({ id, documentId, authorId }).onConflictDoNothing();
}

export const getDocumentAuthors = async (documentId: string) => {
  const results = await db
    .select({ id: authorTable.id, name: authorTable.name })
    .from(documentAuthorsTable)
    .innerJoin(authorTable, eq(documentAuthorsTable.authorId, authorTable.id))
    .where(eq(documentAuthorsTable.documentId, documentId));

  return results;
}

export const searchDocumentsForMention = async (userId: string, searchTerm?: string) => {
  const whereConditions = [eq(documentTable.userId, userId)];

  if (searchTerm) {
    whereConditions.push(ilike(documentTable.title, `%${searchTerm}%`));
  }

  const results = await db
    .select({ id: documentTable.id, title: documentTable.title, url: documentTable.url })
    .from(documentTable)
    .where(and(...whereConditions))
    .orderBy(desc(documentTable.id))
    .limit(10);

  return results;
}

main();