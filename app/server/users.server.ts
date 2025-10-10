import { eq } from "drizzle-orm";
import { user } from "~/db/schema";
import { db } from "~/server/index.server";
import type { UserRow } from "~/types/types";
import type { GroupMember, UserBasic } from "~/types/types";

export const getAllUsers = async (): Promise<UserBasic[]> => {
  const results = await db.select().from(user);
  return results.map(userRowToBasic);
};

export const getColorFromID = async (id: string) => {
  const result = await db.select({ color: user.color }).from(user).where(eq(user.id, id));
  return result.length > 0 ? result[0].color : null;
}

export const userRowToBasic = (row: UserRow): UserBasic => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
  };
};

export const userRowToGroupMember = (row: UserRow, isOwner: boolean = false): GroupMember => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    isOwner,
  };
};