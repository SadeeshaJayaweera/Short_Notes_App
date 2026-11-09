# Short Notes 2.0 — Comprehensive Project Audit

**Document Version:** 1.0.0  
**Date:** November 2026  
**Auditor:** Principal Software Architect & Elite Engineering Team  
**Project:** Short Notes 2.0 (Transforming Short Notes into an AI-Powered Second Brain)  
**Repository:** https://github.com/SadeeshaJayaweera/Short_Notes_App  

---

## 1. Executive Summary

Short Notes was initiated as an AI-powered note summarization prototype that converts lengthy documents and plain text into bullet-point notes. While the project established a functional foundation with Next.js 14, Prisma ORM, PostgreSQL, and basic OpenAI completions, an extensive deep-dive audit reveals that **the application is currently in an early alpha stage with critical structural gaps, incomplete user-facing flows, non-functional navigation, security vulnerabilities, and zero automated tests for the TypeScript application.**

The marketing materials (README, mockups) depict an end-to-end knowledge platform with dashboard cards, auto-tagging, sentiment filtering, and rich interactions. However, actual implementation analysis shows that many of these capabilities are either partially scaffolded or completely missing.

This audit details verified implementation facts across 15 dimensions to establish the baseline for the Short Notes 2.0 transformation.

---

## 2. Repository Structure & Codebase Inventory

### 2.1 File Tree Analysis
```
Short_Notes_App/
├── .env.example                # Example environment variables
├── .env.local                  # Local development config (needs sanitization)
├── .eslintrc.json              # Minimal ESLint config
├── .gitignore                  # Repaired: now ignores .env* and .next/
├── next.config.js              # Standard Next.js config
├── package.json                # Dependencies & scripts (contains unused libs)
├── prisma/
│   ├── schema.prisma           # Relational schema (8 models, unindexed foreign keys)
│   └── dev.db                  # Stale empty SQLite stub file
├── notesmcp/                   # Python Model Context Protocol server
│   ├── pyproject.toml          # Ruff and pytest config
│   ├── src/notesmcp/           # Server, repository, db connector
│   └── tests/                  # Pytest unit tests for repository & MCP
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login and register pages
│   │   ├── api/                # API routes (auth, notes, folders, upload)
│   │   ├── dashboard/          # Dashboard subpages (many missing/incomplete)
│   │   ├── globals.css         # Tailwind styles & theme variables
│   │   ├── layout.tsx          # Root HTML layout with SessionProvider & ThemeProvider
│   │   └── page.tsx            # Public landing page
│   ├── components/
│   │   ├── ui/                 # Radix / Tailwind basic UI primitives (button, card, dialog, etc.)
│   │   ├── dashboard/layout.tsx# Dashboard navigation shell
│   │   ├── error-boundary.tsx  # React error boundary
│   │   ├── landing-page.tsx    # Marketing landing page
│   │   └── providers.tsx       # NextAuth & Theme providers
│   ├── hooks/                  # Custom useQuery & useMutation hooks
│   ├── lib/
│   │   ├── api-handler.ts      # Standardized API response wrapper
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── errors.ts           # AppError class hierarchy & logger
│   │   ├── export/             # PDF, DOCX, Markdown, HTML exporters
│   │   ├── helpers.ts          # Utility functions
│   │   ├── openai.ts           # OpenAI client functions
│   │   ├── parsers/            # PDF, Word, and text extractors
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── utils.ts            # Tailwind clsx/twMerge utility
│   └── types/                  # TypeScript interface definitions
└── docs/                       # Project documentation (created in 2.0)
```

---

## 3. Detailed Component Audits

### 3.1 Dependencies & Technology Stack (`package.json`)
- **Next.js & React:** Next.js 14.1.0 (App Router), React 18.2.0. Good baseline.
- **ORM & Database:** Prisma 5.8.0 / 5.22.0 with PostgreSQL.
- **AI Integration:** `openai` ^6.33.0. Note: SDK upgraded to modern syntax, but implementation only uses basic single-turn chat completion (`gpt-4-turbo-preview`).
- **Parsers & Exporters:** `pdf-parse`, `mammoth` (docx), `docx`, `jspdf`, `marked`.
- **Unused / Legacy Dependencies:**
  - `@googlemaps/js-api-loader` (^1.16.6): Completely unused in code.
  - `stripe` (^14.12.0) & `@stripe/stripe-js` (^2.4.0): Installed but no active billing integration exists.
- **Package name mismatch:** `package.json` names the project `"name": "wandura"`, carrying over from a previous project template.

