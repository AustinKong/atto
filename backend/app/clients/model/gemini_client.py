from typing import Annotated, TypeVar, cast

from fastapi import Depends
from google import genai
from google.genai import errors as gemini_errors
from pydantic import BaseModel

from app.services.config import get_settings
from app.services.config.schemas import AppConfig
from app.utils.errors import ServiceError

from .base_client import ModelClient

T = TypeVar('T', bound=BaseModel)


class GeminiModelClient(ModelClient):
  def __init__(
    self,
    config: Annotated[AppConfig, Depends(get_settings)],
  ) -> None:
    self.config = config
    self._client = None

  @property
  def client(self) -> genai.Client:
    if not self.config.model.api_key.strip():
      raise ServiceError('Add your Gemini API key in Settings before using AI features.')

    if self._client is None:
      self._client = genai.Client(api_key=self.config.model.api_key)
    return self._client

  async def embed(self, texts: list[str]) -> list[list[float]]:
    try:
      response = await self.client.aio.models.embed_content(
        model=self.config.model.embedding,
        contents=cast(genai.types.ContentListUnion, texts),
      )
    except ServiceError:
      raise
    except Exception as exc:
      raise self._service_error(exc) from exc

    if not response.embeddings:
      raise ServiceError('The AI response was incomplete. Try again, or try a different model.')

    embeddings = []
    for embedding in response.embeddings:
      if embedding.values is None:
        raise ServiceError('The AI response was incomplete. Try again, or try a different model.')
      embeddings.append(embedding.values)

    return embeddings

  async def call_structured(
    self,
    input: str,
    response_model: type[T],
  ) -> T:
    try:
      response = await self.client.aio.models.generate_content(
        model=self.config.model.llm,
        contents=input,
        config={
          'response_mime_type': 'application/json',
          'response_json_schema': response_model.model_json_schema(),
          'temperature': self.config.model.temperature,
        },
      )
    except ServiceError:
      raise
    except Exception as exc:
      raise self._service_error(exc) from exc

    if not response.text:
      raise ServiceError('The AI response was incomplete. Try again, or try a different model.')

    try:
      return response_model.model_validate_json(response.text)
    except Exception as exc:
      raise ServiceError(
        'The AI response was incomplete. Try again, or try a different model.'
      ) from exc

  async def call_unstructured(
    self,
    input: str,
  ) -> str:
    try:
      response = await self.client.aio.models.generate_content(
        model=self.config.model.llm,
        contents=input,
        config={'temperature': self.config.model.temperature},
      )
    except ServiceError:
      raise
    except Exception as exc:
      raise self._service_error(exc) from exc

    if not response.text:
      raise ServiceError('The AI response was incomplete. Try again, or try a different model.')

    return response.text

  def _service_error(self, exc: Exception) -> ServiceError:
    if isinstance(exc, gemini_errors.APIError):
      return ServiceError(self.model_provider_error_message('Gemini', exc.code))

    return ServiceError(self.model_provider_error_message('Gemini'))
