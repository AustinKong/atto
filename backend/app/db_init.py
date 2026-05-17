import sqlite3
from pathlib import Path

from app.config import settings


def create_tables(db_path: str | None = None) -> None:
  resolved_db_path = Path(db_path or settings.active_paths.db_path)
  resolved_db_path.parent.mkdir(parents=True, exist_ok=True)

  with sqlite3.connect(resolved_db_path) as db:
    db.execute("""
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        domain TEXT NOT NULL,
        location TEXT,
        description TEXT NOT NULL,
        notes TEXT,
        research JSON,
        posted_date TEXT,
        salary JSON,
        skills TEXT,
        requirements TEXT,
        keywords JSON
      )
    """)

    db.execute("""
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        sections JSON NOT NULL
      )
    """)

    db.execute("""
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL,
        name TEXT NOT NULL,
        resume_id TEXT NOT NULL,
        analysis JSON,
        current_status TEXT NOT NULL,
        last_status_at TEXT NOT NULL,
        FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
      )
    """)

    db.execute("""
      CREATE TABLE IF NOT EXISTS status_events (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        status TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        payload JSON,
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
      )
    """)

    db.commit()

  print(f'Database tables created successfully at {resolved_db_path}')


if __name__ == '__main__':
  create_tables()
