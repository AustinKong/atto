from google import genai

from app.clients.base_client import ProviderClient
from app.utils.errors import ProviderError
from app.utils.settings import settings


class GeminiClient(ProviderClient):
  provider_name = 'gemini'
  bucket_capacity = 15
  refill_rate = 0.25

  def __init__(self) -> None:
    self._client: genai.Client | None = None

  @property
  def client(self) -> genai.Client:
    if self._client is None:
      self._client = genai.Client(api_key=settings.gemini_api_key)
    return self._client

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

  async def call_unstructured(self, input: str) -> str:
    response = await self.client.aio.models.generate_content(
      model=settings.gemini_model,
      contents=input,
      config={'temperature': settings.gemini_temperature},
    )

    if not response.text:
      raise ProviderError('Model did not return any content')

    return response.text
