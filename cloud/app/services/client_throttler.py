import asyncio
import logging

from redis.asyncio import Redis

from app.utils.redis_keys import provider_last_refill_key, provider_tokens_key

logger = logging.getLogger(__name__)

# Lua script: token bucket — atomic refill + consume using server clock.
# KEYS[1] = tokens key
# KEYS[2] = last_refill key
# ARGV[1] = capacity (int)
# ARGV[2] = refill_rate (float, tokens per second)
# Returns 1 if consumed (proceed), 0 if bucket empty (queue).
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


class ClientThrottler:
  """
  Background service that serialises access to a rate-limited provider.

  One instance runs per provider client. It:
    1. Pops request IDs from the provider's queue (Redis List)
    2. Acquires a token from the provider's token bucket (Redis Lua)
    3. Signals the waiting HTTP request via Redis Pub/Sub

  The throttler has no knowledge of endpoints or request payloads — it only
  manages token acquisition and signalling. Execution stays in request context.
  """

  def __init__(self, provider_name: str, bucket_capacity: int, refill_rate: float) -> None:
    self._provider_name = provider_name
    self._bucket_capacity = bucket_capacity
    self._refill_rate = refill_rate
    self._script_sha: str | None = None

  @property
  def _queue_key(self) -> str:
    return f'queue:throttle:{self._provider_name}'

  async def _try_consume(self, redis: Redis) -> bool:
    if self._script_sha is None:
      self._script_sha = await redis.script_load(_TOKEN_BUCKET_SCRIPT)
    result = await redis.evalsha(
      self._script_sha,
      2,
      provider_tokens_key(self._provider_name),
      provider_last_refill_key(self._provider_name),
      str(self._bucket_capacity),
      str(self._refill_rate),
    )
    return bool(result)

  async def run(self, redis: Redis) -> None:
    """Run until cancelled. Processes queued request IDs one at a time."""
    while True:
      try:
        item = await redis.brpop(self._queue_key, timeout=5)
        if item is None:
          continue

        _, request_id = item

        wait = 1.0 / self._refill_rate
        while not await self._try_consume(redis):
          await asyncio.sleep(wait)

        await redis.publish(f'ready:{request_id}', 'go')

      except asyncio.CancelledError:
        break
      except Exception as exc:
        logger.exception('ClientThrottler[%s] error: %s', self._provider_name, exc)
        await asyncio.sleep(1)
