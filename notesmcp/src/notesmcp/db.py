from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from notesmcp.config import DATABASE_URL

# Prisma's DATABASE_URL might start with postgres:// or postgresql://
# SQLAlchemy requires postgresql://
db_url = DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency to get the database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
