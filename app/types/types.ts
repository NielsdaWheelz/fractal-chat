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

export type UserRow = typeof user.$inferSelect;
export type DocumentRow = typeof documentTable.$inferSelect;
export type AnnotationRow = typeof annotation.$inferSelect;
export type CommentRow = typeof comment.$inferSelect;
export type ChatRow = typeof chatTable.$inferSelect;
export type GroupRow = typeof groupTable.$inferSelect;
export type PermissionRow = typeof permissionTable.$inferSelect;
export type AuthorRow = typeof authorTable.$inferSelect;

export interface User {
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

export interface UserBasic {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface Document {
  id: string;
  url: string | null;
  title: string;
  content: string;
  textContent: string | null;
  publishedTime: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentCreate {
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

export interface DocumentBasic {
  id: string;
  title: string;
  url: string | null;
  publishedTime: Date;
  createdAt: Date;
}

export interface DocumentWithDetails extends Document {
  annotations?: AnnotationWithComments[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  text: string;
  chunkIndex: number;
  embedding: number[];
}

export interface Annotation {
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

export interface AnnotationCreate {
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

export interface AnnotationWithComments extends Annotation {
  comments: Comment[];
}

export interface Comment {
  id: string;
  body: string | null;
  userId: string;
  annotationId: string;
  visibility: Visibility | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentCreate {
  id: string;
  body: string;
  userId: string;
  annotationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  userId: string;
  documentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatCreate {
  id: string;
  userId: string;
  documentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  [key: string]: any;
}

export interface Author {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorBasic {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupCreate {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupWithDetails extends Group {
  members: GroupMember[];
  documents: DocumentBasic[];
}

export interface GroupMember extends UserBasic {
  isOwner?: boolean;
}

export interface GroupUpdate {
  name?: string;
}

export interface Permission {
  resourceType: ResourceType;
  resourceId: string;
  principalType: PrincipalType;
  principalId: string;
  permissionLevel: PermissionLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionCreate {
  resourceType: ResourceType;
  resourceId: string;
  principalType: PrincipalType;
  principalId: string;
  permissionLevel: "read" | "write" | "admin";
}

export interface SearchResult {
  chunkId: string;
  chunkText: string;
  chunkIndex: number;
  documentId: string;
  documentTitle: string;
  documentUrl: string | null;
  publishedTime: string | null;
  similarity: number;
}

export interface SearchRequest {
  query: string;
  topK?: number;
  documentIds?: string[];
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  count: number;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data?: T;
}

export interface ApiError {
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