from typing import TypeVar

from openai import (
  APIConnectionError,
  APIStatusError,
  AsyncOpenAI,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
)
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
    if not settings.model.api_key.strip():
      raise ServiceError('Add your OpenAI API key in Settings before using AI features.')

    if self._client is None:
      self._client = AsyncOpenAI(api_key=settings.model.api_key)
    return self._client

  async def embed(self, texts: list[str]) -> list[list[float]]:
    try:
      response = await self.client.embeddings.create(
        model=settings.model.embedding,
        input=texts,
      )
      return [item.embedding for item in response.data]
    except ServiceError:
      raise
    except Exception as exc:
      raise self._service_error(exc) from exc

  async def call_structured(
    self,
    input: str,
    response_model: type[T],
  ) -> T:
    try:
      response = await self.client.responses.parse(
        model=settings.model.llm,
        input=input,
        text_format=response_model,
        temperature=settings.model.temperature,
      )
    except ServiceError:
      raise
    except Exception as exc:
      raise self._service_error(exc) from exc

    if not response.output_parsed:
      raise ServiceError(
        'The AI response was incomplete. Try again, or try a different model.'
      )

    return response.output_parsed

  async def call_unstructured(
    self,
    input: str,
  ) -> str:
    try:
      response = await self.client.responses.create(
        model=settings.model.llm,
        input=input,
        temperature=settings.model.temperature,
      )
      return response.output_text
    except ServiceError:
      raise
    except Exception as exc:
      raise self._service_error(exc) from exc

  def _service_error(self, exc: Exception) -> ServiceError:
    if isinstance(exc, AuthenticationError):
      message = self.model_provider_error_message('OpenAI', 401)
    elif isinstance(exc, PermissionDeniedError):
      message = self.model_provider_error_message('OpenAI', 403)
    elif isinstance(exc, RateLimitError):
      message = self.model_provider_error_message('OpenAI', 429)
    elif isinstance(exc, APIStatusError):
      message = self.model_provider_error_message('OpenAI', exc.status_code)
    elif isinstance(exc, APIConnectionError):
      message = self.model_provider_error_message('OpenAI')
    else:
      message = 'OpenAI returned an unexpected error. Try again in a moment.'

    return ServiceError(message)
