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
