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

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
