# Short Notes 2.0 — Comprehensive Testing Strategy

**Document Version:** 1.0.0  
**Testing Frameworks:** Vitest, Testing Library, Playwright  

---

## 1. Testing Philosophy

A feature is not complete merely because the UI component renders without runtime errors.  
A feature is **Done** only when:
1. Backend business logic handles happy and error paths with status codes and structured errors.
2. Database interactions enforce multi-tenant authorization.
3. Unit and integration tests pass deterministically.
4. UI components handle loading, empty, error, and success states gracefully.

---

## 2. Test Pyramid & Tooling

```
      / \
     / E2E \       Playwright (Critical user journeys: login, note creation, autosave, AI chat)
    /-------\
   /  Integ  \     Vitest + Supertest / Next Request Mock (API routes, Prisma queries, Auth)
  /-----------\
 /    Unit     \   Vitest (Parsers, Exporters, AI Adapters, Utilities, Reducers, Hooks)
/---------------\
```

| Level | Tool | Scope | Target Coverage |
|---|---|---|---|
| **Unit Tests** | Vitest | Parsers (`pdf-parser`, `word-parser`), exporters, formatting helpers, error wrappers, Zod validation schemas. | > 85% |
| **Integration Tests** | Vitest + Prisma Test Client | API routes (`/api/notes`, `/api/folders`, `/api/auth`, `/api/upload`), database transactions, authorization boundary checks. | > 80% |
| **End-to-End Tests** | Playwright | Full browser journeys (registration, onboarding, create note, markdown editing, autosave, search, export). | Key Workflows |
| **Security Tests** | Automated Scripts | Tenant isolation (User A cannot access User B notes), rate limit verification, payload size abuse, token expiration. | 100% Passing |

---

## 3. Immediate Setup Requirements

1. Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react` in `devDependencies`.
2. Configure `vitest.config.ts` with path aliases matching `tsconfig.json` (`@/* -> ./src/*`).
3. Add `npm test` script to `package.json`.
4. Update GitHub Actions (`.github/workflows/ci.yml`) to run:
   - TypeScript check (`npx tsc --noEmit`)
   - ESLint (`npm run lint`)
   - Vitest unit & integration tests (`npm test`)
   - Python tests (`notesmcp/tests`)

---

## 4. Test Case Catalog (High Priority)

### 4.1 Unit Tests
- `tests/unit/parsers.test.ts`: Test PDF, Word, and text extraction against sample mock buffers.
- `tests/unit/exporters.test.ts`: Verify Markdown, HTML, and JSON output generation.
- `tests/unit/api-handler.test.ts`: Verify `apiHandler` correctly wraps data in `{ success: true, data: ... }` and handles `AppError` subclasses.
- `tests/unit/helpers.test.ts`: Verify `formatDate`, `generateShareToken`, reading time calculation, word count.

### 4.2 Integration Tests
- `tests/integration/auth.test.ts`: User registration with duplicate email rejection, password hashing verification.
- `tests/integration/notes-api.test.ts`:
  - `GET /api/notes` returns only authenticated user's notes.
  - `POST /api/notes` succeeds without crashing when OpenAI is offline.
  - `PUT /api/notes/[id]` saves version history snapshot.
  - `DELETE /api/notes/[id]` performs soft delete (`deletedAt` set).
  - Cross-user access returns 403 Forbidden.
- `tests/integration/folders-api.test.ts`: CRUD operations on folders including nested folders.

### 4.3 Security Tests
- `tests/security/authorization.test.ts`:
  - Attempting to read `/api/notes/[noteId]` owned by another user returns 403.
  - Attempting to update or delete another user's folder returns 403 or 404.
  - Accessing expired share link returns 410 Gone / 404 Not Found.

