import asyncio
from contextlib import asynccontextmanager

import httpx
import redis.asyncio as aioredis
from fastapi import FastAPI
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware

from app.clients.gemini_client import GeminiClient
from app.clients.glassdoor_client import GlassdoorClient
from app.clients.market_client import MarketClient
from app.clients.salary_client import SalaryClient
from app.db import AsyncSessionLocal, engine
from app.exception_handlers.handlers import (
  auth_error_handler,
  provider_error_handler,
  timeout_handler,
  token_budget_handler,
)
from app.middleware.logging import exception_logging_middleware
from app.routers.model_router import router as model_router
from app.routers.research_router import router as research_router
from app.utils.errors import AuthError, ProviderError, TokenBudgetExceededError
from app.utils.settings import settings


async def run_migrations(session) -> None:
  await session.execute(
    text(
      """
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
      """
    )
  )
  await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
  app.state.redis = await aioredis.from_url(settings.redis.url, decode_responses=True)
  app.state.http_client = httpx.AsyncClient()

  async with AsyncSessionLocal() as session:
    await run_migrations(session)

  app.state.glassdoor_client = GlassdoorClient(app.state.http_client)
  app.state.salary_client = SalaryClient(app.state.http_client)
  app.state.market_client = MarketClient(app.state.http_client)
  app.state.gemini_client = GeminiClient()

  yield

  await app.state.redis.aclose()
  await app.state.http_client.aclose()
  await engine.dispose()


def create_app() -> FastAPI:
  app = FastAPI(title='cloud', lifespan=lifespan)

  app.include_router(research_router)
  app.include_router(model_router)

  app.add_middleware(BaseHTTPMiddleware, dispatch=exception_logging_middleware)

  app.add_exception_handler(TokenBudgetExceededError, token_budget_handler)
  app.add_exception_handler(AuthError, auth_error_handler)
  app.add_exception_handler(ProviderError, provider_error_handler)
  app.add_exception_handler(asyncio.TimeoutError, timeout_handler)

  return app
