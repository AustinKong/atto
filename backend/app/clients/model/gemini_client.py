from typing import TypeVar, cast

from google import genai
from pydantic import BaseModel

from app.config import settings
from app.utils.errors import ServiceError

from .base_client import ModelClient

T = TypeVar('T', bound=BaseModel)


class GeminiModelClient(ModelClient):
  def __init__(self):
    self._client = None

  @property
  def client(self) -> genai.Client:
    if self._client is None:
      self._client = genai.Client(api_key=settings.model.api_key)
    return self._client

  async def embed(self, texts: list[str]) -> list[list[float]]:
    response = await self.client.aio.models.embed_content(
      model=settings.model.embedding,
      contents=cast(genai.types.ContentListUnion, texts),
    )

    if not response.embeddings:
      raise ServiceError('Model did not return any embeddings')

    embeddings = []
    for embedding in response.embeddings:
      if embedding.values is None:
        raise ServiceError('Model did not return embeddings for all inputs')
      embeddings.append(embedding.values)

    return embeddings

  async def call_structured(
    self,
    input: str,
    response_model: type[T],
  ) -> T:
    response = await self.client.aio.models.generate_content(
      model=settings.model.llm,
      contents=input,
      config={
        'response_mime_type': 'application/json',
        'response_json_schema': response_model.model_json_schema(),
        'temperature': settings.model.temperature,
      },
    )

    if not response.text:
      raise ServiceError('Model did not return any content')

    return response_model.model_validate_json(response.text)

  async def call_unstructured(
    self,
    input: str,
  ) -> str:
    response = await self.client.aio.models.generate_content(
      model=settings.model.llm,
      contents=input,
      config={'temperature': settings.model.temperature},
    )

    if not response.text:
      raise ServiceError('Model did not return any content')

    return response.text
