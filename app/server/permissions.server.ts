import { db } from "~/server/index.server"
import { BadRequestError, ForbiddenError, NotFoundError } from "./errors.server"
import { computeAccessLevel, isResourceCreator, requirePermission } from "./permissions.server.helper"
import { and, eq, ne, or } from "drizzle-orm"
import { annotation, chatTable, comment, documentTable, groupTable, permissionTable, user } from "~/db/schema"
import type { Permission, PermissionCreate, PermissionRow, ResourceType, PrincipalType, PermissionLevel } from "~/types/types"

const tableMap = {
  chat: chatTable,
  annotation,
  comment,
  document: documentTable,
} as const

export const createPermission = async (
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  principalType: PrincipalType,
  principalId: string,
  permissionLevel: "read" | "write" | "admin" = "read"
): Promise<PermissionRow> => {
  const validResourceTypes: ResourceType[] = ["document", "annotation", "comment", "chat", "group"]
  if (!validResourceTypes.includes(resourceType)) {
    throw new BadRequestError(`Invalid resource type: ${resourceType}`)
  }

  const validPrincipalTypes: PrincipalType[] = ["user", "group"]
  if (!validPrincipalTypes.includes(principalType)) {
    throw new BadRequestError(`Invalid principal type: ${principalType}`)
  }

  await requirePermission(
    userId,
    resourceType,
    resourceId,
    "write"
  )

  const result = await db
    .insert(permissionTable)
    .values({
      resourceType: resourceType,
      resourceId,
      principalType: principalType,
      principalId,
      permissionLevel: permissionLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        permissionTable.resourceType,
        permissionTable.resourceId,
        permissionTable.principalType,
        permissionTable.principalId,
      ],
      set: {
        permissionLevel: permissionLevel,
        updatedAt: new Date(),
      },
    })
    .returning()

  return result[0]
}

export const deletePermission = async (
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  principalType: PrincipalType,
  principalId: string
): Promise<{ success: true }> => {
  const validResourceTypes: ResourceType[] = ["document", "annotation", "comment", "chat", "group"]
  if (!validResourceTypes.includes(resourceType)) {
    throw new BadRequestError(`Invalid resource type: ${resourceType}`)
  }

  await requirePermission(
    userId,
    resourceType,
    resourceId,
    "write"
  )

  // Delete the permission
  const result = await db
    .delete(permissionTable)
    .where(
      and(
        eq(permissionTable.resourceType, resourceType),
        eq(permissionTable.resourceId, resourceId),
        eq(permissionTable.principalType, principalType),
        eq(permissionTable.principalId, principalId)
      )
    )
    .returning()

  if (result.length === 0) {
    throw new NotFoundError(
      "Permission",
      `${resourceType}:${resourceId}:${principalType}:${principalId}`
    )
  }
  return { success: true }
}

// getPermissionsForResource(resourceType, resourceId)
// all principals that can access a resource.
export const getPermissionsforResource = async (resourceType: string, resourceId: string) => {
  return await db
    .select()
    .from(permissionTable)
    .leftJoin(user, and(
      eq(permissionTable.principalType, "user" as any),
      eq(user.id, permissionTable.principalId)
    ))
    .leftJoin(groupTable, and(
      eq(permissionTable.principalType, "group" as any),
      eq(groupTable.id, permissionTable.principalId)
    ))
    .where(and(
      eq(permissionTable.resourceType, resourceType as any),
      eq(permissionTable.resourceId, resourceId)
    ))
}

// getPermissionsForPrincipal(principalType, principalId)
// all resources a user/group/link can access.
export const getPermissionsForPrincipal = async (principalType: string, principalId: string) => {
  return await db
    .select()
    .from(permissionTable)
    .leftJoin(chatTable, and(
      eq(permissionTable.resourceType, "chat" as any),
      eq(permissionTable.resourceId, chatTable.id)
    ))
    .leftJoin(documentTable, and(
      eq(permissionTable.resourceType, "document" as any),
      eq(permissionTable.resourceId, documentTable.id)
    ))
    .leftJoin(annotation, and(
      eq(permissionTable.resourceType, "annotation" as any),
      eq(permissionTable.resourceId, annotation.id)
    ))
    .leftJoin(comment, and(
      eq(permissionTable.resourceType, "comment" as any),
      eq(permissionTable.resourceId, comment.id)
    ))
    .where(and(
      eq(permissionTable.principalType, principalType as any),
      eq(permissionTable.principalId, principalId)
    ))
}

export const makePrivate = async (
  userId: string,
  resourceType: ResourceType,
  resourceId: string
): Promise<{ success: true }> => {
  const resourceTable = tableMap[resourceType as keyof typeof tableMap]
  if (!resourceTable) {
    throw new BadRequestError(`Invalid resource type: ${resourceType}`)
  }

  if (resourceType === "document") {
    await requirePermission(
      userId,
      "document",
      resourceId,
      "write"
    )
  } else {
    const isCreator = await isResourceCreator(
      userId,
      resourceType,
      resourceId
    )

    if (!isCreator) {
      throw new ForbiddenError("Only the creator can make a resource private")
    }
  }

  if (resourceType !== "document") {
    await db
      .delete(permissionTable)
      .where(
        and(
          eq(permissionTable.resourceType, resourceType),
          eq(permissionTable.resourceId, resourceId),
          or(
            ne(permissionTable.principalType, "user"),
            ne(permissionTable.principalId, userId)
          )
        )
      )
  } else {
    await db
      .delete(permissionTable)
      .where(
        and(
          eq(permissionTable.resourceType, "document"),
          eq(permissionTable.resourceId, resourceId)
        )
      )
  }

  if (resourceType === "annotation") {
    await db
      .update(annotation)
      .set({ visibility: "private" })
      .where(eq(annotation.id, resourceId))
  } else if (resourceType === "comment") {
    await db
      .update(comment)
      .set({ visibility: "private" })
      .where(eq(comment.id, resourceId))
  }
  return { success: true }
}

const permissionObjectToRow = (permission: Permission) => {
  return {
    resourceType: permission.resourceType,
    resourceId: permission.resourceId,
    principalType: permission.principalType,
    principalId: permission.principalId,
    permissionLevel: permission.permissionLevel,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt
  }
}

const permissionRowToObject = (row: PermissionRow): Permission => {
  return {
    resourceType: row.resourceType as ResourceType,
    resourceId: row.resourceId,
    principalType: row.principalType as PrincipalType,
    principalId: row.principalId,
    permissionLevel: row.permissionLevel as PermissionLevel,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}