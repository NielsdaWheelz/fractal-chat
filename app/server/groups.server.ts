import { and, eq, inArray, sql } from "drizzle-orm";
import { documentTable, groupDocumentTable, groupMemberTable, groupTable, permissionTable, user } from "~/db/schema";
import { db } from "~/server/index.server";
import { BadRequestError, ForbiddenError, NotFoundError } from "./errors.server";
import { computeAccessLevel, requirePermission } from "./permissions.server.helper";

export const saveGroup = async (group: {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) => {
  const existingGroup = await db
    .select()
    .from(groupTable)
    .where(eq(groupTable.id, group.id));

  if (existingGroup.length > 0) {
    if (existingGroup[0].userId !== group.userId) {
      throw new ForbiddenError("Only the group owner can update the group");
    }
  }

  const dbGroup = groupObjectToRow(group);
  const result = await db
    .insert(groupTable)
    .values(dbGroup)
    .onConflictDoUpdate({
      target: groupTable.id,
      set: dbGroup
    })
    .returning();

  return groupRowToObject(result[0]);
}

export const getGroup = async (userId: string, groupId: string) => {
  await requirePermission(userId, "group", groupId, "read");

  const groupData = await db
    .select()
    .from(groupTable)
    .where(eq(groupTable.id, groupId));

  if (groupData.length === 0) {
    throw new NotFoundError("Group", groupId);
  }

  const members = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(groupMemberTable)
    .leftJoin(user, eq(groupMemberTable.userId, user.id))
    .where(eq(groupMemberTable.groupId, groupId));

  const documents = await db
    .select({
      id: documentTable.id,
      title: documentTable.title,
      url: documentTable.url,
      publishedTime: documentTable.publishedTime,
      createdAt: documentTable.createdAt,
    })
    .from(groupDocumentTable)
    .leftJoin(documentTable, eq(groupDocumentTable.documentId, documentTable.id))
    .where(eq(groupDocumentTable.groupId, groupId));

  return {
    ...groupRowToObject(groupData[0]),
    members: members.filter((m) => m.userId !== null),
    documents: documents.filter((d) => d.id !== null),
  };
}

export const getGroups = async (userId: string) => {
  const ownedGroups = await db
    .select()
    .from(groupTable)
    .where(eq(groupTable.userId, userId));

  const memberGroupIds = await db
    .select({ groupId: groupMemberTable.groupId })
    .from(groupMemberTable)
    .where(eq(groupMemberTable.userId, userId));

  const memberGroups = memberGroupIds.length > 0
    ? await db
      .select()
      .from(groupTable)
      .where(inArray(groupTable.id, memberGroupIds.map((g) => g.groupId)))
    : [];

  const allGroups = [...ownedGroups, ...memberGroups];
  const uniqueGroups = Array.from(
    new Map(allGroups.map((g) => [g.id, g])).values()
  );

  return uniqueGroups.map((g) => groupRowToObject(g));
}

export const updateGroup = async (
  userId: string,
  groupId: string,
  updates: { name?: string }
) => {
  await requirePermission(userId, "group", groupId, "write");

  const result = await db
    .update(groupTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(groupTable.id, groupId))
    .returning();

  if (result.length === 0) {
    throw new NotFoundError("Group", groupId);
  }

  return groupRowToObject(result[0]);
}

export const deleteGroup = async (userId: string, groupId: string) => {
  await requirePermission(userId, "group", groupId, "write");

  // delete relevant perms
  await db
    .delete(permissionTable)
    .where(
      and(
        eq(permissionTable.principalType, "group" as any),
        eq(permissionTable.principalId, groupId)
      )
    );

  const result = await db
    .delete(groupTable)
    .where(eq(groupTable.id, groupId))
    .returning();

  return result.length > 0;
}

export const addGroupMember = async (
  userId: string,
  groupId: string,
  newUserId: string
) => {
  await requirePermission(userId, "group", groupId, "write");

  // user already member?
  const existingMember = await db
    .select()
    .from(groupMemberTable)
    .where(
      and(
        eq(groupMemberTable.groupId, groupId),
        eq(groupMemberTable.userId, newUserId)
      )
    );

  if (existingMember.length > 0) {
    throw new BadRequestError("User is already a member of this group");
  }

  const result = await db
    .insert(groupMemberTable)
    .values({
      groupId,
      userId: newUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}

export const removeGroupMember = async (
  userId: string,
  groupId: string,
  memberUserId: string
) => {
  await requirePermission(userId, "group", groupId, "write");

  // group owner?
  const groupData = await db
    .select()
    .from(groupTable)
    .where(eq(groupTable.id, groupId));

  if (groupData[0].userId === memberUserId) {
    throw new BadRequestError("Cannot remove the group owner from the group");
  }

  const result = await db
    .delete(groupMemberTable)
    .where(
      and(
        eq(groupMemberTable.groupId, groupId),
        eq(groupMemberTable.userId, memberUserId)
      )
    )
    .returning();

  if (result.length === 0) {
    throw new NotFoundError("Group membership", `${groupId}:${memberUserId}`);
  }

  return true;
}

export const getGroupMembers = async (userId: string, groupId: string) => {
  await requirePermission(userId, "group", groupId, "read");

  // owner
  const groupData = await db
    .select()
    .from(groupTable)
    .where(eq(groupTable.id, groupId));

  const ownerId = groupData[0].userId;

  // owner details
  const ownerDetails = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, ownerId));

  const members = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isOwner: sql<boolean>`false`,
    })
    .from(groupMemberTable)
    .leftJoin(user, eq(user.id, groupMemberTable.userId))
    .where(eq(groupMemberTable.groupId, groupId));

  const result = [
    ...ownerDetails.map((o) => ({ ...o, isOwner: true })),
    ...members.filter((m) => m.userId !== null),
  ];

  return result;
}

