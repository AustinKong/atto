from abc import ABC, abstractmethod
from typing import TypeVar

from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class ModelClient(ABC):
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
