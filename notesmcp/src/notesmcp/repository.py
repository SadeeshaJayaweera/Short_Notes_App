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
