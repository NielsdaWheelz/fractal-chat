import { db } from "~/server/index.server"
import { eq, and, or, inArray } from "drizzle-orm"
import {
  groupTable,
  groupMemberTable,
  permissionTable,
  documentTable,
  annotation,
  comment,
  chatTable,
  groupDocumentTable,
} from "~/db/schema"
import { ForbiddenError, NotFoundError } from "./errors.server"
import type { PermissionLevel, ResourceType, Visibility } from "~/types/types"

const resourceTableMap = {
  chat: chatTable,
  annotation,
  comment,
  document: documentTable,
  group: groupTable,
} as const

// Get all group IDs that a user is a member of (including owned groups)
export const getUserGroupIds = async (userId: string): Promise<string[]> => {
  const [ownedGroups, memberGroups] = await Promise.all([
    db.select({ id: groupTable.id }).from(groupTable).where(eq(groupTable.userId, userId)),
    db.select({ groupId: groupMemberTable.groupId }).from(groupMemberTable).where(eq(groupMemberTable.userId, userId)),
  ]);

  const groupIds = [
    ...ownedGroups.map((g) => g.id),
    ...memberGroups.map((g) => g.groupId),
  ];

  return [...new Set(groupIds)];
}

export async function getDirectPermission(
  userId: string,
  resourceType: ResourceType,
  resourceId: string
): Promise<PermissionLevel> {
  const userGroupIds = await getUserGroupIds(userId)

  const permissions = await db
    .select()
    .from(permissionTable)
    .where(
      and(
        eq(permissionTable.resourceType, resourceType),
        eq(permissionTable.resourceId, resourceId),
        or(
          // direct user permission
          and(
            eq(permissionTable.principalType, "user"),
            eq(permissionTable.principalId, userId)
          ),
          // group permission (user is member/owner)
          and(
            eq(permissionTable.principalType, "group"),
            inArray(permissionTable.principalId, userGroupIds)
          )
        )
      )
    )

  if (permissions.length === 0) return "none"

  const levels = permissions.map((p) => p.permissionLevel)
  if (levels.includes("admin")) return "admin"
  if (levels.includes("write")) return "write"
  if (levels.includes("read")) return "read"
  return "none"
}

export async function isResourceCreator(
  userId: string,
  resourceType: ResourceType,
  resourceId: string
): Promise<boolean> {
  if (resourceType === "document") return false

  const table = resourceTableMap[resourceType]

  const result = await db
    .select()
    .from(table)
    .where(
      and(
        eq(table.id, resourceId),
        eq(table.userId, userId)
      )
    )

  return result.length > 0
}

export async function isGroupOwner(
  userId: string,
  groupId: string
): Promise<boolean> {
  const result = await db
    .select()
    .from(groupTable)
    .where(
      and(
        eq(groupTable.id, groupId),
        eq(groupTable.userId, userId)
      )
    )

  return result.length > 0
}

export async function isGroupMember(
  userId: string,
  groupId: string
): Promise<boolean> {
  const result = await db
    .select()
    .from(groupMemberTable)
    .where(
      and(
        eq(groupMemberTable.groupId, groupId),
        eq(groupMemberTable.userId, userId)
      )
    )

  return result.length > 0
}

async function getResourceVisibility(
  resourceType: ResourceType,
  resourceId: string
): Promise<Visibility | null> {
  if (resourceType === "chat" || resourceType === "group" || resourceType === "document") {
    return null
  }

  const table = resourceTableMap[resourceType]
  const result = await db
    .select()
    .from(table)
    .where(eq(table.id, resourceId))

  if (result.length === 0) return null

  return result[0].visibility || null
}

async function getParentResource(
  resourceType: ResourceType,
  resourceId: string
): Promise<{ type: ResourceType; id: string } | null> {
  if (resourceType === "comment") {
    const commentData = await db
      .select()
      .from(comment)
      .where(eq(comment.id, resourceId))

    if (commentData.length === 0) return null

    return {
      type: "annotation",
      id: commentData[0].annotationId,
    }
  }

  if (resourceType === "annotation") {
    const annotationData = await db
      .select()
      .from(annotation)
      .where(eq(annotation.id, resourceId))

    if (annotationData.length === 0) return null

    return {
      type: "document",
      id: annotationData[0].documentId,
    }
  }

  if (resourceType === "chat") {
    const chatData = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.id, resourceId))

    if (chatData.length === 0) return null

    return {
      type: "document",
      id: chatData[0].documentId,
    }
  }

  return null
}

