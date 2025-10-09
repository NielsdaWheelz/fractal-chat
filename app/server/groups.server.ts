import { and, eq, inArray, sql } from "drizzle-orm";
import { documentTable, groupDocumentTable, groupMemberTable, groupTable, permissionTable, user } from "~/db/schema";
import { db } from "~/server/index.server";
import { BadRequestError, ForbiddenError, NotFoundError } from "./errors.server";
import { computeAccessLevel, getUserGroupIds, requirePermission } from "./permissions.server.helper";
import type { Group, GroupCreate, GroupWithDetails, GroupRow, GroupUpdate, GroupMember, DocumentBasic } from "~/types/types";

export const saveGroup = async (group: GroupCreate): Promise<Group> => {
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

export async function getGroup(userId: string, groupId: string): Promise<GroupWithDetails> {
  await requirePermission(userId, "group", groupId, "read");

  const groupData = await db
    .select()
    .from(groupTable)
    .where(eq(groupTable.id, groupId))
    .limit(1);

  if (groupData.length === 0) {
    throw new NotFoundError("Group", groupId);
  }

  // Get owner details
  const ownerData = await db
    .select()
    .from(user)
    .where(eq(user.id, groupData[0].userId))
    .limit(1);

  // Get members
  const memberData = await db
    .select()
    .from(groupMemberTable)
    .leftJoin(user, eq(groupMemberTable.userId, user.id))
    .where(eq(groupMemberTable.groupId, groupId));

  const members: GroupMember[] = [
    ...(ownerData.length > 0
      ? [{ ...ownerData[0], isOwner: true }]
      : []),
    ...memberData
      .filter((m): m is typeof m & { id: string } => m.id !== null)
      .map((m) => ({ ...m, isOwner: false })),
  ];

  // Get documents
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
    ...groupData[0],
    members,
    documents: documents.filter((d): d is DocumentBasic => d.id !== null),
  };
}

