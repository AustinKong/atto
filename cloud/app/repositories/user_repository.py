from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass
class UserRecord:
  id: str
  created_at: datetime


class UserRepository:
  def __init__(self, session: AsyncSession) -> None:
    self._session = session

  async def get(self, user_id: str) -> UserRecord | None:
    result = await self._session.execute(
      text('SELECT id, created_at FROM users WHERE id = :id'),
      {'id': user_id},
    )
    row = result.fetchone()
    if row is None:
      return None
    return UserRecord(id=row.id, created_at=row.created_at)

  async def get_or_provision(self, user_id: str) -> UserRecord:
    """Insert if not exists, then return the record."""
    await self._session.execute(
      text('INSERT INTO users (id) VALUES (:id) ON CONFLICT (id) DO NOTHING'),
      {'id': user_id},
    )
    await self._session.commit()
    result = await self._session.execute(
      text('SELECT id, created_at FROM users WHERE id = :id'),
      {'id': user_id},
    )
    row = result.fetchone()
    return UserRecord(id=row.id, created_at=row.created_at)
