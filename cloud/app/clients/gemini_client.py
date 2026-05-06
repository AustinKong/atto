from typing import cast

from fastapi import Request
from google import genai

from app.clients.provider_client import ProviderClient, throttled
from app.utils import errors
from app.utils.settings import settings

# FIXME: What the helly is this
_provider_error = getattr(errors, 'ProviderError', Exception)


class GeminiClient(ProviderClient):
  provider_name = 'gemini'
  bucket_capacity = 15
  refill_rate = 0.25

  def __init__(self) -> None:
    super().__init__()
    self._client: genai.Client | None = None

  @property
  def client(self) -> genai.Client:
    if self._client is None:
      self._client = genai.Client(api_key=settings.providers.gemini.api_key)
    return self._client

  @throttled
  async def call_structured_raw(self, input: str, schema: dict) -> str:
    response = await self.client.aio.models.generate_content(
      model=settings.providers.gemini.model,
      contents=input,
      config={
        'response_mime_type': 'application/json',
        'response_json_schema': schema,
        'temperature': settings.providers.gemini.temperature,
      },
    )

    if not response.text:
      raise _provider_error('Model did not return any content')

    return response.text

  @throttled
  async def call_unstructured(self, input: str) -> str:
    response = await self.client.aio.models.generate_content(
      model=settings.providers.gemini.model,
      contents=input,
      config={'temperature': settings.providers.gemini.temperature},
    )

    if not response.text:
      raise _provider_error('Model did not return any content')

    return response.text

  @throttled
  async def embed(self, texts: list[str]) -> list[list[float]]:
    response = await self.client.aio.models.embed_content(
      model=settings.providers.gemini.embedding_model,
      contents=cast(genai.types.ContentListUnion, texts),
    )

    if not response.embeddings:
      raise _provider_error('Model did not return any embeddings')

    embeddings: list[list[float]] = []
    for embedding in response.embeddings:
      if embedding.values is None:
        raise _provider_error('Model did not return embeddings for all inputs')
      embeddings.append(embedding.values)

    return embeddings


def get_gemini_client(request: Request) -> GeminiClient:
  return request.app.state.gemini_client
