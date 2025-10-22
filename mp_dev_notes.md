- User Flows
    - Auth & Onboarding
        - Landing Request: GET / via app/routes/home.tsx:1; loader checks session through getSession (app/server/auth.server.ts:1).
        - Sign-In Form Render: app/routes/sign-in.tsx (component + action) displays login UI; submits to BetterAuth endpoints wired in app/server/auth.server.ts:1.
        - Email/Password Sign-In: signInEmail wraps BetterAuth (app/server/auth.server.ts:1) when the form posts; successful response redirects to /workspace in the route action.
        - Google OAuth: signInGoogle invoked for the Google button, same file; redirect comes back through BetterAuth callback to session storage in Postgres (app/db/schema.ts:1).

    - Workspace Setup
        - Workspace Layout Request: GET /workspace hits app/routes/layout.tsx:1; loader enforces session (getSession) and fetches aggregates.
        - Data Fetches: Loader gathers documents getDocuments (app/server/documents.server.ts:1), groups getGroups (app/server/groups.server.ts), chats getChats (app/server/chats.server.ts:1), document metadata getDocument, authors getDocumentAuthors (app/server/authors.server.ts), and annotations getAnnotations (app/server/annotations.server.ts:1).
        - Sidebar Population: app/components/sidebar-app-left.tsx:1 renders document/group lists, search form, upload modal;revalidates via React Router fetchers.

    - Document Consumption & Annotation
        - Document Route: GET /workspace/document/:id handled in app/routes/document.tsx:1; loader uses requireUser, getDocument, getAnnotations, plus getColorFromID (app/server/users.server.ts).
        - Rendering: DocumentContents component (app/components/document/DocumentContents.tsx) injects HTML; selection handling and popovers managed in same route file.
        - Annotation Creation/Save: Highlight actions call loaders/actions in app/routes/save-annotation.ts (uses saveAnnotations in app/server/annotations.server.ts:1).
        - Annotation Deletion: app/routes/delete-annotation.ts action invokes deleteAnnotations; permissions enforced via helper (app/server/permissions.server.helper.ts:1).
        - Comments Flow: app/routes/api.mentions.ts etc. tie into app/server/comments.server.ts (not shown but located there) when adding note discussions.

    - Semantic Search & Mentions
        - Sidebar Search Input: fetcher.Form in app/components/sidebar-app-left.tsx:1 queries /workspace/document-search.
        - Search Route: app/routes/document-search.tsx loader invokes searchDocumentsForMention (app/server/search.server.ts:1).
        - Mention Parsing: Chat text and annotation content processed through parseMentions (app/utils/mention-parser.ts:1).

    - Chat with Document Context
        - Chat Page: GET /workspace/chat/:id route (app/routes/chat.tsx) sets loader data with existing chat history (getChats).
        - Frontend Chat Component: app/chat/chat-block.tsx:1 manages useChat, merges selection text, and builds payload with mentions.
        - API Action: POST /workspace/api/chat (app/routes/api.chat.ts:1) enforces user via requireUser; calculates mentioned docs (authors via getAuthorDocuments in app/server/authors.server.ts); streams gpt-5-nano responses with document-search tool.
        - Search Tool Execution: embedAndSearch (app/server/document.server.ts:1) generates embeddings and calls semanticSearch (app/server/search.server.ts:1).
        - Chat Persistence: saveChat (app/server/chats.server.ts:1) stores transcript JSON.

    - Document Ingestion
        - Upload Trigger: UploadForm component (app/components/upload-form.tsx) submits file to /workspace/api/upload.
        - Upload Action: app/routes/api.upload.ts:1 requires user, writes temp EPUB, extracts HTML with EPub, constructs doc object, calls saveDocument (app/server/documents.server.ts:1), then redirects to new document.
        - Post-Upload Embedding: Downstream processes (batch job or manual trigger) expected to chunk+embed via chunkText/generateEmbeddings (app/server/document.server.ts:1) and persist vectors saveDocumentChunks (app/server/documents.server.ts:1).

    - Permissions & Group Sharing
        - Group CRUD: GroupModal (app/components/group/GroupModal.tsx) hits routes under app/routes that use app/server/groups.server.ts.
        - Permission Checks: Every server helper calls requirePermission / getUserGroupIds etc. in app/server/permissions.server.helper.ts:1, reading ACLs from permissionTable (app/db/schema.ts:1).
        - Group Document Access: getAnnotations cross-references group membership (app/server/annotations.server.ts:1) with groupDocumentTable joins.