from app.config import settings

from .base_client import ModelClient
from .gemini_client import GeminiModelClient
from .openai_client import OpenAIModelClient


def get_model_client() -> ModelClient:
  if settings.model.llm.startswith('gemini'):
    return GeminiModelClient()
  return OpenAIModelClient()


__all__ = ['ModelClient', 'get_model_client']
