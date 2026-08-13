from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Note(BaseModel):
    id: str = Field(..., description="Unique identifier for the note")
    title: str = Field(..., description="Title of the note")
    content: str = Field(..., description="Main content/body of the note")
    tags: List[str] = Field(default_factory=list, description="List of tags associated with the note")
    created_at: datetime = Field(..., description="When the note was created")
    updated_at: datetime = Field(..., description="When the note was last updated")
    is_pinned: bool = Field(default=False, description="Whether the note is pinned")
