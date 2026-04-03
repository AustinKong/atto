import hashlib
import json
from typing import Annotated

from fastapi import Depends

from app.clients.gemini_client import GeminiClient
from app.dependencies import get_gemini_client
from app.endpoints.base_endpoint import BaseEndpoint
from app.schemas.model import CallStructuredResult


class StructuredEndpoint(BaseEndpoint[CallStructuredResult, GeminiClient]):
  token_cost = 8
  cache_enabled = True
  cache_ttl = 3600
  key = 'model-structured'
  response_model = CallStructuredResult

  def __init__(self, client: Annotated[GeminiClient, Depends(get_gemini_client)]) -> None:
    self.provider_client = client

  def get_cache_key(self, params: dict[str, str]) -> str:
    input_text = params.get('input', '').strip()
    schema_raw = params.get('schema', '')
    schema = json.loads(schema_raw) if schema_raw else {}
    raw = json.dumps({'input': input_text, 'schema': schema}, sort_keys=True)
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

  async def execute(self, params: dict[str, str]) -> CallStructuredResult:
    schema = json.loads(params['schema'])
    output = await self.provider_client.call_structured_raw(params['input'], schema)
    return CallStructuredResult(output=output)
