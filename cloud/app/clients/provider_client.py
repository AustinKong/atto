from abc import ABC
from functools import wraps

from aiolimiter import AsyncLimiter


def throttled(func):
  @wraps(func)
  async def wrapper(self, *args, **kwargs):
    async with self._limiter:
      return await func(self, *args, **kwargs)

  return wrapper


class ProviderClient(ABC):
  provider_name: str
  bucket_capacity: int  # Max tokens the rate-limit bucket can hold
  refill_rate: float  # Tokens added per second (e.g. 1.0 = 3600/hour)

  _limiter: AsyncLimiter

  def __init__(self) -> None:
    if self.refill_rate <= 0:
      raise ValueError(f'{self.__class__.__name__} refill_rate must be > 0')

    period_seconds = self.bucket_capacity / self.refill_rate
    self._limiter = AsyncLimiter(max_rate=self.bucket_capacity, time_period=period_seconds)
