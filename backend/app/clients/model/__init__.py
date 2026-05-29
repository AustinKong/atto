from typing import Annotated

from fastapi import Depends

from app.clients.cloud_api_client import CloudApiClient
from app.services.config import get_settings
from app.services.config.schemas import AppConfig
from app.utils.auth_context import is_authorized

from .base_client import ModelClient
from .cloud_client import CloudModelClient
from .gemini_client import GeminiModelClient
from .openai_client import OpenAIModelClient


def get_model_client(
  cloud_api_client: Annotated[CloudApiClient, Depends()],
  config: Annotated[AppConfig, Depends(get_settings)],
) -> ModelClient:
  if is_authorized():
    return CloudModelClient(cloud_api_client)

  if config.model.provider == 'gemini':
    return GeminiModelClient(config)
  return OpenAIModelClient(config)


__all__ = ['CloudModelClient', 'ModelClient', 'get_model_client']