### 3.2 Database Schema (`prisma/schema.prisma`)
- **Existing Models:** `User`, `Account`, `Session`, `VerificationToken`, `Folder`, `Tag`, `NoteTag`, `Note`, `NoteVersion`, `SharedNote`.
- **Strengths:**
  - NextAuth relational tables correctly mapped.
  - `NoteVersion` table exists for historical tracking.
  - Soft-delete field `deletedAt` exists in `Note` model.
- **Deficiencies & Structural Gaps:**
  - `Folder`: No `parentId` column. Hierarchy is completely flat; nested folders are impossible.
  - `Tag`: `@@unique([name])` is globally unique across all users! User A creating a tag "Personal" collides with User B.
  - `Note`: Missing full-text search indexes (`gin` or PostgreSQL `tsvector`).
  - No vector embedding storage or `pgvector` extension configured.
  - Foreign keys lack strategic compound indexes (e.g. `[userId, isPinned, createdAt]`).
  - Missing entities for Tasks, Knowledge Graph edges, Document Chunks, AI Conversations, Flashcards, and Workspace collaboration.

### 3.3 API Layer & Route Audits
| Route | Method | Status | Audit Findings |
|---|---|---|---|
| `/api/auth/register` | POST | **Functional** | Validates input with Zod, hashes passwords with bcrypt (10 rounds), returns 201. |
| `/api/auth/[...nextauth]` | GET, POST | **Functional** | Supports Credentials, Google, and GitHub providers. |
| `/api/notes` | GET | **Partially Functional** | Paginated retrieval works, but wraps output in `{ success: true, data: { notes, total, ... } }`. |
| `/api/notes` | POST | **Flawed Architecture** | Synchronously calls OpenAI `summarizeText` on every save. Fails hard if OpenAI API key is missing or quota exceeded. Discards extracted tags and sentiment. |
| `/api/notes/[id]` | GET | **Functional** | Enforces user ownership (`note.userId !== session.user.id`). |
| `/api/notes/[id]` | PUT | **Functional** | Saves version snapshot before updating. |
| `/api/notes/[id]` | DELETE | **Flawed** | Executes hard delete `prisma.note.delete` instead of utilizing existing `deletedAt` soft delete. |
| `/api/notes/[id]/export/[format]` | GET | **Functional** | Supports PDF, Word, Markdown, HTML, JSON. |
| `/api/notes/[id]/share` | POST, DELETE | **Broken End-to-End** | Creates share token, returns `${NEXTAUTH_URL}/share/${token}`. However, `/share/[token]` route does not exist in frontend (returns 404). |
| `/api/folders` | GET, POST | **Incomplete** | Missing `PUT` (rename/recolor) and `DELETE` (delete folder with cascade or note reassignment). Case-sensitivity bug in duplicate check. |
| `/api/upload` | POST | **Risky** | Buffers entire file in server memory (`Buffer.from(await file.arrayBuffer())`). Synchronously calls parser + two OpenAI calls. Large files cause request timeout. |

### 3.4 Frontend & UI/UX Audit
- **Dashboard Home (`/dashboard`):** Empty 12-line placeholder (`<h1>Welcome to Short Notes</h1>`). The rich dashboard shown in mockups does not exist in code.
- **All Notes Page (`/dashboard/notes`):**
  - Bug: `fetchNotes` expects `response.data.notes`, but `apiHandler` returns `response.data.data.notes`. This causes `notes` to be `undefined` and crashes rendering.
  - A duplicate file `page-improved.tsx` exists alongside `page.tsx` with unmerged features.
- **Note Detail / Editor Page (`/dashboard/notes/[id]`):** **Does not exist.** Creating or clicking a note redirects to `/dashboard/notes/[id]`, producing a 404 error.
- **Folders Page (`/dashboard/folders`):** **Does not exist.** Navigation links lead to 404.
- **Settings Page (`/dashboard/settings`):** **Does not exist.** Navigation links lead to 404.
- **Dashboard Layout Header Search:** Static input with no event listener or route binding.
- **Auth Redirects:** `src/app/dashboard/layout.tsx` redirects unauthenticated users to `/auth/login`, which is a 404 (actual path is `/login`).

### 3.5 AI & LLM Implementation Audit
- Single provider (OpenAI only).
- Hardcoded model string `gpt-4-turbo-preview`.
- No streaming responses (`stream: false`).
- No prompt injection guards or sanitize layers.
- No Retrieval-Augmented Generation (RAG) architecture.
- No vector embeddings or semantic search.
- No conversational memory or multi-turn chat with notes.
- In manual note creation, AI tags and sentiment are requested from OpenAI but never saved to the database.

