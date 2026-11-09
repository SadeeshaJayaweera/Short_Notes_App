# Short Notes 2.0 — Feature Verification Matrix

**Last Updated:** November 2026  
**Status Key:**
- ✅ **Verified Working:** Tested and functioning in application runtime.
- 🟡 **Partially Implemented:** Exists in code but incomplete, buggy, or missing essential capabilities.
- ❌ **Broken / Missing:** Advertised or linked in UI but produces errors, 404s, or is not implemented.
- 🚀 **Planned for 2.0:** Target roadmap feature for Short Notes 2.0 transformation.

---

## 1. Authentication & User Management

| Feature | Status | Verification Notes |
|---|---|---|
| Email / Password Registration | ✅ Verified Working | Tested via API (`/api/auth/register`), password hashed with bcrypt, User created in PostgreSQL. |
| Credentials Login | ✅ Verified Working | Authenticates against bcrypt hash in DB, generates JWT session. |
| Google OAuth Provider | 🟡 Partially Implemented | Configured in `auth.ts`, requires user credentials in `.env.local`. |
| GitHub OAuth Provider | 🟡 Partially Implemented | Configured in `auth.ts`, requires user credentials in `.env.local`. |
| Session Management | ✅ Verified Working | NextAuth JWT strategy with session callbacks providing user ID. |
| User Profile & Avatar | 🟡 Partially Implemented | User schema contains `image`, but no profile editing screen exists. |
| Workspace / Multi-Tenancy | 🚀 Planned for 2.0 | Schema currently single-user scoped without workspace isolation. |

---

## 2. Note Management & Editing

| Feature | Status | Verification Notes |
|---|---|---|
| View All Notes List | 🟡 Partially Implemented | List page exists but failed on response parsing (`response.data.notes` bug). |
| Create Note from Text | 🟡 Partially Implemented | Works only if OpenAI key is valid; fails completely offline; auto-title fallback works. |
| Note View / Edit Screen (`/notes/[id]`) | ❌ Broken / Missing | Route does not exist in App Router; causes 404 upon clicking note. |
| Rich Text / Markdown Editor | ❌ Broken / Missing | Only basic HTML textarea exists in `/dashboard/new`. No Tiptap, markdown preview, or formatting toolbar. |
| Note Autosave | ❌ Broken / Missing | No autosave mechanism or saving indicator states implemented. |
| Pin / Favorite Notes | ✅ Verified Working | Schema fields and API update handlers exist and function properly. |
| Soft Delete & Trash Recovery | ❌ Broken / Missing | Schema has `deletedAt`, but API executes hard `delete`. No trash view or restore feature. |
| Note Version History | 🟡 Partially Implemented | `NoteVersion` records created on update; no UI to view or revert versions. |
| Note Export (PDF, Word, MD, HTML, JSON) | ✅ Verified Working | Working exporters in `src/lib/export/index.ts` and API routes. |
| Public Share Link | ❌ Broken / Missing | Token generated, but recipient URL `/share/[token]` returns 404. |

---

## 3. Folders & Tags

| Feature | Status | Verification Notes |
|---|---|---|
| Create Folder | ✅ Verified Working | `POST /api/folders` creates record with unique user constraint. |
| List Folders | ✅ Verified Working | `GET /api/folders` returns user folders with note counts. |
| Update / Delete Folder | ❌ Broken / Missing | Missing `PUT` and `DELETE` endpoints in `/api/folders`. |
| Nested Folders | ❌ Broken / Missing | Schema lacks `parentId` column. Flat hierarchy only. |
| Folders Management Screen | ❌ Broken / Missing | `/dashboard/folders` route does not exist. |
| Tag System | 🟡 Partially Implemented | Schema models exist, but `Tag` is globally unique instead of user-scoped. No tag management UI. |
| Dynamic / Smart Collections | 🚀 Planned for 2.0 | Filter-based rules (e.g. "untagged", "recent PDF") planned. |

---

## 4. Document Processing & Ingestion

| Feature | Status | Verification Notes |
|---|---|---|
| PDF Text Extraction | ✅ Verified Working | Handled via `pdf-parse` in `pdf-parser.ts`. |
| DOCX Text Extraction | ✅ Verified Working | Handled via `mammoth` in `word-parser.ts`. |
| Plain Text Ingestion | ✅ Verified Working | Handled via `text-parser.ts`. |
| Large File Streaming / Background Processing | ❌ Broken / Missing | Reads whole file into RAM, blocking HTTP request. |
| OCR for Scanned Documents | 🚀 Planned for 2.0 | Tesseract.js / cloud OCR planned. |
| Document Viewer with Highlights | 🚀 Planned for 2.0 | Side-by-side document viewer planned for Research Mode. |

---

## 5. AI Knowledge Engine & Intelligence

| Feature | Status | Verification Notes |
|---|---|---|
| Single-Doc Summarization | ✅ Verified Working | Calls OpenAI `gpt-4-turbo-preview` with JSON prompt. |
| AI Title Generation | ✅ Verified Working | Working prompt with 500-char truncation. |
| AI Tagging & Sentiment | 🟡 Partially Implemented | Extracted in `summarizeText`, saved in upload, but discarded in manual note creation. |
| Vector Embeddings (pgvector) | ❌ Broken / Missing | No vector columns, embeddings, or pgvector extension enabled. |
| RAG Knowledge Retrieval | ❌ Broken / Missing | No chunking, hybrid retrieval, or context builder. |
| Chat with Knowledge Base | ❌ Broken / Missing | No conversation tables, streaming responses, or chat interface. |
| Clickable Source Citations | ❌ Broken / Missing | Not supported in current architecture. |
| Knowledge Graph Visualization | ❌ Broken / Missing | No node/edge relationship model or interactive graph view. |
| Related Note Suggestions | 🚀 Planned for 2.0 | Planned via embedding cosine similarity. |

---

## 6. Productivity & Study Mode

| Feature | Status | Verification Notes |
|---|---|---|
| Task Extraction & Management | 🚀 Planned for 2.0 | No task models or UI currently present. |
| AI Flashcard Generation | 🚀 Planned for 2.0 | Spaced repetition / FSRS study mode planned. |
| Quiz Generation | 🚀 Planned for 2.0 | MCQ & short-answer evaluation planned. |
| Calendar View | 🚀 Planned for 2.0 | Planned for Phase 4. |

---

## 7. MCP (Model Context Protocol) & Developer API

| Feature | Status | Verification Notes |
|---|---|---|
| MCP Python Server | ✅ Verified Working | Server starts, connects to DB, passes unit tests. |
| MCP Multi-Tenant Auth | ❌ Broken / Missing | Hardcodes `"mcp-client-user"`. Zero security isolation. |
| Developer REST API Keys | 🚀 Planned for 2.0 | API key generation, scoped permissions, rate limits. |

