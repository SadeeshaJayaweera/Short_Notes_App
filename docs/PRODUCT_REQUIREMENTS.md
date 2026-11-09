# Short Notes 2.0 — Product Requirements Document (PRD)

**Product Name:** Short Notes 2.0  
**Tagline:** Your Personal AI-Powered Second Brain  
**Product Philosophy:** CAPTURE → UNDERSTAND → CONNECT → RECALL → ACT  
**Product Owner:** Sadeesha Jayaweera  

---

## 1. Vision & Value Proposition

Short Notes 2.0 transforms traditional isolated note-taking into an intelligent, interconnected knowledge operating system. It combines:
- The structured hierarchy and databases of **Notion**
- The bi-directional linking and local graph intelligence of **Obsidian**
- The multi-modal clipping and reliable capture of **Evernote**
- The document grounding and source attribution of **NotebookLM**
- The effortless AI connection suggestions of **Mem**

The platform operates as a secure, private, AI-first cognitive copilot that helps students, researchers, developers, and professionals turn messy information into structured, actionable intelligence.

---

## 2. User Personas

1. **The Knowledge Worker & Researcher:**
   - Needs to ingest papers, PDFs, meeting transcripts, and articles.
   - Demands traceable citations: every AI answer must cite the exact source note/passage.
   - Needs document comparison to identify changes between versions.

2. **The Student & Lifelong Learner:**
   - Takes lecture notes and reads course textbooks.
   - Requires automated flashcard generation with spaced repetition (FSRS).
   - Needs practice quizzes and concept simplifications.

3. **The Software Engineer / Architect:**
   - Manages architecture notes, code snippets, incident postmortems, and technical docs.
   - Needs syntax-highlighted code blocks, LaTeX equation support, and Markdown shortcuts.
   - Interfaces via Model Context Protocol (MCP) and public API to automate workflow hooks.

---

## 3. Functional Requirements

### 3.1 Module 1: Universal Capture System
- **FR-1.1 Quick Capture:** Floating modal or global shortcut (`Cmd+K` / `Ctrl+K` -> Quick Note) to record ideas in < 3 seconds.
- **FR-1.2 Multi-Format File Ingestion:** Drag-and-drop support for PDF, DOCX, TXT, Markdown, and images.
- **FR-1.3 Intelligent Inbox:** Dedicated capture inbox where incoming notes are staged before user triage or AI auto-organization.
- **FR-1.4 AI Inbox Triage:** Option for AI to suggest title, tags, summary, action items, and target folder for review and approval.

### 3.2 Module 2: Advanced Note Editor
- **FR-2.1 Structured Rich Text & Markdown:** Seamless hybrid editor (headings, bold, italic, code blocks, checklists, quotes, callout boxes).
- **FR-2.2 Slash Commands (`/`):** Trigger formatting, AI generation, task creation, or note embeds by typing `/`.
- **FR-2.3 Internal Note Linking & Backlinks:** Type `[[` to search and link any other note; automatically records two-way bi-directional backlinks.
- **FR-2.4 Distraction-Free Modes:** Toggle between Standard Mode (sidebar + editor), Minimal Focus Mode, and Split Research Mode (PDF/source viewer + editor).
- **FR-2.5 Autosave & Concurrency Control:** Debounced autosaving (750ms) with visible indicators: *Saving*, *Saved*, *Offline*, *Conflict*.
- **FR-2.6 Version History:** Automatic checkpoint snapshots with interactive side-by-side diff comparison and rollback.

### 3.3 Module 3: AI Knowledge Intelligence & Chat
- **FR-3.1 AI Chat with Knowledge Base:** Conversational multi-turn assistant grounded in the user's notes and documents.
- **FR-3.2 Context Scoping:** Support asking questions across:
  - The entire knowledge base
  - A specific folder or collection
  - The currently open note or document
- **FR-3.3 Traceable Citations:** All claims derived from user notes must display numbered, clickable citation pills linking to the exact source note.
- **FR-3.4 Streaming Responses:** Low-latency token streaming with markdown rendering, copy buttons, and stop-generation controls.
- **FR-3.5 Note Intelligence Tools:** On-demand AI tools: Auto-Title, Auto-Summary, Extract Action Items, Simplify Language, Detect Contradictions.

### 3.4 Module 4: Knowledge Graph & Visual Relationships
- **FR-4.1 Interactive Force-Directed Graph:** Render notes as nodes and links (bi-directional links, shared tags, semantic similarity) as edges.
- **FR-4.2 Filtering & Clustering:** Filter graph by tag, folder, date range, or relationship type (e.g., `references`, `depends_on`, `related_to`).
- **FR-4.3 Node Inspection:** Hovering reveals summary preview; clicking navigates directly to the note.

### 3.5 Module 5: Knowledge Organization & Taxonomies
- **FR-5.1 Nested Folders:** Unlimited directory depth with custom folder color coding.
- **FR-5.2 User-Scoped Tags:** Personalized tag taxonomy with color coding.
- **FR-5.3 Smart Collections:** Saved filters (e.g., "Notes edited this week", "Action items pending", "PDFs without summaries").
- **FR-5.4 Soft Delete & Trash:** Move to trash, 30-day retention countdown, one-click restore, and permanent purge.
- **FR-5.5 Note Templates:** Pre-configured templates for Meeting Notes, Research Papers, Daily Journals, Technical Docs, and Book Summaries.

### 3.6 Module 6: Productivity & Study Mode
- **FR-6.1 Task System:** Extract actionable to-dos from notes with due dates, priority (High/Med/Low), and completion checkboxes.
- **FR-6.2 Flashcard Generation:** One-click conversion of note key concepts into study flashcards.
- **FR-6.3 Spaced Repetition Engine:** Review flashcards using scientifically proven review intervals (FSRS / SM-2 algorithms).
- **FR-6.4 Practice Quizzes:** Generate multiple-choice and short-answer quizzes with immediate scoring and explanations.

### 3.7 Module 7: Collaboration, Sharing & Developer API
- **FR-7.1 Public Read-Only Share:** Secure shareable link with optional password and expiration date.
- **FR-7.2 Multi-Format Export:** High-fidelity export to PDF, DOCX, Markdown, HTML, and JSON.
- **FR-7.3 Full Knowledge Base Export:** One-click zip download of all user notes in clean Markdown with attachments.
- **FR-7.4 Model Context Protocol (MCP):** Authenticated MCP server exposing search, note creation, retrieval, and summarization tools.
- **FR-7.5 Scoped REST API:** Developer API keys with granular read/write permissions.

---

## 4. Non-Functional Requirements

- **Performance:**
  - Initial dashboard load under 1.5 seconds.
  - Editor keystroke latency under 16ms (60 FPS).
  - Search queries return results in under 200ms.
- **Security & Privacy:**
  - 100% tenant isolation across all database queries.
  - BYOK (Bring Your Own Key) support for OpenAI / Anthropic / Google AI.
  - Zero telemetry or model training on user private notes.
- **Reliability:**
  - Graceful degradation if external AI provider is offline or rate-limited.
  - Conflict resolution preventing accidental data loss during network interruptions.

