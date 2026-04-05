from typing import cast

from google import genai

from app.clients.base_client import ProviderClient, throttled
from app.utils.errors import ProviderError
from app.utils.settings import settings


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
      self._client = genai.Client(api_key=settings.gemini_api_key)
    return self._client

  @throttled
  async def call_structured_raw(self, input: str, schema: dict) -> str:
    response = await self.client.aio.models.generate_content(
      model=settings.gemini_model,
      contents=input,
      config={
        'response_mime_type': 'application/json',
        'response_json_schema': schema,
        'temperature': settings.gemini_temperature,
      },
    )

    if not response.text:
      raise ProviderError('Model did not return any content')

    return response.text

  @throttled
  async def call_unstructured(self, input: str) -> str:
    response = await self.client.aio.models.generate_content(
      model=settings.gemini_model,
      contents=input,
      config={'temperature': settings.gemini_temperature},
    )

    if not response.text:
      raise ProviderError('Model did not return any content')

    return response.text

  @throttled
  async def embed(self, texts: list[str]) -> list[list[float]]:
    response = await self.client.aio.models.embed_content(
      model=settings.gemini_embedding_model,
      contents=cast(genai.types.ContentListUnion, texts),
    )

    if not response.embeddings:
      raise ProviderError('Model did not return any embeddings')

    embeddings: list[list[float]] = []
    for embedding in response.embeddings:
      if embedding.values is None:
        raise ProviderError('Model did not return embeddings for all inputs')
      embeddings.append(embedding.values)

    return embeddings
