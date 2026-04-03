import asyncio
import uuid
from typing import Any, TypeVar

from pydantic import BaseModel
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.endpoints.base_endpoint import BaseEndpoint
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthenticatedUser
from app.services.token_budget_service import TokenBudgetService
from app.utils.errors import TokenBudgetExceededError
from app.utils.redis_keys import cache_key
from app.utils.settings import settings

T = TypeVar('T', bound=BaseModel)


# TODO: Can raw fns use Depends()? If so, avoid passing Redis and DB around manually
async def handle_request(
  user: AuthenticatedUser,
  endpoint: BaseEndpoint[T, Any],
  params: dict[str, str],
  redis: Redis,
  db: AsyncSession,
) -> T:
  """
  Central request flow:
    1. Load/provision user in DB
    2. Check + deduct token budget (sliding window, atomic Lua)
    3. Check cache (if enabled)
    4. Enqueue and wait for ClientThrottler signal, then execute
    5. Store result in cache
    6. Refund tokens on failure
  """
  request_id = str(uuid.uuid4())
  budget_service = TokenBudgetService(redis)
  await UserRepository(db).get_or_provision(user.user_id)

  deducted = await budget_service.check_and_deduct(user.user_id, endpoint.token_cost, request_id)
  if not deducted:
    raise TokenBudgetExceededError(
      f'Token budget exceeded. Requested {endpoint.token_cost} tokens.'
    )

  try:
    if endpoint.cache_enabled:
      ck = cache_key(endpoint.key, endpoint.get_cache_key(params))
      cached_raw = await redis.get(ck)
      if cached_raw:
        return endpoint.response_model.model_validate_json(cached_raw)

    await _wait_for_throttler(redis, endpoint.provider_client.provider_name, request_id)

    result = await endpoint.execute(params)

    if endpoint.cache_enabled:
      ck = cache_key(endpoint.key, endpoint.get_cache_key(params))
      await redis.setex(ck, endpoint.cache_ttl, result.model_dump_json(by_alias=True))

    return result

  except Exception:
    await budget_service.refund(user.user_id, endpoint.token_cost, request_id)
    raise


async def _wait_for_throttler(redis: Redis, provider_name: str, request_id: str) -> None:
  """Subscribe to the ready channel, enqueue, and block until the throttler signals."""
  channel = f'ready:{request_id}'
  pubsub = redis.pubsub()
  await pubsub.subscribe(channel)
  try:
    # Subscribe before pushing to avoid a race where the throttler signals before we listen
    await redis.lpush(f'queue:throttle:{provider_name}', request_id)
    async with asyncio.timeout(settings.queue_timeout):
      async for message in pubsub.listen():
        if message['type'] == 'message':
          return
  finally:
    await pubsub.unsubscribe(channel)
    await pubsub.aclose()
