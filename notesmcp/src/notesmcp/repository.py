from typing import List, Optional
from datetime import datetime

from sqlalchemy.orm import Session

from notesmcp.schema import Note, Tag
from notesmcp.models import Note as NoteModel

import uuid

class NotesRepository:
    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id

    def create(self, title: str, content: str, tags: List[str] = None) -> NoteModel:
        note_id = uuid.uuid4().hex
        now = datetime.utcnow()
        
        # We store originalText and content as the same for MCP
        db_note = Note(
            id=note_id,
            title=title,
            originalText=content,
            summary="",
            bulletPoints=[],
            content=content,
            userId=self.user_id,
            createdAt=now,
            updatedAt=now
        )
        self.db.add(db_note)
        
        if tags:
            for tag_name in tags:
                # Find or create tag
                tag = self.db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(id=uuid.uuid4().hex, name=tag_name, createdAt=now)
                    self.db.add(tag)
                db_note.tags.append(tag)
                
        self.db.commit()
        self.db.refresh(db_note)
        
        return self._to_pydantic(db_note)

    def get(self, note_id: str) -> Optional[NoteModel]:
        """Fetch a single note by ID."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id).first()
        if not db_note:
            return None
        return self._to_pydantic(db_note)

    def update(self, note_id: str, title: Optional[str] = None, content: Optional[str] = None, tags: Optional[List[str]] = None, is_pinned: Optional[bool] = None) -> Optional[NoteModel]:
        """Update an existing note."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id).first()
        if not db_note:
            return None

        if title is not None:
            db_note.title = title
        if content is not None:
            db_note.content = content
            db_note.originalText = content
        if is_pinned is not None:
            db_note.isPinned = is_pinned
            
        if tags is not None:
            db_note.tags.clear()
            for tag_name in tags:
                tag = self.db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(id=uuid.uuid4().hex, name=tag_name, createdAt=datetime.utcnow())
                    self.db.add(tag)
                db_note.tags.append(tag)
                
        db_note.updatedAt = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_note)
        return self._to_pydantic(db_note)

    def delete(self, note_id: str) -> bool:
        """Delete a note permanently (for now, as per schema)."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id).first()
        if not db_note:
            return False
            
        self.db.delete(db_note)
        self.db.commit()
        return True

    def list(self, limit: int = 50, offset: int = 0) -> List[NoteModel]:
        """List notes with pagination."""
        notes = self.db.query(Note).filter(Note.userId == self.user_id).order_by(Note.updatedAt.desc()).offset(offset).limit(limit).all()
        return [self._to_pydantic(note) for note in notes]
        
    def _to_pydantic(self, db_note: Note) -> NoteModel:
        return NoteModel(
            id=db_note.id,
            title=db_note.title,
            content=db_note.content,
            tags=[t.name for t in db_note.tags],
            created_at=db_note.createdAt,
            updated_at=db_note.updatedAt,
            is_pinned=db_note.isPinned
        )
