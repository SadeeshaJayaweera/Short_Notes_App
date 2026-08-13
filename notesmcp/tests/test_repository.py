from notesmcp.repository import NotesRepository
from notesmcp.schema import Note

def test_create_note(db_session):
    repo = NotesRepository(db=db_session, user_id="test-user")
    
    note = repo.create(
        title="Test Note",
        content="This is a test note content.",
        tags=["pytest", "test"]
    )
    
    assert note.title == "Test Note"
    assert note.content == "This is a test note content."
    assert len(note.tags) == 2
    assert "pytest" in note.tags
    assert note.is_pinned is False
    
    # Verify in DB
    db_note = db_session.query(Note).filter(Note.id == note.id).first()
    assert db_note is not None
    assert db_note.title == "Test Note"
    assert db_note.userId == "test-user"

def test_get_note(db_session):
    repo = NotesRepository(db=db_session, user_id="test-user")
    created_note = repo.create("To Get", "Content to get")
    
    fetched_note = repo.get(created_note.id)
    assert fetched_note is not None
    assert fetched_note.id == created_note.id
    assert fetched_note.title == "To Get"
    
    # Not found
    assert repo.get("invalid_id") is None

def test_update_note(db_session):
    repo = NotesRepository(db=db_session, user_id="test-user")
    created = repo.create("Old Title", "Old Content")
    
    updated = repo.update(
        created.id,
        title="New Title",
        tags=["new_tag"],
        is_pinned=True
    )
    
    assert updated.title == "New Title"
    assert "new_tag" in updated.tags
    assert updated.is_pinned is True
    # Ensure content wasn't overwritten by default
    assert updated.content == "Old Content"

def test_delete_note(db_session):
    repo = NotesRepository(db=db_session, user_id="test-user")
    created = repo.create("To Delete", "Delete me")
    
    # Delete it
    assert repo.delete(created.id) is True
    # Verify it's gone
    assert repo.get(created.id) is None
    # Try deleting again
    assert repo.delete(created.id) is False

def test_list_notes(db_session):
    repo = NotesRepository(db=db_session, user_id="test-user")
    
    # Create 3 notes
    for i in range(3):
        repo.create(f"Note {i}", f"Content {i}")
        
    notes = repo.list(limit=2, offset=0)
    assert len(notes) == 2
    
    notes_page2 = repo.list(limit=2, offset=2)
    assert len(notes_page2) == 1

def test_restore_note(db_session):
    repo = NotesRepository(db=db_session, user_id="test-user")
    created = repo.create("To Restore", "Restore me")
    
    repo.delete(created.id)
    assert repo.get(created.id) is None
    
    assert repo.restore(created.id) is True
    assert repo.get(created.id) is not None

def test_search_notes(db_session):
    repo = NotesRepository(db=db_session, user_id="test-user")
    repo.create("Alpha Note", "Apple pie")
    repo.create("Beta Note", "Banana split")
    
    # Search title
    results = repo.list(search="Alpha")
    assert len(results) == 1
    assert results[0].title == "Alpha Note"
    
    # Search content
    results = repo.list(search="Banana")
    assert len(results) == 1
    assert results[0].title == "Beta Note"

def test_filter_notes(db_session):
    repo = NotesRepository(db=db_session, user_id="test-user")
    created1 = repo.create("Note A", "Content A", tags=["important"])
    created2 = repo.create("Note B", "Content B", tags=["misc"])
    repo.update(created1.id, is_pinned=True)
    
    # Filter by tag
    tag_results = repo.list(tag="important")
    assert len(tag_results) == 1
    assert tag_results[0].title == "Note A"
    
    # Filter by pinned
    pinned_results = repo.list(is_pinned=True)
    assert len(pinned_results) == 1
    assert pinned_results[0].title == "Note A"
