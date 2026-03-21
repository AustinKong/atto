from typing import TypeVar

import instructor
from pydantic import BaseModel

from app.config import settings

from .base_client import LLMClient

T = TypeVar('T', bound=BaseModel)


class LocalLLMClient(LLMClient):
  def __init__(self):
    self._client = None

  @property
  def client(self):
    if self._client is None:
      self._client = instructor.from_provider(
        model=settings.model.llm,
        async_client=True,
        api_key=settings.model.api_key,
      )

    return self._client

  async def call_structured(
    self,
    input: str,
    response_model: type[T],
  ) -> T:
    response = await self.client.create(
      response_model=response_model,
      messages=[{'role': 'user', 'content': input}],
      temperature=settings.model.temperature,
    )

    assert isinstance(response, response_model), (
      f'Expected {response_model.__name__}, got {type(response).__name__}'
    )
    return response

  async def call_unstructured(
    self,
    input: str,
  ) -> str:
    response = await self.client.create(
      response_model=str,
      messages=[{'role': 'user', 'content': input}],
      temperature=settings.model.temperature,
    )

    assert isinstance(response, str), f'Expected str, got {type(response).__name__}'
    return response