export const addDocumentToGroup = async (
  userId: string,
  groupId: string,
  documentId: string
) => {
  const accessLevel = await computeAccessLevel(userId, "group", groupId);
  if (accessLevel === "none") {
    throw new ForbiddenError("Must be a group owner or member to add documents");
  }

  // doc already in group?
  const existing = await db
    .select()
    .from(groupDocumentTable)
    .where(
      and(
        eq(groupDocumentTable.groupId, groupId),
        eq(groupDocumentTable.documentId, documentId)
      )
    );

  if (existing.length > 0) {
    throw new BadRequestError("Document is already in this group");
  }

  await db.insert(groupDocumentTable).values({
    groupId,
    documentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // group read permission
  await db
    .insert(permissionTable)
    .values({
      resourceType: "document" as any,
      resourceId: documentId,
      principalType: "group" as any,
      principalId: groupId,
      permissionLevel: "read" as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  return { success: true };
}

export const removeDocumentFromGroup = async (
  userId: string,
  groupId: string,
  documentId: string
) => {
  const accessLevel = await computeAccessLevel(userId, "group", groupId);
  if (accessLevel === "none") {
    throw new ForbiddenError("Must be a group owner or member to remove documents");
  }

  const result = await db
    .delete(groupDocumentTable)
    .where(
      and(
        eq(groupDocumentTable.groupId, groupId),
        eq(groupDocumentTable.documentId, documentId)
      )
    )
    .returning();

  if (result.length === 0) {
    throw new NotFoundError(
      "Group document association",
      `${groupId}:${documentId}`
    );
  }

  // remove group-permission
  await db
    .delete(permissionTable)
    .where(
      and(
        eq(permissionTable.resourceType, "document" as any),
        eq(permissionTable.resourceId, documentId),
        eq(permissionTable.principalType, "group" as any),
        eq(permissionTable.principalId, groupId)
      )
    );

  return { success: true };
}

export const listGroupDocuments = async (userId: string, groupId: string) => {
  await requirePermission(userId, "group", groupId, "read");

  const documents = await db
    .select({
      id: documentTable.id,
      title: documentTable.title,
      url: documentTable.url,
      textContent: documentTable.textContent,
      publishedTime: documentTable.publishedTime,
      createdAt: documentTable.createdAt,
      updatedAt: documentTable.updatedAt,
    })
    .from(groupDocumentTable)
    .leftJoin(documentTable, eq(documentTable.id, groupDocumentTable.documentId))
    .where(eq(groupDocumentTable.groupId, groupId));

  return documents.filter((d) => d.id !== null);
}

const groupRowToObject = (row: typeof groupTable.$inferSelect) => {
  return {
    id: row.id,
    name: row.name,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

const groupObjectToRow = (group: {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) => {
  return {
    id: group.id,
    name: group.name,
    userId: group.userId,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  }
}
