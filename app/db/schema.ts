import { pgTable, text, timestamp, boolean, vector, integer, pgEnum, primaryKey } from "drizzle-orm/pg-core";

// export const visibilityEnum = pgEnum("visibility", ["private", "link", "group", "public"]);
export const resourceEnum = pgEnum("resource", ["document", "annotation", "comment", "chat"]);
export const principalEnum = pgEnum("principal", ["user", "group", "public", "share_link"]);

export const chatTable = pgTable("chat", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  documentId: text("document_id")
    .notNull()
    .references(() => documentTable.id, { onDelete: "cascade" }),
  messages: text("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const documentTable = pgTable("document", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  textContent: text("textContent"),
  publishedTime: text("published_time"),
  // visibility: visibilityEnum("visibility").default("private").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const authorTable = pgTable("author", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const documentAuthorsTable = pgTable("document_authors", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => documentTable.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => authorTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const documentChunksTable = pgTable("document_chunks", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull(),
  text: text("text").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: vector("embedding", { dimensions: 512 }).notNull(),
  // metadata: jsonb("metadata").$type<{
  //   page?: number;
  //   section?: string;
  //   source?: string;
  //   [key: string]: any;
  // }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  friends: text("friends").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const annotation = pgTable("annotation", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  docId: text("doc_id").notNull().references(() => documentTable.id, { onDelete: "cascade" }),
  body: text("body"),
  highlight: text("highlights"),
  // visibility: visibilityEnum("visibility").default("private").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const comment = pgTable("comment", {
  id: text("id").primaryKey(),
  body: text("body"),
  userID: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  annotationId: text("annotation_id")
    .notNull()
    .references(() => annotation.id, { onDelete: "cascade" }),
  // visibility: visibilityEnum("visibility").default("private").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const permissionTable = pgTable("permission", {
  resourceType: resourceEnum().notNull(),
  resourceId: text("resource_id").notNull(),
  principalType: principalEnum().notNull(),
  principalId: text("principal_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  primaryKey({ columns: [table.resourceType, table.resourceId, table.principalType, table.principalId] }),]
)

export const groupTable = pgTable("group", {
  id: text("id").primaryKey(),
  name: text("name"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const groupMemberTable = pgTable("group_member", {
  groupId: text("group_id")
    .notNull()
    .references(() => groupTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  primaryKey({ columns: [table.groupId, table.userId] }),]
)

export const groupDocumentTable = pgTable("group_document", {
  groupId: text("group_id")
    .notNull()
    .references(() => groupTable.id, { onDelete: "cascade" }),
  documentId: text("document_id").notNull().references(() => documentTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  primaryKey({ columns: [table.groupId, table.documentId] }),]
)

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});