import time
import uuid

from redis.asyncio import Redis

from app.utils.redis_keys import budget_key
from app.utils.settings import settings

# Lua script: atomically check budget and conditionally deduct.
# KEYS[1] = budget sorted set key
# ARGV[1] = now_ms (current timestamp in ms)
# ARGV[2] = window_start_ms (oldest allowed timestamp)
# ARGV[3] = cost (int, tokens to deduct)
# ARGV[4] = budget (int, max tokens allowed in window)
# ARGV[5] = new_member (string: "{ts_ms}:{cost}:{request_id}")
# Returns 1 if deducted, 0 if budget exceeded.
_CHECK_AND_DEDUCT_SCRIPT = """
local key = KEYS[1]
local now_ms = tonumber(ARGV[1])
local window_start_ms = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local budget = tonumber(ARGV[4])
local new_member = ARGV[5]

-- Evict expired entries
redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start_ms - 1)

-- Sum costs in the current window
local members = redis.call('ZRANGEBYSCORE', key, window_start_ms, '+inf')
local current_usage = 0
for _, m in ipairs(members) do
  local parts = {}
  for part in string.gmatch(m, '([^:]+)') do
    table.insert(parts, part)
  end
  if #parts >= 2 then
    current_usage = current_usage + tonumber(parts[2])
  end
end

-- Deduct if within budget
if current_usage + cost <= budget then
  redis.call('ZADD', key, now_ms, new_member)
  return 1
end
return 0
"""


class TokenBudgetService:
  def __init__(self, redis: Redis) -> None:
    self._redis = redis
    self._script_sha: str | None = None

  async def _get_sha(self) -> str:
    if self._script_sha is None:
      self._script_sha = await self._redis.script_load(_CHECK_AND_DEDUCT_SCRIPT)
    return self._script_sha

  async def check_and_deduct(self, user_id: str, cost: int, request_id: str) -> bool:
    """
    Atomically check the user's sliding window budget and deduct tokens if sufficient.
    Returns True if tokens were deducted, False if budget would be exceeded.
    """
    now_ms = int(time.time() * 1000)
    window_start_ms = now_ms - (settings.token_window * 1000)
    new_member = f'{now_ms}:{cost}:{request_id}'
    sha = await self._get_sha()

    result = await self._redis.evalsha(
      sha,
      1,
      budget_key(user_id),
      str(now_ms),
      str(window_start_ms),
      str(cost),
      str(settings.default_token_budget),
      new_member,
    )
    return bool(result)

  async def refund(self, user_id: str, cost: int, request_id: str) -> None:
    """Remove a specific spend event by request_id (used on pre-execution failures)."""
    # We don't know the exact ts_ms, so scan members for this request_id
    key = budget_key(user_id)
    members = await self._redis.zrange(key, 0, -1, withscores=False)
    to_remove = [m for m in members if m.endswith(f':{request_id}')]
    if to_remove:
      await self._redis.zrem(key, *to_remove)

  async def get_usage(self, user_id: str) -> int:
    """Return total tokens used within the current sliding window."""
    now_ms = int(time.time() * 1000)
    window_start_ms = now_ms - (settings.token_window * 1000)
    key = budget_key(user_id)
    await self._redis.zremrangebyscore(key, '-inf', window_start_ms - 1)
    members = await self._redis.zrangebyscore(key, window_start_ms, '+inf')
    total = 0
    for m in members:
      parts = m.split(':')
      if len(parts) >= 2:
        try:
          total += int(parts[1])
        except ValueError:
          pass
    return total