### 3.6 MCP Server (`notesmcp`)
- Implemented in Python using MCP SDK, SQLAlchemy, and SQLite/PostgreSQL.
- Has working unit tests in `notesmcp/tests`.
- **Critical Flaw:** Hardcodes `DEFAULT_USER_ID = "mcp-client-user"` in `server.py`. Any connected MCP client impersonates or writes to a single shared mock user ID. There is no API key verification or tenant authorization.

### 3.7 Testing & CI/CD Audit
- **Frontend / Backend Tests:** **Zero (0)** automated tests exist for the Next.js application, React components, API routes, or TypeScript utilities.
- **CI Workflow (`.github/workflows/ci.yml`):** Only runs `ruff` and `pytest` on the Python `notesmcp` folder. The primary Next.js web application is completely untested in CI.

---

## 4. Critical Bug & Defect Register

| ID | Severity | Component | Description | Impact |
|---|---|---|---|---|
| BUG-01 | **Critical** | Dashboard Layout | Redirects unauthenticated users to `/auth/login` instead of `/login`. | Users experience 404 on redirect. |
| BUG-02 | **Critical** | Notes View | `fetchNotes` accesses `response.data.notes` instead of `response.data.data.notes`. | Notes list fails to load / crashes. |
| BUG-03 | **Critical** | Note Editor / View | `/dashboard/notes/[id]` page does not exist. | Note creation or view results in 404. |
| BUG-04 | **High** | Navigation | `/dashboard/folders` and `/dashboard/settings` do not exist. | Sidebar navigation leads to 404. |
| BUG-05 | **High** | Note Creation | `POST /api/notes` fails completely if OpenAI is unreachable or key is missing. | Prevents users from saving notes offline or without AI. |
| BUG-06 | **High** | Note Sharing | Share URL `/share/[token]` returns 404. | Public sharing feature is completely broken. |
| BUG-07 | **Medium** | Folders API | Missing `PUT` and `DELETE` endpoints. | Folders cannot be renamed, recolored, or deleted. |
| BUG-08 | **Medium** | Note API | `DELETE /api/notes/[id]` performs hard delete, ignoring schema `deletedAt`. | Soft delete and trash recovery impossible. |
| BUG-09 | **Medium** | Global Search | Header search bar has no state or action handlers. | Dead UI control. |
| BUG-10 | **Low** | Codebase Hygiene | `page-improved.tsx` abandoned in `src/app/dashboard/notes/`. | Dead code clutter. |

---

## 5. Security & Privacy Audit

1. **Secret Exposure Risk:**
   - Previous `.gitignore` lacked entries for `.env`, `.env.local`, `.env.*`, and `.next/`.
   - **Resolution:** Updated `.gitignore` with strict environment variable rules.
2. **MCP Authorization Bypass:**
   - `notesmcp/src/notesmcp/server.py` uses hardcoded user `"mcp-client-user"`. Anyone connecting to MCP can read and mutate notes for this identity without credentials.
3. **Missing Resource-Level Sharing Checks:**
   - Public notes can be accessed if token matches, but expiration date (`expiresAt`) is not validated in any read route because read route doesn't exist yet.
4. **File Upload Security:**
   - No file size validation in `POST /api/upload` (only reads full buffer).
   - No magic byte inspection (relies solely on client-provided MIME type).
   - Malicious files or oversized PDFs could lead to Denial of Service (DoS) via memory exhaustion.
5. **No Rate Limiting:**
   - Authentication and AI endpoints lack rate limiting. Vulnerable to credential stuffing and OpenAI quota exhaustion.

---

## 6. Audit Conclusion & Strategic Direction

The existing repository contains a clean Next.js 14 + Tailwind setup and working authentication foundations. However, the core promise of an AI-powered note-taking platform is not yet realized in the actual code.

To transform Short Notes into **Short Notes 2.0: Personal AI-Powered Second Brain**, the team must:
1. **Stabilize Core Application (Phase 1):** Fix all 404s, fix API responses, implement a rich Note Editor, build the complete Dashboard with widgets, enable full Folder and Tag management, and wire up trash/recovery.
2. **Implement AI Knowledge Engine (Phase 2):** Deploy pgvector, document chunking, embeddings, hybrid search, streaming AI Chat with Notes, and source attribution.
3. **Build Knowledge Management & Graph (Phase 3):** Implement interactive knowledge graph, backlinks, and smart collections.
4. **Build Study Mode & Productivity (Phase 4):** Implement flashcards, spaced repetition, quizzes, and tasks.
5. **Scale Platform & Ecosystem (Phase 5):** Upgrade MCP with user authorization, build public API, and enable PWA offline caching.