// mongo master sensei permission check with full inheritance and visibility and fuckin everything
// creator can always write
// group owners write group data
// private viz = creator only
// specific permissions checked first
// parent permissions inherited (doc>anno>comm)
// group members read group docs
// returns PermissionLevel: admin, write, read, none
export async function computeAccessLevel(
  userId: string,
  resourceType: ResourceType,
  resourceId: string
): Promise<PermissionLevel> {
  const table = resourceTableMap[resourceType]
  if (!table) return "none"

  if (resourceType === "document") return "read"

  const resource = await db
    .select()
    .from(table)
    .where(eq(table.id, resourceId))

  if (resource.length === 0) return "none"

  // groups
  if (resourceType === "group") {
    const isOwner = await isGroupOwner(userId, resourceId)
    if (isOwner) return "write"

    const isMember = await isGroupMember(userId, resourceId)
    if (isMember) return "read"

    return "none"
  }

  // creator?
  const isCreator = await isResourceCreator(userId, resourceType, resourceId)
  if (isCreator) return "write"

  // viz: private = creator-only
  const visibility = await getResourceVisibility(resourceType, resourceId)
  if (visibility === "private") {
    return "none"
  }

  // any direct perms?
  const directPerm = await getDirectPermission(userId, resourceType, resourceId)
  if (directPerm !== "none") return directPerm

  // parent perms
  const parent = await getParentResource(resourceType, resourceId)
  if (parent) {
    const parentPerm = await computeAccessLevel(userId, parent.type, parent.id)
    // only inherit read
    if (parentPerm === "read" || parentPerm === "write" || parentPerm === "admin") {
      return "read"
    }
  }

  return "none"
}

// Require a specific permission level or throw
export const requirePermission = async (
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  requiredLevel: "read" | "write"
): Promise<void> => {
  const access = await checkPermission(userId, resourceType, resourceId);

  if (access === "none") {
    throw new ForbiddenError(`No access to ${resourceType} ${resourceId}`);
  }

  if (requiredLevel === "write" && access !== "write") {
    throw new ForbiddenError(`Write access required for ${resourceType} ${resourceId}`);
  }
}

// NEW


// Get all user IDs that share at least one group with the given user
export const getGroupMateUserIds = async (userId: string): Promise<string[]> => {
  const userGroups = await getUserGroupIds(userId);

  if (userGroups.length === 0) {
    return [];
  }

  // Get all users in these groups
  const [groupOwners, groupMembers] = await Promise.all([
    db.select({ userId: groupTable.userId })
      .from(groupTable)
      .where(inArray(groupTable.id, userGroups)),
    db.select({ userId: groupMemberTable.userId })
      .from(groupMemberTable)
      .where(inArray(groupMemberTable.groupId, userGroups)),
  ]);

  const allUserIds = [
    ...groupOwners.map((g) => g.userId),
    ...groupMembers.map((g) => g.userId),
  ];

  // Remove the requesting user and duplicates
  return [...new Set(allUserIds)].filter((id) => id !== userId);
}

// Get all user IDs that share at least one group with the given user
export const getGroupMateDocumentIds = async (userId: string): Promise<string[]> => {
  const userGroups = await getUserGroupIds(userId);

  if (userGroups.length === 0) {
    return [];
  }

  // Get all users in these groups
  const groupDocuments = await db.select({ documentId: groupDocumentTable.documentId })
    .from(groupDocumentTable)
    .where(inArray(groupMemberTable.groupId, userGroups))

  const allDocumentIds = [
    ...groupDocuments.map((g) => g.documentId),
  ];

  // Remove the requesting user and duplicates
  return [...new Set(allDocumentIds)];
}

