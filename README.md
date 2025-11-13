# sidenote:

sidenote: is a collaborative reading workspace that lets groups ingest long-form documents, annotate them, and interrogate the corpus with an AI assistant that respects document-level permissions.

## Core Features
- Ingest documents from the web or upload `.epub` files; content is chunked, embedded, and searchable.
- Highlight and comment on documents with contextual popovers and persistent annotations.
- Chat with an OpenAI-powered assistant that can reference cited documents or authors through inline mentions.
- Organize sharing through groups and fine-grained ACLs so teams only see what they should.
- Maintain provenance by linking chat answers back to semantic search results.

## Tech Stack
- **Frontend:** React Router 7 full-stack runtime, Vite, TypeScript, Tailwind CSS, Radix UI.
- **Data & Auth:** Drizzle ORM + PostgreSQL (with pgvector), BetterAuth for email/password and Google sign-in.
- **AI & Search:** `@ai-sdk/openai` for chat + embeddings, LangChain helpers for chunking, server-side semantic search over vector embeddings.
- **Tooling:** Bun (preferred) or Node.js, Drizzle Kit for migrations, ESLint/TypeScript for type checking.

## Architecture Overview
- `app/routes/` – Page and API routes with colocated loaders/actions.
- `app/server/` – Service layer encapsulating database access, auth, permissions, chat, and search logic.
- `app/components/` – Reusable UI primitives and feature components (sidebars, document tools, chat UI).
- `app/db/schema.ts` & `drizzle/` – Drizzle models and SQL migrations.
- `app/types/` & `app/utils/` – Shared domain types and utilities (mention parsing, helpers).

## Getting Started
### Prerequisites
- Bun ≥ 1.1 (or Node.js ≥ 18 if you prefer `npm`/`pnpm`).
- PostgreSQL with the `vector` extension enabled.
- Environment variables for BetterAuth (Google OAuth) and OpenAI access.

### 1. Install dependencies
```bash
bun install
# or: npm install
```

### 2. Configure environment
Create a `.env` file in the project root with at least:
```env
DATABASE_URL=postgres://user:password@localhost:5432/fractal_chat
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-key
```

### 3. Run database migrations
Apply the Drizzle migrations to your database:
```bash
bunx drizzle-kit push
# or: npx drizzle-kit push
```

### 4. Start the development server
```bash
bun run dev
# or: npm run dev
```
Visit `http://localhost:5173` to use the app.

### 5. Optional: type checking & builds
```bash
bun run typecheck
bun run build
bun run start   # serve the production build
```

## Useful Scripts
- `bun run dev` – Start the dev server with HMR.
- `bun run build` – Build the client and server bundles.
- `bun run start` – Serve the production build.
- `bun run typecheck` – Generate route types and run TypeScript.

## Project Structure (partial)
```text
app/
  chat/                 # Chat UI building blocks
  components/           # Shared UI + feature components
  db/                   # Drizzle schema definitions
  routes/               # Route modules, loaders, actions, APIs
  server/               # Server-side services (auth, docs, search, groups…)
  types/                # Domain types shared across layers
  utils/                # Helpers (mentions, formatting, etc.)
drizzle/                # Generated SQL migrations
public/                 # Static assets served as-is
testscripts/            # Local helper scripts
```

## Additional Notes
- The system prompt that shapes AI responses lives in `app/assets/sysprompt.txt`.
- Mention parsing utilities are in `app/utils/mention-parser.ts` and power both chat and annotation workflows.
- Groups and permissions use ACL logic in `app/server/permissions.server.helper.ts`; adjust there when adding new resource types.

Happy reading!
