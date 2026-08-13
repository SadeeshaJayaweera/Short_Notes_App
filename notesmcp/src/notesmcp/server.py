import asyncio
import json
from typing import Optional

import mcp.types as types
from mcp.server import Server
from mcp.server.stdio import stdio_server

from notesmcp.config import setup_logging
from notesmcp.db import SessionLocal
from notesmcp.repository import NotesRepository

setup_logging()

# In a real app, this might come from auth context. For now, default user.
DEFAULT_USER_ID = "mcp-client-user"


def get_repo() -> NotesRepository:
    db = SessionLocal()
    return NotesRepository(db, DEFAULT_USER_ID)


async def list_resources_handler(
    ctx, params: Optional[types.PaginatedRequestParams] = None
) -> types.ListResourcesResult:
    return types.ListResourcesResult(
        resources=[
            types.Resource(
                uri="notes://all",
                name="All Notes",
                description="A list of all notes available to the user",
                mimeType="application/json",
            )
        ]
    )


async def list_resource_templates_handler(
    ctx, params: Optional[types.PaginatedRequestParams] = None
) -> types.ListResourceTemplatesResult:
    return types.ListResourceTemplatesResult(
        resourceTemplates=[
            types.ResourceTemplate(
                uriTemplate="notes://{note_id}",
                name="Single Note",
                description="A specific note by ID",
                mimeType="application/json",
            )
        ]
    )


async def read_resource_handler(
    ctx, params: types.ReadResourceRequestParams
) -> types.ReadResourceResult:
    repo = get_repo()
    uri = params.uri
    try:
        if uri == "notes://all":
            notes = repo.list(limit=100)
            data = json.dumps([n.model_dump() for n in notes], default=str)
            return types.ReadResourceResult(
                contents=[
                    types.TextResourceContents(
                        uri=uri, mimeType="application/json", text=data
                    )
                ]
            )
        elif uri.startswith("notes://"):
            note_id = uri.replace("notes://", "")
            note = repo.get(note_id)
            if not note:
                raise ValueError(f"Note {note_id} not found")
            data = json.dumps(note.model_dump(), default=str)
            return types.ReadResourceResult(
                contents=[
                    types.TextResourceContents(
                        uri=uri, mimeType="application/json", text=data
                    )
                ]
            )
        else:
            raise ValueError(f"Unknown resource URI: {uri}")
    finally:
        repo.db.close()


async def list_tools_handler(
    ctx, params: Optional[types.PaginatedRequestParams] = None
) -> types.ListToolsResult:
    return types.ListToolsResult(
        tools=[
            types.Tool(
                name="create_note",
                description="Create a new note with title, content, and optional tags.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The title of the note",
                        },
                        "content": {
                            "type": "string",
                            "description": (
                                "The main body content of the note "
                                "(Markdown supported)"
                            ),
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Optional tags to categorize the note",
                        },
                    },
                    "required": ["title", "content"],
                },
            ),
            types.Tool(
                name="get_note",
                description="Retrieve a single note by its unique ID.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The unique ID of the note",
                        }
                    },
                    "required": ["note_id"],
                },
            ),
            types.Tool(
                name="update_note",
                description=(
                    "Update an existing note's title, content, tags, or pin status."
                ),
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The unique ID of the note to update",
                        },
                        "title": {"type": "string", "description": "New title"},
                        "content": {"type": "string", "description": "New content"},
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "New array of tags (overwrites existing)",
                        },
                        "is_pinned": {
                            "type": "boolean",
                            "description": "Whether the note is pinned",
                        },
                    },
                    "required": ["note_id"],
                },
            ),
            types.Tool(
                name="delete_note",
                description="Soft delete a note by its ID. Can be restored later.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The ID of the note to delete",
                        }
                    },
                    "required": ["note_id"],
                },
            ),
            types.Tool(
                name="list_notes",
                description="List notes with advanced filtering and pagination.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "limit": {
                            "type": "integer",
                            "description": "Max results to return",
                            "default": 50,
                        },
                        "offset": {
                            "type": "integer",
                            "description": "Pagination offset",
                            "default": 0,
                        },
                        "search": {
                            "type": "string",
                            "description": "Keyword search across title and content",
                        },
                        "tag": {
                            "type": "string",
                            "description": "Filter by a specific tag",
                        },
                        "is_pinned": {
                            "type": "boolean",
                            "description": "Filter by pinned status",
                        },
                    },
                },
            ),
            types.Tool(
                name="tag_note",
                description="Add a specific tag to a note without overwriting others.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The ID of the note",
                        },
                        "tag": {"type": "string", "description": "The tag to add"},
                    },
                    "required": ["note_id", "tag"],
                },
            ),
            types.Tool(
                name="untag_note",
                description="Remove a specific tag from a note.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The ID of the note",
                        },
                        "tag": {"type": "string", "description": "The tag to remove"},
                    },
                    "required": ["note_id", "tag"],
                },
            ),
            types.Tool(
                name="pin_note",
                description="Pin a note to the top.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The ID of the note",
                        }
                    },
                    "required": ["note_id"],
                },
            ),
            types.Tool(
                name="unpin_note",
                description="Unpin a note.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The ID of the note",
                        }
                    },
                    "required": ["note_id"],
                },
            ),
            types.Tool(
                name="restore_note",
                description="Restore a soft-deleted note.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The ID of the note",
                        }
                    },
                    "required": ["note_id"],
                },
            ),
            types.Tool(
                name="summarize_note",
                description=(
                    "Summarize a note and auto-tag it based on keywords "
                    "(e.g., urgent, todo)."
                ),
                inputSchema={
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "string",
                            "description": "The ID of the note",
                        }
                    },
                    "required": ["note_id"],
                },
            ),
            types.Tool(
                name="export_notes",
                description="Export all notes to a markdown formatted string.",
                inputSchema={"type": "object", "properties": {}},
            ),
        ]
    )