// Check if user has access to a specific resource
const checkPermission = async (
  userId: string,
  resourceType: ResourceType,
  resourceId: string
): Promise<AccessLevel> => {
  if (resourceType === "group") {
    // Check if user owns the group
    const group = await db
      .select({ userId: groupTable.userId })
      .from(groupTable)
      .where(eq(groupTable.id, resourceId))
      .limit(1);

    if (group.length === 0) {
      throw new NotFoundError("Group", resourceId);
    }

    if (group[0].userId === userId) {
      return "write";
    }

    // Check if user is a member
    const membership = await db
      .select()
      .from(groupMemberTable)
      .where(
        and(
          eq(groupMemberTable.groupId, resourceId),
          eq(groupMemberTable.userId, userId)
        )
      )
      .limit(1);

    return membership.length > 0 ? "read" : "none";
  }

  const groupMateUserIds = getGroupMateUserIds(userId)

  if (resourceType === "annotation") {
    const annot = await db
      .select({ userId: annotation.userId, visibility: annotation.visibility })
      .from(annotation)
      .where(and(
        eq(annotation.id, resourceId),
        inArray(annotation.userId, groupMateUserIds)
      ))
      .limit(1);

    if (annot.length === 0) {
      throw new NotFoundError("Annotation", resourceId);
    }

    // Owner has write access
    if (annot[0].userId === userId) {
      return "write";
    }

    // Public annotations are readable by anyone
    if (annot[0].visibility === "public") {
      return "read";
    }

    // annotations of users who share a group are visible


    // Private annotations are only visible to owner
    return "none";
  }

  if (resourceType === "comment") {
    const comm = await db
      .select({ userId: comment.userId, visibility: comment.visibility })
      .from(comment)
      .where(eq(comment.id, resourceId))
      .limit(1);

    if (comm.length === 0) {
      throw new NotFoundError("Comment", resourceId);
    }

    // Owner has write access
    if (comm[0].userId === userId) {
      return "write";
    }

    // Public comments are readable by anyone
    if (comm[0].visibility === "public") {
      return "read";
    }

    // Private comments are only visible to owner
    return "none";
  }

  return "none";
}


// Batch check: Get visible annotation IDs for a user on a document
export const getVisibleAnnotationIds = async (
  userId: string,
  documentId: string
): Promise<string[]> => {
  const groupMateIds = await getGroupMateUserIds(userId);

  // Get annotations that are:
  // 1. Created by the user
  // 2. Public
  // 3. Created by group mates AND in a shared group document
  const userGroups = await getUserGroupIds(userId);

  // Check if this document is in any of the user's groups
  const documentInGroups = userGroups.length > 0
    ? await db
      .select({ groupId: groupDocumentTable.groupId })
      .from(groupDocumentTable)
      .where(
        and(
          eq(groupDocumentTable.documentId, documentId),
          inArray(groupDocumentTable.groupId, userGroups)
        )
      )
    : [];

  const isDocInUserGroups = documentInGroups.length > 0;

  const annotations = await db
    .select({ id: annotation.id, userId: annotation.userId, visibility: annotation.visibility })
    .from(annotation)
    .where(eq(annotation.documentId, documentId));

  return annotations
    .filter((a) => {
      // User's own annotations (regardless of visibility)
      if (a.userId === userId) return true;

      // Public annotations
      if (a.visibility === "public") return true;

      // Private annotations from group mates on shared group documents
      if (isDocInUserGroups && groupMateIds.includes(a.userId)) {
        return true;
      }

      return false;
    })
    .map((a) => a.id);
}

// Batch check: Get visible comment IDs for a user on an annotation
export const getVisibleCommentIds = async (
  userId: string,
  annotationId: string
): Promise<string[]> => {
  const groupMateIds = await getGroupMateUserIds(userId);

  // Get the annotation's document to check if it's in a shared group
  const annot = await db
    .select({ documentId: annotation.documentId, userId: annotation.userId })
    .from(annotation)
    .where(eq(annotation.id, annotationId))
    .limit(1);

  if (annot.length === 0) {
    return [];
  }

  const userGroups = await getUserGroupIds(userId);
  const documentInGroups = userGroups.length > 0
    ? await db
      .select({ groupId: groupDocumentTable.groupId })
      .from(groupDocumentTable)
      .where(
        and(
          eq(groupDocumentTable.documentId, annot[0].documentId),
          inArray(groupDocumentTable.groupId, userGroups)
        )
      )
    : [];

  const isDocInUserGroups = documentInGroups.length > 0;

  const comments = await db
    .select({ id: comment.id, userId: comment.userId, visibility: comment.visibility })
    .from(comment)
    .where(eq(comment.annotationId, annotationId));

  return comments
    .filter((c) => {
      // User's own comments
      if (c.userId === userId) return true;

      // Public comments
      if (c.visibility === "public") return true;

      // Private comments from group mates on shared group documents
      if (isDocInUserGroups && groupMateIds.includes(c.userId)) {
        return true;
      }

      return false;
    })
    .map((c) => c.id);
}