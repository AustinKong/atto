import hashlib
from typing import Annotated

from fastapi import Depends

from app.clients.gemini_client import GeminiClient
from app.dependencies import get_gemini_client
from app.endpoints.base_endpoint import BaseEndpoint
from app.schemas.model import CallUnstructuredResult


# TODO: Rename to ModelUnstructuredEndpoint or something more descriptive
class UnstructuredEndpoint(BaseEndpoint[CallUnstructuredResult, GeminiClient]):
  token_cost = 5
  cache_enabled = True
  cache_ttl = 3600
  key = 'model-unstructured'
  response_model = CallUnstructuredResult

  def __init__(self, client: Annotated[GeminiClient, Depends(get_gemini_client)]) -> None:
    self.provider_client = client

  def get_cache_key(self, params: dict[str, str]) -> str:
    input_text = params.get('input', '').strip()
    return hashlib.sha256(input_text.encode('utf-8')).hexdigest()

  async def execute(self, params: dict[str, str]) -> CallUnstructuredResult:
    output = await self.provider_client.call_unstructured(params['input'])
    return CallUnstructuredResult(output=output)
