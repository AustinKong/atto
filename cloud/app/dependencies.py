import uuid
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, Request
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.gemini_client import GeminiClient
from app.clients.glassdoor_client import GlassdoorClient
from app.clients.market_client import MarketClient
from app.clients.salary_client import SalaryClient
from app.db import get_db_session
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthenticatedUser
from app.services.auth_service import get_authenticated_user
from app.services.token_budget_service import TokenBudgetService
from app.utils.errors import TokenBudgetExceededError


async def get_redis(request: Request) -> Redis:
  return request.app.state.redis


def get_glassdoor_client(request: Request) -> GlassdoorClient:
  return request.app.state.glassdoor_client


def get_salary_client(request: Request) -> SalaryClient:
  return request.app.state.salary_client


def get_market_client(request: Request) -> MarketClient:
  return request.app.state.market_client


def get_gemini_client(request: Request) -> GeminiClient:
  return request.app.state.gemini_client


# Require tokens automatically verifies the user
def require_tokens(cost: int):
  async def dep(
    user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    redis: Annotated[Redis, Depends(get_redis)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
  ) -> AsyncGenerator[None, None]:
    request_id = str(uuid.uuid4())
    await UserRepository(db).get_or_provision(user.user_id)
    deducted = await TokenBudgetService(redis).check_and_deduct(user.user_id, cost, request_id)
    if not deducted:
      raise TokenBudgetExceededError(f'Token budget exceeded. Requested {cost} tokens.')
    try:
      yield
    except Exception:
      await TokenBudgetService(redis).refund(user.user_id, cost, request_id)
      raise

  return dep
