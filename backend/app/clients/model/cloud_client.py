from typing import TypeVar

from pydantic import BaseModel

from app.clients.cloud_api_client import CloudApiClient
from app.utils.errors import ServiceError
from shared.schemas.model import CallStructuredRequest

from .base_client import ModelClient

T = TypeVar('T', bound=BaseModel)


class CloudModelClient(ModelClient):
  def __init__(self, api_client: CloudApiClient) -> None:
    self._api_client = api_client

  async def call_structured(self, input: str, response_model: type[T]) -> T:
    data = await self._api_client.post(
      '/cloud/model/structured',
      payload=CallStructuredRequest(
        input=input,
        response_schema=response_model.model_json_schema(),
      ),
    )
    return response_model.model_validate(data)

  async def call_unstructured(self, input: str) -> str:
    output = await self._api_client.post('/cloud/model/unstructured', payload=input)
    if not output:
      raise ServiceError('Cloud model did not return any content')

    return output

  async def embed(self, texts: list[str]) -> list[list[float]]:
    data = await self._api_client.post('/cloud/model/embed', payload=texts)
    if not isinstance(data, list):
      raise ServiceError('Cloud model did not return embeddings')
    return data
