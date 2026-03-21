from .base_client import LLMClient
from .local_client import LocalLLMClient


def get_llm_client() -> LLMClient:
  return LocalLLMClient()


__all__ = ['LLMClient', 'get_llm_client']