export const getGroups = async (userId: string): Promise<Group[]> => {
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

export async function updateGroup(
  userId: string,
  groupId: string,
  updates: GroupUpdate
): Promise<GroupWithDetails> {
  // Only owner can update group
  const group = await db
    .select({ userId: groupTable.userId })
    .from(groupTable)
    .where(eq(groupTable.id, groupId))
    .limit(1);

  if (group.length === 0) {
    throw new NotFoundError("Group", groupId);
  }

  if (group[0].userId !== userId) {
    throw new ForbiddenError("Only the group owner can update the group");
  }

  await db
    .update(groupTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(groupTable.id, groupId));

  return getGroup(userId, groupId);
}

export async function deleteGroup(userId: string, groupId: string): Promise<boolean> {
  // Only owner can delete group
  const group = await db
    .select({ userId: groupTable.userId })
    .from(groupTable)
    .where(eq(groupTable.id, groupId))
    .limit(1);

  if (group.length === 0) {
    throw new NotFoundError("Group", groupId);
  }

  if (group[0].userId !== userId) {
    throw new ForbiddenError("Only the group owner can delete the group");
  }

  await db.delete(groupTable).where(eq(groupTable.id, groupId));
  return true;
}

export async function addGroupMember(
  userId: string,
  groupId: string,
  newUserId: string
): Promise<void> {
  // Any member can add users
  const access = await checkPermission(userId, "group", groupId);
  if (access === "none") {
    throw new ForbiddenError("Must be a group member to add users");
  }

  // Check if already a member
  const existing = await db
    .select()
    .from(groupMemberTable)
    .where(
      and(
        eq(groupMemberTable.groupId, groupId),
        eq(groupMemberTable.userId, newUserId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new BadRequestError("User is already a member");
  }

  // Check if user is the owner (owners don't need to be in member table)
  const group = await db
    .select({ userId: groupTable.userId })
    .from(groupTable)
    .where(eq(groupTable.id, groupId))
    .limit(1);

  if (group[0].userId === newUserId) {
    throw new BadRequestError("Group owner is automatically a member");
  }

  await db.insert(groupMemberTable).values({
    groupId,
    userId: newUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function removeGroupMember(
  userId: string,
  groupId: string,
  memberUserId: string
): Promise<void> {
  // Any member can remove users
  const access = await checkPermission(userId, "group", groupId);
  if (access === "none") {
    throw new ForbiddenError("Must be a group member to remove users");
  }

  // Cannot remove the owner
  const group = await db
    .select({ userId: groupTable.userId })
    .from(groupTable)
    .where(eq(groupTable.id, groupId))
    .limit(1);

  if (group[0].userId === memberUserId) {
    throw new BadRequestError("Cannot remove the group owner");
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
}

export const getGroupMembers = async (userId: string, groupId: string): Promise<GroupMember[]> => {
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
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, ownerId));

  const members = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isOwner: sql<boolean>`false`,
    })
    .from(groupMemberTable)
    .leftJoin(user, eq(user.id, groupMemberTable.userId))
    .where(eq(groupMemberTable.groupId, groupId));

  const result: GroupMember[] = [
    ...ownerDetails.map((o) => ({ ...o, isOwner: true })),
    ...members.filter((m): m is GroupMember & typeof m => m.id !== null).map(m => ({
      id: m.id!,
      name: m.name!,
      email: m.email!,
      image: m.image,
      isOwner: m.isOwner
    })),
  ];

  return result;
}

export async function addDocumentToGroup(
  userId: string,
  groupId: string,
  documentId: string
): Promise<void> {
  // Any member can add documents
  const access = await checkPermission(userId, "group", groupId);
  if (access === "none") {
    throw new ForbiddenError("Must be a group member to add documents");
  }

  // Check if document exists
  const doc = await db
    .select()
    .from(documentTable)
    .where(eq(documentTable.id, documentId))
    .limit(1);

  if (doc.length === 0) {
    throw new NotFoundError("Document", documentId);
  }

  // Check if already in group
  const existing = await db
    .select()
    .from(groupDocumentTable)
    .where(
      and(
        eq(groupDocumentTable.groupId, groupId),
        eq(groupDocumentTable.documentId, documentId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new BadRequestError("Document already in group");
  }

  await db.insert(groupDocumentTable).values({
    groupId,
    documentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function removeDocumentFromGroup(
  userId: string,
  groupId: string,
  documentId: string
): Promise<void> {
  // Any member can remove documents
  const access = await checkPermission(userId, "group", groupId);
  if (access === "none") {
    throw new ForbiddenError("Must be a group member to remove documents");
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
    throw new NotFoundError("Document in group", `${groupId}:${documentId}`);
  }
}

export const listGroupDocuments = async (userId: string, groupId: string): Promise<DocumentBasic[]> => {
  await requirePermission(userId, "group", groupId, "read");

  const documents = await db
    .select({
      id: documentTable.id,
      title: documentTable.title,
      url: documentTable.url,
      publishedTime: documentTable.publishedTime,
      createdAt: documentTable.createdAt,
    })
    .from(groupDocumentTable)
    .leftJoin(documentTable, eq(documentTable.id, groupDocumentTable.documentId))
    .where(eq(groupDocumentTable.groupId, groupId));

  return documents.filter((d): d is DocumentBasic => d.id !== null);
}

const groupRowToObject = (row: GroupRow): Group => {
  return {
    id: row.id,
    name: row.name,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

const groupObjectToRow = (group: GroupCreate) => {
  return {
    id: group.id,
    name: group.name,
    userId: group.userId,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  }
}

// NEW



export async function listGroups(userId: string): Promise<GroupWithDetails[]> {
  const groupIds = await getUserGroupIds(userId);

  if (groupIds.length === 0) {
    return [];
  }

  const groups = await Promise.all(
    groupIds.map((id) => getGroup(userId, id))
  );

  return groups;
}






