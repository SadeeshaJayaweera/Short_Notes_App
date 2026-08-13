import json
import pytest
from unittest.mock import patch

from mcp import types
from notesmcp.server import list_tools_handler, call_tool_handler
from notesmcp.repository import NotesRepository

@pytest.fixture
def mock_get_repo(db_session):
    repo = NotesRepository(db_session, "mcp-client-user")
    with patch("notesmcp.server.get_repo", return_value=repo):
        yield repo

@pytest.mark.asyncio
async def test_list_tools():
    result = await list_tools_handler(None)
    assert len(result.tools) > 5
    tool_names = [t.name for t in result.tools]
    assert "create_note" in tool_names
    assert "get_note" in tool_names
    assert "list_notes" in tool_names

@pytest.mark.asyncio
async def test_create_and_get_note_tool(mock_get_repo):
    # Test create
    req_params = types.CallToolRequestParams(
        name="create_note", 
        arguments={"title": "Tool Note", "content": "Tool Content"}
    )
    result = await call_tool_handler(None, req_params)
    assert result.is_error is not True
    assert "Successfully created note" in result.content[0].text
    
    note_id = result.content[0].text.split("ID: ")[1].strip(")")
    
    # Test get
    req2_params = types.CallToolRequestParams(
        name="get_note",
        arguments={"note_id": note_id}
    )
    get_result = await call_tool_handler(None, req2_params)
    assert get_result.is_error is not True
    note_data = json.loads(get_result.content[0].text)
    assert note_data["title"] == "Tool Note"
    assert note_data["content"] == "Tool Content"

@pytest.mark.asyncio
async def test_tag_pin_note_tools(mock_get_repo):
    req_params = types.CallToolRequestParams(
        name="create_note",
        arguments={"title": "Tag Note", "content": "Tool Content"}
    )
    result = await call_tool_handler(None, req_params)
    note_id = result.content[0].text.split("ID: ")[1].strip(")")
    
    # Tag
    await call_tool_handler(None, types.CallToolRequestParams(name="tag_note", arguments={"note_id": note_id, "tag": "mcp_test"}))
    get_res = await call_tool_handler(None, types.CallToolRequestParams(name="get_note", arguments={"note_id": note_id}))
    note_data = json.loads(get_res.content[0].text)
    assert "mcp_test" in note_data["tags"]
    
    # Pin
    await call_tool_handler(None, types.CallToolRequestParams(name="pin_note", arguments={"note_id": note_id}))
    get_res2 = await call_tool_handler(None, types.CallToolRequestParams(name="get_note", arguments={"note_id": note_id}))
    note_data2 = json.loads(get_res2.content[0].text)
    assert note_data2["is_pinned"] is True

@pytest.mark.asyncio
async def test_extra_tools(mock_get_repo):
    # Summarize tool
    req_params = types.CallToolRequestParams(
        name="create_note",
        arguments={"title": "Action Item", "content": "This is an urgent bug that needs fixing."}
    )
    result = await call_tool_handler(None, req_params)
    note_id = result.content[0].text.split("ID: ")[1].strip(")")
    
    sum_res = await call_tool_handler(None, types.CallToolRequestParams(name="summarize_note", arguments={"note_id": note_id}))
    assert sum_res.is_error is not True
    assert "urgent" in sum_res.content[0].text
    assert "bug" in sum_res.content[0].text
    
    # Export tool
    exp_res = await call_tool_handler(None, types.CallToolRequestParams(name="export_notes", arguments={}))
    assert exp_res.is_error is not True
    assert "# Exported Notes" in exp_res.content[0].text
    assert "Action Item" in exp_res.content[0].text

@pytest.mark.asyncio
async def test_full_lifecycle(mock_get_repo):
    # Create
    res = await call_tool_handler(None, types.CallToolRequestParams(name="create_note", arguments={"title": "Life", "content": "Cycle"}))
    note_id = res.content[0].text.split("ID: ")[1].strip(")")
    
    # Read
    get_res = await call_tool_handler(None, types.CallToolRequestParams(name="get_note", arguments={"note_id": note_id}))
    assert json.loads(get_res.content[0].text)["title"] == "Life"
    
    # Update
    await call_tool_handler(None, types.CallToolRequestParams(name="update_note", arguments={"note_id": note_id, "title": "Life v2"}))
    get_res2 = await call_tool_handler(None, types.CallToolRequestParams(name="get_note", arguments={"note_id": note_id}))
    assert json.loads(get_res2.content[0].text)["title"] == "Life v2"
    
    # Delete
    await call_tool_handler(None, types.CallToolRequestParams(name="delete_note", arguments={"note_id": note_id}))
    get_res3 = await call_tool_handler(None, types.CallToolRequestParams(name="get_note", arguments={"note_id": note_id}))
    assert get_res3.is_error is True
    
    # Restore
    await call_tool_handler(None, types.CallToolRequestParams(name="restore_note", arguments={"note_id": note_id}))
    get_res4 = await call_tool_handler(None, types.CallToolRequestParams(name="get_note", arguments={"note_id": note_id}))
    assert get_res4.is_error is not True
    assert json.loads(get_res4.content[0].text)["title"] == "Life v2"
