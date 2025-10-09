import type { UserRow } from "~/types/types";
import type { GroupMember, UserBasic } from "~/types/types";

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