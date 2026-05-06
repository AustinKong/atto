from typing import Annotated

from fastapi import Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.clients.database_client import get_db_session
from app.models.user import User


class UserRepository:
  def __init__(self, db_session: Annotated[AsyncSession, Depends(get_db_session)]) -> None:
    self._db_session = db_session

  async def get(self, user_id: str) -> User | None:
    return await self._db_session.get(User, user_id)

  async def get_or_provision(self, user_id: str) -> User:
    user = await self._db_session.get(User, user_id)
    if user is not None:
      return user

    user = User(id=user_id)
    self._db_session.add(user)
    await self._db_session.commit()
    await self._db_session.refresh(user)
    return user

  @staticmethod
  def has_active_subscription(record: User) -> bool:
    return record.subscription_status in {'active', 'trialing'}

  async def set_stripe_customer_id(self, user_id: str, customer_id: str) -> None:
    user = await self.get_or_provision(user_id)
    user.stripe_customer_id = customer_id
    await self._db_session.commit()

  async def set_subscription_for_customer(
    self,
    customer_id: str,
    subscription_id: str | None,
    subscription_status: str,
    plan_tier: str,
  ) -> User | None:
    stmt = select(User).where(User.stripe_customer_id == customer_id)
    user = (await self._db_session.exec(stmt)).first()
    if user is None:
      return None

    user.stripe_subscription_id = subscription_id
    user.subscription_status = subscription_status
    user.plan_tier = plan_tier
    await self._db_session.commit()
    await self._db_session.refresh(user)
    return user

  async def set_subscription_for_user(
    self,
    user_id: str,
    customer_id: str | None,
    subscription_id: str | None,
    subscription_status: str,
    plan_tier: str,
  ) -> User:
    user = await self.get_or_provision(user_id)
    if customer_id:
      user.stripe_customer_id = customer_id
    user.stripe_subscription_id = subscription_id
    user.subscription_status = subscription_status
    user.plan_tier = plan_tier
    await self._db_session.commit()
    await self._db_session.refresh(user)
    return user
