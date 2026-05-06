from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.clients.database_client import engine
from app.models import User


async def run_migrations(session: AsyncSession) -> None:
  _ = User
  async with engine.begin() as conn:
    await conn.run_sync(SQLModel.metadata.create_all)
  await session.commit()
