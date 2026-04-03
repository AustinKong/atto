from typing import Annotated

from fastapi import Depends

from app.clients.cloud_api_client import CloudApiClient
from app.config import settings
from app.utils.auth_context import is_authorized

from .base_client import ModelClient
from .cloud_client import CloudModelClient
from .gemini_client import GeminiModelClient
from .openai_client import OpenAIModelClient


def get_model_client(
  cloud_api_client: Annotated[CloudApiClient, Depends(CloudApiClient)],
) -> ModelClient:
  if is_authorized():
    return CloudModelClient(cloud_api_client)

  # TODO: Do proper switch-case
  if settings.model.llm.startswith('gemini'):
    return GeminiModelClient()
  return OpenAIModelClient()


__all__ = ['CloudModelClient', 'ModelClient', 'get_model_client']
