from abc import ABC, abstractmethod
from typing import TypeVar

from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class ModelClient(ABC):
  def model_provider_error_message(self, provider: str, status_code: int | None = None) -> str:
    if status_code == 401:
      return f'{provider} rejected your API key. Check that it was copied correctly.'
    if status_code == 403:
      return f'{provider} accepted your key, but it cannot access the selected model.'
    if status_code == 404:
      return f'{provider} could not find the selected model. Try the default model in settings.'
    if status_code == 429:
      return f'{provider} reported a quota or rate limit issue. Check billing, usage, and limits.'
    if status_code is not None and 400 <= status_code < 500:
      return f'{provider} rejected the request. Try a different model or check your API settings.'

    return f'Atto could not reach {provider}. Check your internet connection and try again.'

  @abstractmethod
  async def embed(self, texts: list[str]) -> list[list[float]]:
    """
    Embed a list of texts into vectors.

    Args:
      texts: List of text strings to embed.

    Returns:
      List of embedding vectors (one per input text).
    """
    pass

  @abstractmethod
  async def call_structured(
    self,
    input: str,
    response_model: type[T],
  ) -> T:
    """
    Make an LLM API call with structured output.

    Args:
      input: User input string.
      response_model: Pydantic model for structured output (required).

    Returns:
      Parsed Pydantic model instance.
    """
    pass

  @abstractmethod
  async def call_unstructured(
    self,
    input: str,
  ) -> str:
    """
    Make an LLM API call with unstructured text output.

    Args:
      input: User input string.

    Returns:
      Text response from the model.
    """
    pass
