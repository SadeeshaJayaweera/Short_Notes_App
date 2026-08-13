from typing import List, Optional
from datetime import datetime

from sqlalchemy.orm import Session

from notesmcp.schema import Note, Tag
from notesmcp.models import Note as NoteModel

class NotesRepository:
    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id
