from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from notesmcp.db import Base

note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('noteId', String, ForeignKey('notes.id', ondelete='CASCADE'), primary_key=True),
    Column('tagId', String, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Tag(Base):
    __tablename__ = 'tags'

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, default="gray")
    createdAt = Column(DateTime)

    notes = relationship('Note', secondary=note_tags, back_populates='tags')

class Note(Base):
    __tablename__ = 'notes'

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    originalText = Column(String, nullable=False)
    summary = Column(String, nullable=False)
    bulletPoints = Column(ARRAY(String))
    content = Column(String, nullable=False)
    userId = Column(String, nullable=False)  # We will map this to a default user or handle auth
    folderId = Column(String, nullable=True)
    sourceType = Column(String, default="manual")
    fileName = Column(String, nullable=True)
    isPinned = Column(Boolean, default=False)
    isFavorite = Column(Boolean, default=False)
    color = Column(String, default="white")
    sentiment = Column(String, nullable=True)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)
    deletedAt = Column(DateTime, nullable=True)

    tags = relationship('Tag', secondary=note_tags, back_populates='notes')
