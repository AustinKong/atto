import hashlib
import json
from typing import Annotated, Any, cast

from fastapi import Depends
from redis.asyncio import Redis

from app.clients.gemini_client import GeminiClient
from app.dependencies import get_gemini_client, get_redis
from app.utils.redis_keys import cache_key


class ModelService:
  def __init__(
    self,
    gemini: Annotated[GeminiClient, Depends(get_gemini_client)],
    redis: Annotated[Redis, Depends(get_redis)],
  ) -> None:
    self._gemini = gemini
    self._redis = redis

  async def call_structured(self, input_text: str, schema: dict[str, object]) -> dict[str, Any]:
    raw = json.dumps({'input': input_text.strip(), 'schema': schema}, sort_keys=True)
    ck = cache_key('model-structured', hashlib.sha256(raw.encode()).hexdigest())
    cached = await self._redis.get(ck)
    if cached:
      return json.loads(cached)

    output = await self._gemini.call_structured_raw(input_text, schema)
    result = json.loads(output)
    await self._redis.setex(ck, 3600, json.dumps(result))
    return result

  async def call_unstructured(self, input_text: str) -> str:
    ck = cache_key('model-unstructured', hashlib.sha256(input_text.strip().encode()).hexdigest())
    cached = await self._redis.get(ck)
    if cached:
      return cached

    result = await self._gemini.call_unstructured(input_text)
    await self._redis.setex(ck, 3600, result)
    return result

  async def embed(self, texts: list[str]) -> list[list[float]]:
    normalized = [text.strip() for text in texts]
    raw = json.dumps({'texts': normalized}, sort_keys=True)
    ck = cache_key('model-embeddings', hashlib.sha256(raw.encode()).hexdigest())
    cached = await self._redis.get(ck)
    if cached:
      return cast(list[list[float]], json.loads(cached))

    embeddings = await self._gemini.embed(normalized)
    await self._redis.setex(ck, 3600, json.dumps(embeddings))
    return embeddings
