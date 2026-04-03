from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def run_migrations(session: AsyncSession) -> None:
  await session.execute(
    text("""
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    """)
  )
  await session.commit()
