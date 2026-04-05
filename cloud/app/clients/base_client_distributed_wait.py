import asyncio
import logging
import uuid
from abc import ABC
from collections.abc import Awaitable, Callable
from functools import wraps
from typing import TypeVar, cast

from redis.asyncio import Redis

from app.utils.errors import ProviderError
from app.utils.redis_keys import provider_last_refill_key, provider_tokens_key
from app.utils.settings import settings

logger = logging.getLogger(__name__)

T = TypeVar('T')
AsyncMethod = Callable[..., Awaitable[T]]


def throttled(method: AsyncMethod[T]) -> AsyncMethod[T]:
  @wraps(method)
  async def wrapped(self, *args, **kwargs):
    await self._wait_for_slot()
    return await method(self, *args, **kwargs)

  return wrapped


class ProviderClient(ABC):
  """
  Wraps an external data provider API, owning its credentials.
  Public async methods are wrapped automatically to wait for a throttle slot.

  .. deprecated::
     This class implements a distributed throttler using Redis, but we are currently not using it
     since we only have one instance of the app running. We can re-enable it in the future if we
     need to scale to multiple instances.
  """

  provider_name: str  # Used as part of the Redis rate-limit and throttle queue keys
  bucket_capacity: int  # Max tokens the rate-limit bucket can hold
  refill_rate: float  # Tokens added per second (e.g. 1.0 = 3600/hour)

  _redis: Redis
  _script_sha: str | None = None
  _throttler_stopping: bool = False

  def __init__(self, redis: Redis) -> None:
    self._redis = redis
    self._throttler_stopping = False
    self._throttler_task: asyncio.Task | None = None

  async def __aenter__(self):
    self._throttler_task = asyncio.create_task(self.run_throttler())
    return self

  async def __aexit__(self, *_):
    self._throttler_stopping = True
    await cast(Awaitable[int], self._redis.publish(self._stop_channel, 'stop'))

    if self._throttler_task is not None:
      self._throttler_task.cancel()
      await asyncio.gather(self._throttler_task, return_exceptions=True)

  @property
  def _queue_key(self) -> str:
    return f'queue:throttle:{self.provider_name}'

  @property
  def _stop_channel(self) -> str:
    return f'stop:throttle:{self.provider_name}'

  async def _get_script_sha(self) -> str:
    if self._script_sha is None:
      self._script_sha = await cast(
        Awaitable[str],
        self._redis.script_load(_TOKEN_BUCKET_SCRIPT),
      )
    assert self._script_sha is not None
    return self._script_sha

  async def _try_consume(self) -> bool:
    sha = await self._get_script_sha()
    result = await cast(
      Awaitable[int],
      self._redis.evalsha(
        sha,
        2,
        provider_tokens_key(self.provider_name),
        provider_last_refill_key(self.provider_name),
        str(self.bucket_capacity),
        str(self.refill_rate),
      ),
    )
    return bool(result)

  async def run_throttler(self) -> None:
    while not self._throttler_stopping:
      try:
        item = await cast(
          Awaitable[list[str] | None],
          self._redis.brpop(self._queue_key, timeout=1),
        )
        if item is None:
          continue

        _, request_id = item
        wait = 1.0 / self.refill_rate if self.refill_rate > 0 else 1.0
        while not self._throttler_stopping and not await self._try_consume():
          await asyncio.sleep(wait)

        if self._throttler_stopping:
          break

        await cast(Awaitable[int], self._redis.publish(f'ready:{request_id}', 'go'))

      except asyncio.CancelledError:
        break
      except Exception as exc:
        logger.exception('ProviderClient[%s] throttler error: %s', self.provider_name, exc)
        await asyncio.sleep(1)

  async def _wait_for_slot(self) -> None:
    if self._throttler_stopping:
      raise ProviderError(f'{self.provider_name} provider is shutting down')

    request_id = str(uuid.uuid4())
    ready_channel = f'ready:{request_id}'
    pubsub = self._redis.pubsub()
    await pubsub.subscribe(ready_channel, self._stop_channel)
    try:
      if self._throttler_stopping:
        raise ProviderError(f'{self.provider_name} provider is shutting down')

      await self._redis.execute_command('LPUSH', self._queue_key, request_id)

      async with asyncio.timeout(settings.queue_timeout):
        async for message in pubsub.listen():
          if message['type'] != 'message':
            continue
          if message['channel'] == self._stop_channel:
            raise ProviderError(f'{self.provider_name} provider is shutting down')
          if message['channel'] == ready_channel:
            return
    finally:
      await pubsub.unsubscribe(ready_channel, self._stop_channel)
      await pubsub.aclose()


_TOKEN_BUCKET_SCRIPT = """
local tokens_key = KEYS[1]
local refill_key = KEYS[2]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])

local now_arr = redis.call('TIME')
local now = tonumber(now_arr[1]) + tonumber(now_arr[2]) / 1000000

local raw_tokens = redis.call('GET', tokens_key)
local raw_refill = redis.call('GET', refill_key)

local tokens = raw_tokens and tonumber(raw_tokens) or capacity
local last_refill = raw_refill and tonumber(raw_refill) or now

local elapsed = now - last_refill
local new_tokens = math.min(capacity, tokens + elapsed * refill_rate)

if new_tokens >= 1 then
  redis.call('SET', tokens_key, tostring(new_tokens - 1))
  redis.call('SET', refill_key, tostring(now))
  return 1
else
  redis.call('SET', tokens_key, tostring(new_tokens))
  redis.call('SET', refill_key, tostring(now))
  return 0
end
"""
