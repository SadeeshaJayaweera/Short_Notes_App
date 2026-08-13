# NotesMCP

NotesMCP is a production-ready Model Context Protocol (MCP) server for Note Management. It exposes a rich set of tools and resources for LLM clients (like Claude Desktop) to interact with your notes database natively.

This server runs alongside the `Short_Notes_App` repository and shares its PostgreSQL database.

## Features (The Most Advanced One Ever)
- **Advanced CRUD operations**: Create, Read, Update, Delete with soft-delete capabilities.
- **Rich Queries**: Search across title and content, paginate results, and filter by tags or pinned status.
- **Atomic Operations**: Dedicated tools for tagging, untagging, pinning, unpinning, and restoring notes.
- **Extra Tools**: Summarization (with keyword-based auto-tagging) and Markdown export.
- **Robustness**: Complete error handling and input validation via Python's `mcp` SDK.
- **Resources**: Dedicated MCP resources for list (`notes://all`) and individual note access (`notes://{id}`).

## Setup & Installation

### 1. Requirements
- Python 3.11+
- A running PostgreSQL database (this server uses the `DATABASE_URL` environment variable, defaulting to what Next.js uses in `.env.local`).

### 2. Installation
Clone the repository, navigate to `notesmcp`, and install the dependencies:
```bash
cd notesmcp
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

### 3. Adding to Claude Desktop

To add NotesMCP to Claude Desktop, you need to configure Claude's MCP settings file.

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following configuration (replace `<ABSOLUTE_PATH>` with the absolute path to your cloned repository):

```json
{
  "mcpServers": {
    "notes": {
      "command": "<ABSOLUTE_PATH>/Short_Notes_App-1/notesmcp/.venv/bin/python",
      "args": [
        "-m",
        "notesmcp.server"
      ]
    }
  }
}
```

Restart Claude Desktop, and you will see the Notes tools available!

## MCP Tools & Resources

### Resources
- `notes://all`: Returns all notes in a structured format.
- `notes://{note_id}`: Returns the data of a specific note.

### Tools
- `create_note`: Create a new note. Requires `title` and `content`.
- `get_note`: Get a note by its ID.
- `update_note`: Update a note's fields.
- `delete_note`: Soft-delete a note.
- `restore_note`: Restore a soft-deleted note.
- `list_notes`: List notes with filters (`limit`, `offset`, `search`, `tag`, `is_pinned`).
- `tag_note`: Atomically add a tag to a note.
- `untag_note`: Atomically remove a tag.
- `pin_note`: Pin a note.
- `unpin_note`: Unpin a note.
- `summarize_note`: Generate a summary and auto-tags based on keyword heuristics.
- `export_notes`: Export all notes into a readable Markdown string.

## Development & Testing

This project uses `hatch` as its build backend, and `pytest` for testing.

### Run Tests
```bash
cd notesmcp
source .venv/bin/activate
pytest tests/
```

### Linting & Formatting
```bash
ruff check src/notesmcp
ruff format src/notesmcp
mypy src/notesmcp
```
Pre-commit hooks are also provided for continuous code quality.
