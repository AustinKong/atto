from abc import ABC


class ProviderClient(ABC):
  """
  Wraps an external data provider API, owning its credentials.

  Subclasses expose domain-specific async methods rather than a generic call().
  The metadata fields are read by ClientThrottler and the rate limiter service.
  """

  provider_name: str    # Used as part of the Redis rate-limit and throttle queue keys
  bucket_capacity: int  # Max tokens the rate-limit bucket can hold
  refill_rate: float    # Tokens added per second (e.g. 1.0 = 3600/hour)
