import asyncio
from typing import Any, List, Optional
import json

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent, ResourceTemplate, Resource, ErrorData
from pydantic import BaseModel, Field, ValidationError

from notesmcp.db import SessionLocal
from notesmcp.repository import NotesRepository
from notesmcp.config import setup_logging

setup_logging()

app = Server("NotesMCP")

# In a real app, this might come from auth context. For now, default user.
DEFAULT_USER_ID = "mcp-client-user"

def get_repo() -> NotesRepository:
    db = SessionLocal()
    return NotesRepository(db, DEFAULT_USER_ID)

@app.list_resources()
async def list_resources() -> List[Resource]:
    return [
        Resource(
            uri="notes://all",
            name="All Notes",
            description="A list of all notes available to the user",
            mimeType="application/json"
        )
    ]

@app.list_resource_templates()
async def list_resource_templates() -> List[ResourceTemplate]:
    return [
        ResourceTemplate(
            uriTemplate="notes://{note_id}",
            name="Single Note",
            description="A specific note by ID",
            mimeType="application/json"
        )
    ]

@app.read_resource()
async def read_resource(uri: str) -> str:
    repo = get_repo()
    try:
        if uri == "notes://all":
            notes = repo.list(limit=100)
            return json.dumps([n.model_dump() for n in notes], default=str)
        elif uri.startswith("notes://"):
            note_id = uri.replace("notes://", "")
            note = repo.get(note_id)
            if not note:
                raise ValueError(f"Note {note_id} not found")
            return json.dumps(note.model_dump(), default=str)
        else:
            raise ValueError(f"Unknown resource URI: {uri}")
    finally:
        repo.db.close()

