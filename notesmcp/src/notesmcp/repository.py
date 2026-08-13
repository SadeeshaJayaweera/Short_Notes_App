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

    def get(self, note_id: str, include_deleted: bool = False) -> Optional[NoteModel]:
        """Fetch a single note by ID."""
        query = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id)
        if not include_deleted:
            query = query.filter(Note.deletedAt == None)
        db_note = query.first()
        if not db_note:
            return None
        return self._to_pydantic(db_note)

    def update(self, note_id: str, title: Optional[str] = None, content: Optional[str] = None, tags: Optional[List[str]] = None, is_pinned: Optional[bool] = None) -> Optional[NoteModel]:
        """Update an existing note."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id, Note.deletedAt == None).first()
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
        """Soft delete a note."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id, Note.deletedAt == None).first()
        if not db_note:
            return False
            
        db_note.deletedAt = datetime.utcnow()
        self.db.commit()
        return True

    def restore(self, note_id: str) -> bool:
        """Restore a soft-deleted note."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id, Note.deletedAt != None).first()
        if not db_note:
            return False
            
        db_note.deletedAt = None
        db_note.updatedAt = datetime.utcnow()
        self.db.commit()
        return True

    def list(
        self, 
        limit: int = 50, 
        offset: int = 0, 
        search: Optional[str] = None,
        tag: Optional[str] = None,
        is_pinned: Optional[bool] = None
    ) -> List[NoteModel]:
        """List notes with advanced pagination, search, and filtering."""
        query = self.db.query(Note).filter(Note.userId == self.user_id, Note.deletedAt == None)
        
        if search:
            # Simple ILIKE search on title and content
            search_term = f"%{search}%"
            query = query.filter((Note.title.ilike(search_term)) | (Note.content.ilike(search_term)))
            
        if tag:
            query = query.filter(Note.tags.any(Tag.name == tag))
            
        if is_pinned is not None:
            query = query.filter(Note.isPinned == is_pinned)
            
        notes = query.order_by(Note.updatedAt.desc()).offset(offset).limit(limit).all()
        return [self._to_pydantic(note) for note in notes]

    def add_tag(self, note_id: str, tag_name: str) -> Optional[NoteModel]:
        """Atomically add a single tag to a note."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id, Note.deletedAt == None).first()
        if not db_note:
            return None
            
        if not any(t.name == tag_name for t in db_note.tags):
            tag = self.db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(id=uuid.uuid4().hex, name=tag_name, createdAt=datetime.utcnow())
                self.db.add(tag)
            db_note.tags.append(tag)
            db_note.updatedAt = datetime.utcnow()
            self.db.commit()
            self.db.refresh(db_note)
            
        return self._to_pydantic(db_note)

    def remove_tag(self, note_id: str, tag_name: str) -> Optional[NoteModel]:
        """Atomically remove a single tag from a note."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id, Note.deletedAt == None).first()
        if not db_note:
            return None
            
        db_note.tags = [t for t in db_note.tags if t.name != tag_name]
        db_note.updatedAt = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_note)
        return self._to_pydantic(db_note)

    def set_pinned(self, note_id: str, is_pinned: bool) -> Optional[NoteModel]:
        """Atomically update the pinned status of a note."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id, Note.deletedAt == None).first()
        if not db_note:
            return None
            
        if db_note.isPinned != is_pinned:
            db_note.isPinned = is_pinned
            db_note.updatedAt = datetime.utcnow()
            self.db.commit()
            self.db.refresh(db_note)
        return self._to_pydantic(db_note)
        
    def summarize_note(self, note_id: str) -> Optional[NoteModel]:
        """Generate a simple summary and auto-tag based on content keywords."""
        db_note = self.db.query(Note).filter(Note.id == note_id, Note.userId == self.user_id, Note.deletedAt == None).first()
        if not db_note:
            return None
            
        content = db_note.content or ""
        keywords = {"urgent": "urgent", "todo": "todo", "meeting": "meeting", "idea": "idea", "bug": "bug"}
        
        added_tags = []
        content_lower = content.lower()
        for kw, tag_name in keywords.items():
            if kw in content_lower and not any(t.name == tag_name for t in db_note.tags):
                tag = self.db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(id=uuid.uuid4().hex, name=tag_name, createdAt=datetime.utcnow())
                    self.db.add(tag)
                db_note.tags.append(tag)
                added_tags.append(tag_name)
                
        if added_tags:
            db_note.updatedAt = datetime.utcnow()
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
