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
} from "~/db/schema"
import { ForbiddenError } from "./errors.server"
import type { PermissionLevel, ResourceType, Visibility } from "~/types/types"

const resourceTableMap = {
  chat: chatTable,
  annotation,
  comment,
  document: documentTable,
  group: groupTable,
} as const

export async function getUserGroupIds(userId: string): Promise<string[]> {
  const ownedGroups = await db
    .select({ id: groupTable.id })
    .from(groupTable)
    .where(eq(groupTable.userId, userId))

  const memberGroups = await db
    .select({ groupId: groupMemberTable.groupId })
    .from(groupMemberTable)
    .where(eq(groupMemberTable.userId, userId))

  const groupIds = [
    ...ownedGroups.map((g) => g.id),
    ...memberGroups.map((g) => g.groupId),
  ]

  return [...new Set(groupIds)]
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

// user has required perms func
export async function requirePermission(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  requiredLevel: PermissionLevel = "read"
): Promise<void> {
  const userLevel = await computeAccessLevel(userId, resourceType, resourceId)

  const levelHierarchy = ["none", "read", "write", "admin"]
  const userLevelIndex = levelHierarchy.indexOf(userLevel)
  const requiredLevelIndex = levelHierarchy.indexOf(requiredLevel)

  if (userLevelIndex < requiredLevelIndex) {
    throw new ForbiddenError(
      `Insufficient permissions: ${requiredLevel} required for ${resourceType}:${resourceId}`
    )
  }
}