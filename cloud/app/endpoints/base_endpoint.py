from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from pydantic import BaseModel

from app.clients.base_client import ProviderClient

T = TypeVar('T', bound=BaseModel)
C = TypeVar('C', bound=ProviderClient)


class BaseEndpoint(ABC, Generic[T, C]):
  """
  A gateway endpoint that wraps a provider client call with caching and token cost metadata.

  Each concrete endpoint sets its own token_cost, cache_enabled, cache_ttl, key, and
  response_model, and implements get_cache_key() to derive a deterministic cache key
  from request params.
  """

  token_cost: int              # Tokens deducted from the user's budget per call
  cache_enabled: bool          # Whether responses can be cached in Redis
  cache_ttl: int               # Cache TTL in seconds
  key: str                     # Short identifier used as part of the Redis cache key
  response_model: type[T]      # Pydantic model used to deserialize cached/queued results
  provider_client: C

  @abstractmethod
  def get_cache_key(self, params: dict[str, str]) -> str:
    """Return a deterministic cache key string derived from the given request params."""
    ...

  @abstractmethod
  async def execute(self, params: dict[str, str]) -> T:
    """Call the provider and return a validated response model."""
    ...