@app.list_tools()
async def list_tools() -> List[Tool]:
    return [
        Tool(
            name="create_note",
            description="Create a new note with title, content, and optional tags.",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "The title of the note"},
                    "content": {"type": "string", "description": "The main body content of the note (Markdown supported)"},
                    "tags": {"type": "array", "items": {"type": "string"}, "description": "Optional tags to categorize the note"}
                },
                "required": ["title", "content"]
            }
        ),
        Tool(
            name="get_note",
            description="Retrieve a single note by its unique ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "note_id": {"type": "string", "description": "The unique ID of the note"}
                },
                "required": ["note_id"]
            }
        ),
        Tool(
            name="update_note",
            description="Update an existing note's title, content, tags, or pin status.",
            inputSchema={
                "type": "object",
                "properties": {
                    "note_id": {"type": "string", "description": "The unique ID of the note to update"},
                    "title": {"type": "string", "description": "New title"},
                    "content": {"type": "string", "description": "New content"},
                    "tags": {"type": "array", "items": {"type": "string"}, "description": "New array of tags (overwrites existing)"},
                    "is_pinned": {"type": "boolean", "description": "Whether the note is pinned"}
                },
                "required": ["note_id"]
            }
        ),
        Tool(
            name="delete_note",
            description="Soft delete a note by its ID. Can be restored later.",
            inputSchema={
                "type": "object",
                "properties": {
                    "note_id": {"type": "string", "description": "The ID of the note to delete"}
                },
                "required": ["note_id"]
            }
        ),
        Tool(
            name="list_notes",
            description="List notes with advanced filtering and pagination.",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "description": "Max results to return", "default": 50},
                    "offset": {"type": "integer", "description": "Pagination offset", "default": 0},
                    "search": {"type": "string", "description": "Keyword search across title and content"},
                    "tag": {"type": "string", "description": "Filter by a specific tag"},
                    "is_pinned": {"type": "boolean", "description": "Filter by pinned status"}
                }
            }
        ),
        Tool(
            name="tag_note",
            description="Add a specific tag to a note without overwriting others.",
            inputSchema={
                "type": "object",
                "properties": {
                    "note_id": {"type": "string", "description": "The ID of the note"},
                    "tag": {"type": "string", "description": "The tag to add"}
                },
                "required": ["note_id", "tag"]
            }
        ),
        Tool(
            name="untag_note",
            description="Remove a specific tag from a note.",
            inputSchema={
                "type": "object",
                "properties": {
                    "note_id": {"type": "string", "description": "The ID of the note"},
                    "tag": {"type": "string", "description": "The tag to remove"}
                },
                "required": ["note_id", "tag"]
            }
        ),
        Tool(
            name="pin_note",
            description="Pin a note to the top.",
            inputSchema={
                "type": "object",
                "properties": {
                    "note_id": {"type": "string", "description": "The ID of the note"}
                },
                "required": ["note_id"]
            }
        ),
        Tool(
            name="unpin_note",
            description="Unpin a note.",
            inputSchema={
                "type": "object",
                "properties": {
                    "note_id": {"type": "string", "description": "The ID of the note"}
                },
                "required": ["note_id"]
            }
        ),
        Tool(
            name="restore_note",
            description="Restore a soft-deleted note.",
            inputSchema={
                "type": "object",
                "properties": {
                    "note_id": {"type": "string", "description": "The ID of the note"}
                },
                "required": ["note_id"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> List[TextContent]:
    repo = get_repo()
    try:
        if name == "create_note":
            note = repo.create(
                title=arguments["title"],
                content=arguments["content"],
                tags=arguments.get("tags")
            )
            return [TextContent(type="text", text=f"Successfully created note '{note.title}' (ID: {note.id})")]
            
        elif name == "get_note":
            note = repo.get(arguments["note_id"])
            if not note:
                return [TextContent(type="text", text=f"Error: Note {arguments['note_id']} not found.")]
            return [TextContent(type="text", text=json.dumps(note.model_dump(), default=str))]
            
        elif name == "update_note":
            note = repo.update(
                note_id=arguments["note_id"],
                title=arguments.get("title"),
                content=arguments.get("content"),
                tags=arguments.get("tags"),
                is_pinned=arguments.get("is_pinned")
            )
            if not note:
                return [TextContent(type="text", text=f"Error: Note {arguments['note_id']} not found or update failed.")]
            return [TextContent(type="text", text=f"Successfully updated note {note.id}.")]
            
        elif name == "delete_note":
            success = repo.delete(arguments["note_id"])
            if success:
                return [TextContent(type="text", text=f"Successfully deleted note {arguments['note_id']}.")]
            return [TextContent(type="text", text=f"Error: Note {arguments['note_id']} not found.")]
            
        elif name == "list_notes":
            notes = repo.list(
                limit=arguments.get("limit", 50),
                offset=arguments.get("offset", 0),
                search=arguments.get("search"),
                tag=arguments.get("tag"),
                is_pinned=arguments.get("is_pinned")
            )
            if not notes:
                return [TextContent(type="text", text="No notes found matching the criteria.")]
            return [TextContent(type="text", text=json.dumps([n.model_dump() for n in notes], default=str))]
            
        elif name == "tag_note":
            note = repo.add_tag(arguments["note_id"], arguments["tag"])
            if not note:
                return [TextContent(type="text", text=f"Error: Note {arguments['note_id']} not found.")]
            return [TextContent(type="text", text=f"Successfully added tag '{arguments['tag']}' to note {note.id}.")]
            
        elif name == "untag_note":
            note = repo.remove_tag(arguments["note_id"], arguments["tag"])
            if not note:
                return [TextContent(type="text", text=f"Error: Note {arguments['note_id']} not found.")]
            return [TextContent(type="text", text=f"Successfully removed tag '{arguments['tag']}' from note {note.id}.")]
            
        elif name == "pin_note":
            note = repo.set_pinned(arguments["note_id"], True)
            if not note:
                return [TextContent(type="text", text=f"Error: Note {arguments['note_id']} not found.")]
            return [TextContent(type="text", text=f"Successfully pinned note {note.id}.")]
            
        elif name == "unpin_note":
            note = repo.set_pinned(arguments["note_id"], False)
            if not note:
                return [TextContent(type="text", text=f"Error: Note {arguments['note_id']} not found.")]
            return [TextContent(type="text", text=f"Successfully unpinned note {note.id}.")]

        elif name == "restore_note":
            success = repo.restore(arguments["note_id"])
            if success:
                return [TextContent(type="text", text=f"Successfully restored note {arguments['note_id']}.")]
            return [TextContent(type="text", text=f"Error: Note {arguments['note_id']} not found or not deleted.")]

        else:
            raise ValueError(f"Unknown tool: {name}")
    except Exception as e:
        return [TextContent(type="text", text=f"Tool error: {str(e)}")]
    finally:
        repo.db.close()

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