async def call_tool_handler(
    ctx, params: types.CallToolRequestParams
) -> types.CallToolResult:
    name = params.name
    arguments = params.arguments or {}
    repo = get_repo()
    try:
        if name == "create_note":
            note = repo.create(
                title=arguments["title"],
                content=arguments["content"],
                tags=arguments.get("tags"),
            )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=(
                            f"Successfully created note '{note.title}' "
                            f"(ID: {note.id})"
                        ),
                    )
                ]
            )

        elif name == "get_note":
            note = repo.get(arguments["note_id"])
            if not note:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Error: Note {arguments['note_id']} not found.",
                        )
                    ],
                    is_error=True,
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text", text=json.dumps(note.model_dump(), default=str)
                    )
                ]
            )

        elif name == "update_note":
            note = repo.update(
                note_id=arguments["note_id"],
                title=arguments.get("title"),
                content=arguments.get("content"),
                tags=arguments.get("tags"),
                is_pinned=arguments.get("is_pinned"),
            )
            if not note:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=(
                                f"Error: Note {arguments['note_id']} not found "
                                "or update failed."
                            ),
                        )
                    ],
                    is_error=True,
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text", text=f"Successfully updated note {note.id}."
                    )
                ]
            )

        elif name == "delete_note":
            success = repo.delete(arguments["note_id"])
            if success:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Successfully deleted note {arguments['note_id']}.",
                        )
                    ]
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Error: Note {arguments['note_id']} not found.",
                    )
                ],
                is_error=True,
            )

        elif name == "list_notes":
            notes = repo.list(
                limit=arguments.get("limit", 50),
                offset=arguments.get("offset", 0),
                search=arguments.get("search"),
                tag=arguments.get("tag"),
                is_pinned=arguments.get("is_pinned"),
            )
            if not notes:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text", text="No notes found matching the criteria."
                        )
                    ]
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=json.dumps([n.model_dump() for n in notes], default=str),
                    )
                ]
            )

        elif name == "tag_note":
            note = repo.add_tag(arguments["note_id"], arguments["tag"])
            if not note:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Error: Note {arguments['note_id']} not found.",
                        )
                    ],
                    is_error=True,
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=(
                            f"Successfully added tag '{arguments['tag']}' "
                            f"to note {note.id}."
                        ),
                    )
                ]
            )

        elif name == "untag_note":
            note = repo.remove_tag(arguments["note_id"], arguments["tag"])
            if not note:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Error: Note {arguments['note_id']} not found.",
                        )
                    ],
                    is_error=True,
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=(
                            f"Successfully removed tag '{arguments['tag']}' "
                            f"from note {note.id}."
                        ),
                    )
                ]
            )

        elif name == "pin_note":
            note = repo.set_pinned(arguments["note_id"], True)
            if not note:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Error: Note {arguments['note_id']} not found.",
                        )
                    ],
                    is_error=True,
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text", text=f"Successfully pinned note {note.id}."
                    )
                ]
            )

        elif name == "unpin_note":
            note = repo.set_pinned(arguments["note_id"], False)
            if not note:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Error: Note {arguments['note_id']} not found.",
                        )
                    ],
                    isError=True,
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text", text=f"Successfully unpinned note {note.id}."
                    )
                ]
            )

        elif name == "restore_note":
            success = repo.restore(arguments["note_id"])
            if success:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Successfully restored note {arguments['note_id']}.",
                        )
                    ]
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=(
                            f"Error: Note {arguments['note_id']} not found "
                            "or not deleted."
                        ),
                    )
                ],
                is_error=True,
            )

        elif name == "summarize_note":
            note = repo.summarize_note(arguments["note_id"])
            if not note:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=f"Error: Note {arguments['note_id']} not found.",
                        )
                    ],
                    is_error=True,
                )
            return types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=(
                            f"Successfully summarized and auto-tagged note "
                            f"{note.id}.\nTags: {', '.join(note.tags)}"
                        ),
                    )
                ]
            )

        elif name == "export_notes":
            notes = repo.list(limit=1000)
            md_lines = ["# Exported Notes\n"]
            for n in notes:
                md_lines.append(f"## {n.title}")
                md_lines.append(f"**Tags:** {', '.join(n.tags)}")
                md_lines.append(f"**Pinned:** {'Yes' if n.is_pinned else 'No'}")
                md_lines.append(f"\n{n.content}\n---")
            md_export = "\n".join(md_lines)
            return types.CallToolResult(
                content=[types.TextContent(type="text", text=md_export)]
            )

        else:
            raise ValueError(f"Unknown tool: {name}")
    except Exception as e:
        return types.CallToolResult(
            content=[types.TextContent(type="text", text=f"Tool error: {str(e)}")],
            isError=True,
        )
    finally:
        repo.db.close()


app = Server(
    "NotesMCP",
    on_list_resources=list_resources_handler,
    on_list_resource_templates=list_resource_templates_handler,
    on_read_resource=read_resource_handler,
    on_list_tools=list_tools_handler,
    on_call_tool=call_tool_handler,
)


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
