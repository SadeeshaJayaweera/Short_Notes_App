import logging
import os
from pathlib import Path

from dotenv import load_dotenv

# Path to the Short Notes App root (where .env.local lives)
ROOT_DIR = Path(__file__).parent.parent.parent.parent
ENV_PATH = ROOT_DIR / ".env.local"

# Load environment variables
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

LOG_LEVEL = os.getenv("MCP_LOG_LEVEL", "INFO")


def setup_logging() -> None:
    logging.basicConfig(
        level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
