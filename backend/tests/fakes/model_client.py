from dataclasses import dataclass, field
from typing import Any, TypeVar, cast

from pydantic import BaseModel

from app.clients.model import ModelClient

T = TypeVar('T', bound=BaseModel)


@dataclass(frozen=True)
class StructuredModelCall:
  input: str
  response_model: type[BaseModel]


@dataclass(frozen=True)
class EmbeddingModelCall:
  texts: list[str]


@dataclass(frozen=True)
class UnstructuredModelCall:
  input: str


@dataclass
class FakeModelClient(ModelClient):
  structured_responses: list[BaseModel | dict[str, Any]] = field(default_factory=list)
  embeddings_by_text: dict[str, list[float]] = field(default_factory=dict)
  unstructured_responses: list[str] = field(default_factory=list)

  structured_calls: list[StructuredModelCall] = field(default_factory=list)
  embedding_calls: list[EmbeddingModelCall] = field(default_factory=list)
  unstructured_calls: list[UnstructuredModelCall] = field(default_factory=list)

  async def embed(self, texts: list[str]) -> list[list[float]]:
    self.embedding_calls.append(EmbeddingModelCall(texts=texts))
    embeddings: list[list[float]] = []
    for text in texts:
      if text not in self.embeddings_by_text:
        raise AssertionError(f'No fake embedding configured for text: {text}')
      embeddings.append(self.embeddings_by_text[text])
    return embeddings

  async def call_structured(
    self,
    input: str,
    response_model: type[T],
  ) -> T:
    self.structured_calls.append(
      StructuredModelCall(input=input, response_model=cast(type[BaseModel], response_model))
    )
    if not self.structured_responses:
      raise AssertionError(f'No fake structured response queued for {response_model.__name__}.')

    response = self.structured_responses.pop(0)
    if isinstance(response, response_model):
      return response

    return response_model.model_validate(response)

  async def call_unstructured(
    self,
    input: str,
  ) -> str:
    self.unstructured_calls.append(UnstructuredModelCall(input=input))
    if not self.unstructured_responses:
      raise AssertionError('No fake unstructured response queued.')
    return self.unstructured_responses.pop(0)

  def queue_structured(self, *responses: BaseModel | dict[str, Any]) -> None:
    self.structured_responses.extend(responses)

  def queue_unstructured(self, *responses: str) -> None:
    self.unstructured_responses.extend(responses)

  def set_embedding(self, text: str, embedding: list[float]) -> None:
    self.embeddings_by_text[text] = embedding
