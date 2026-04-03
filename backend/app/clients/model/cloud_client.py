from typing import TypeVar

from pydantic import BaseModel

from app.clients.cloud_api_client import CloudApiClient
from app.utils.errors import ServiceError

from .base_client import ModelClient

T = TypeVar('T', bound=BaseModel)


class CloudModelClient(ModelClient):
  def __init__(self, api_client: CloudApiClient) -> None:
    self._api_client = api_client

  async def call_structured(self, input: str, response_model: type[T]) -> T:
    payload = {
      'input': input,
      'response_schema': response_model.model_json_schema(),
    }

    data = await self._api_client.post_json('/cloud/model/structured', payload)
    output = data.get('output')
    if not output:
      raise ServiceError('Cloud model did not return any content')

    return response_model.model_validate_json(output)

  async def call_unstructured(self, input: str) -> str:
    payload = {'input': input}
    data = await self._api_client.post_json('/cloud/model/unstructured', payload)
    output = data.get('output')
    if not output:
      raise ServiceError('Cloud model did not return any content')

    return output

  async def embed(self, texts: list[str]) -> list[list[float]]:
    raise NotImplementedError('Cloud client does not support embeddings')
