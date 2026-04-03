def budget_key(user_id: str) -> str:
  return f'budget:{user_id}'


def provider_tokens_key(provider_name: str) -> str:
  return f'rl:provider:{provider_name}:tokens'


def provider_last_refill_key(provider_name: str) -> str:
  return f'rl:provider:{provider_name}:last_refill'


def cache_key(endpoint_key: str, cache_key_hash: str) -> str:
  return f'cache:{endpoint_key}:{cache_key_hash}'
