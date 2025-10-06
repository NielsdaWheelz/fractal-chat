import { pgTable, text, timestamp, boolean, vector, integer } from "drizzle-orm/pg-core";
import { id } from "zod/v4/locales";

export const chatTable = pgTable("chat", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  documentId: text("document_id").notNull(),
  messages: text("messages").notNull()
})

export const documentTable = pgTable("document", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  textContent: text("textContent"),
  publishedTime: text("published_time"),
})

export const authorTable = pgTable("author", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
})

export const documentAuthorsTable = pgTable("document_authors", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => documentTable.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => authorTable.id, { onDelete: "cascade" }),
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
  perms: text("perm_ids").array(),
  body: text("body"),
  highlight: text("highlights")
})

export const comment = pgTable("comment", {
    id: text("id").primaryKey(),
    body: text("body"),
    userID: text("user_id")
    .notNull()
    .references(() => user.id, {onDelete: "cascade"}),
    annotationId: text("annotation_id")
    .notNull()
    .references(() => annotation.id, {onDelete: "cascade"})
})


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