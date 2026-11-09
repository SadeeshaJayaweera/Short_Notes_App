# Short Notes 2.0 — Database Migration Runbook

This guide documents the safe schema evolution process from Short Notes 1.0 to 2.0.

---

## 1. Migration Goals
- Add hierarchical folder support (`parentId`).
- Scope tags to users (`userId`).
- Add soft-delete filters and metadata fields to notes (`wordCount`, `readingTime`, `isArchived`, `noteType`).
- Add Knowledge Graph (`NoteRelationship`), Productivity (`Task`), Study Mode (`Flashcard`), and AI Chat (`AIConversation`, `AIMessage`, `AISourceReference`, `DocumentChunk`) tables.
- Guarantee zero data loss for existing notes, users, accounts, and sessions.

---

## 2. Pre-Migration Checklist
- [x] Verify local PostgreSQL connection is active and accepting connections.
- [x] Verify database user privileges (`macboookpro` / `postgres`).
- [ ] Create database snapshot / backup before executing major schema modifications:
  ```bash
  pg_dump -U macboookpro -d short_notes_db -F c -b -v -f ./prisma/backup_pre_2.0.dump
  ```
- [x] Verify existing tables: `users`, `accounts`, `sessions`, `verification_tokens`, `notes`, `folders`, `tags`, `note_tags`, `note_versions`, `shared_notes`.

---

## 3. Safe Migration Sequence

1. **Step 1: Backup Database**
   Export a full binary snapshot of `short_notes_db`.

2. **Step 2: Add Non-Breaking Columns**
   Add optional columns (`parentId` to Folder, `noteType`, `wordCount`, `readingTime`, `isArchived` to Note).

3. **Step 3: Create New 2.0 Tables**
   Create tables for `NoteRelationship`, `DocumentChunk`, `AIConversation`, `AIMessage`, `AISourceReference`, `Task`, `Flashcard`.

4. **Step 4: Regenerate Prisma Client**
   Run `npx prisma generate` to update `@prisma/client` types across the TypeScript codebase.

5. **Step 5: Verify Data Integrity**
   Run integration tests confirming existing notes load cleanly and can be queried.

---

## 4. Rollback Procedure
If a migration fails:
```bash
pg_restore -U macboookpro -d short_notes_db -c -v ./prisma/backup_pre_2.0.dump
```

