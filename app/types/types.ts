import type {
  annotation,
  authorTable,
  chatTable,
  comment,
  documentTable,
  groupTable,
  permissionTable,
  user
} from "~/db/schema";

export type Visibility = "private" | "public"
export type PermissionLevel = "none" | "read" | "write" | "admin"
export type ResourceType = "document" | "annotation" | "comment" | "chat" | "group"
export type PrincipalType = "group" | "user"

//This uses Supabase's special DB magic to tell us what the types are for the rows that each table returns
// mouseover the type name to see what it is!
export type UserRow = typeof user.$inferSelect;
export type DocumentRow = typeof documentTable.$inferSelect;
export type AnnotationRow = typeof annotation.$inferSelect;
export type CommentRow = typeof comment.$inferSelect;
export type ChatRow = typeof chatTable.$inferSelect;
export type GroupRow = typeof groupTable.$inferSelect;
export type PermissionRow = typeof permissionTable.$inferSelect;
export type AuthorRow = typeof authorTable.$inferSelect;

export type User = {
  id: string;
  name: string;
  email: string;
  color: string;
  emailVerified: boolean;
  image: string | null;
  friends: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserBasic = {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export type Document = {
  id: string;
  url: string | null;
  title: string;
  content: string;
  textContent: string | null;
  publishedTime: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentCreate = {
  id: string;
  url: string;
  title: string;
  content: string;
  textContent: string | null;
  publishedTime: string | null;
  visibility?: Visibility;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentBasic = {
  id: string;
  title: string;
  url: string | null;
  publishedTime: Date;
  createdAt: Date;
}

export type DocumentWithDetails = Document & {
  annotations?: AnnotationWithComments[];
}

export type DocumentChunk = {
  id: string;
  documentId: string;
  text: string;
  chunkIndex: number;
  embedding: number[];
}

export type Annotation = {
  id: string;
  userId: string;
  documentId: string;
  body: string | null;
  start: number;
  color: string | null;
  end: number;
  quote: string | null;
  prefix: string | null;
  suffix: string | null;
  visibility: Visibility | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AnnotationCreate = {
  id: string;
  userId: string;
  documentId: string;
  body: string;
  color: string;
  start: number;
  end: number;
  quote?: string;
  prefix?: string;
  suffix?: string;
  visibility?: Visibility;
  createdAt: Date;
  updatedAt: Date;
}

export type AnnotationWithComments = Annotation & {
  comments: Comment[];
}

export type Comment = {
  id: string;
  body: string | null;
  userId: string;
  annotationId: string;
  visibility: Visibility | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CommentCreate = {
  id: string;
  body: string;
  userId: string;
  annotationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Chat = {
  id: string;
  userId: string;
  documentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type ChatCreate = {
  id: string;
  userId: string;
  documentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  [key: string]: any;
}

export type Author = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthorBasic = {
  id: string;
  name: string;
}

export type Group = {
  id: string;
  name: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GroupCreate = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GroupWithDetails = Group & {
  members: GroupMember[];
  documents: DocumentBasic[];
}

export type GroupMember = UserBasic & {
  isOwner?: boolean;
}

export type GroupUpdate = {
  name?: string;
}

export type Permission = {
  resourceType: ResourceType;
  resourceId: string;
  principalType: PrincipalType;
  principalId: string;
  permissionLevel: PermissionLevel;
  createdAt: Date;
  updatedAt: Date;
}

export type PermissionCreate = {
  resourceType: ResourceType;
  resourceId: string;
  principalType: PrincipalType;
  principalId: string;
  permissionLevel: "read" | "write" | "admin";
}

export type SearchResult = {
  chunkId: string;
  chunkText: string;
  chunkIndex: number;
  documentId: string;
  documentTitle: string;
  documentUrl: string | null;
  publishedTime: string | null;
  similarity: number;
}

export type SearchRequest = {
  query: string;
  topK?: number;
  documentIds?: string[];
}

export type SearchResponse = {
  success: boolean;
  results: SearchResult[];
  count: number;
}

export type ApiSuccess<T = unknown> = {
  success: true;
  data?: T;
}

export type ApiError = {
  success: false;
  error: string;
  message: string;
  code: string;
  statusCode: number;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}