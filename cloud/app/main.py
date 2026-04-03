import asyncio
from contextlib import asynccontextmanager

import httpx
import redis.asyncio as aioredis
from fastapi import FastAPI
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
from app.seed import run_migrations
from app.services.client_throttler import ClientThrottler
from app.utils.errors import AuthError, ProviderError, TokenBudgetExceededError
from app.utils.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
  # Lifecycle resources
  app.state.redis = await aioredis.from_url(settings.redis.url, decode_responses=True)
  app.state.http_client = httpx.AsyncClient()

  async with AsyncSessionLocal() as session:
    await run_migrations(session)

  async with httpx.AsyncClient() as http:
    response = await http.get(settings.clerk.jwks_url)
    response.raise_for_status()
    app.state.jwks_cache = {k['kid']: k for k in response.json().get('keys', [])}

  app.state.gemini_client = GeminiClient()

  throttler_tasks = [
    asyncio.create_task(
      ClientThrottler(client.provider_name, client.bucket_capacity, client.refill_rate).run(
        app.state.redis
      )
    )
    for client in [GlassdoorClient, SalaryClient, MarketClient, GeminiClient]
  ]

  yield

  for task in throttler_tasks:
    task.cancel()
  await asyncio.gather(*throttler_tasks, return_exceptions=True)
  await app.state.redis.aclose()
  await app.state.http_client.aclose()
  await engine.dispose()


def create_app() -> FastAPI:
  app = FastAPI(title='atto-cloud', lifespan=lifespan)

  app.include_router(research_router)
  app.include_router(model_router)

  app.add_middleware(BaseHTTPMiddleware, dispatch=exception_logging_middleware)

  app.add_exception_handler(TokenBudgetExceededError, token_budget_handler)
  app.add_exception_handler(AuthError, auth_error_handler)
  app.add_exception_handler(ProviderError, provider_error_handler)
  app.add_exception_handler(asyncio.TimeoutError, timeout_handler)

  return app
