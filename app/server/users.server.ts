import { user } from "~/db/schema";
import { db } from "~/server/index.server";
import type { UserRow } from "~/types/types";
import type { GroupMember, UserBasic } from "~/types/types";

/**
 * Get all users from the database
 */
export const getAllUsers = async (): Promise<UserBasic[]> => {
  const results = await db.select().from(user);
  return results.map(userRowToBasic);
};

/**
 * Converts a database user row to a UserBasic object
 */
export const userRowToBasic = (row: UserRow): UserBasic => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
  };
};

/**
 * Converts a database user row to a GroupMember object
 */
export const userRowToGroupMember = (row: UserRow, isOwner: boolean = false): GroupMember => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    isOwner,
  };
};