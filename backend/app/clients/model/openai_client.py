from typing import TypeVar

from openai import AsyncOpenAI
from pydantic import BaseModel

from app.config import settings
from app.utils.errors import ServiceError

from .base_client import ModelClient

T = TypeVar('T', bound=BaseModel)


class OpenAIModelClient(ModelClient):
  def __init__(self):
    self._client = None

  @property
  def client(self) -> AsyncOpenAI:
    if self._client is None:
      self._client = AsyncOpenAI(api_key=settings.model.api_key)
    return self._client

  async def embed(self, texts: list[str]) -> list[list[float]]:
    response = await self.client.embeddings.create(
      model=settings.model.embedding,
      input=texts,
    )
    return [item.embedding for item in response.data]

  async def call_structured(
    self,
    input: str,
    response_model: type[T],
  ) -> T:
    response = await self.client.responses.parse(
      model=settings.model.llm,
      input=input,
      text_format=response_model,
      temperature=settings.model.temperature,
    )

    if not response.output_parsed:
      raise ServiceError('Model did not return valid structured output')

    return response.output_parsed

  async def call_unstructured(
    self,
    input: str,
  ) -> str:
    response = await self.client.responses.create(
      model=settings.model.llm,
      input=input,
      temperature=settings.model.temperature,
    )
    return response.output_text
