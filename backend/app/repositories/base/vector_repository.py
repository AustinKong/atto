from typing import Annotated, Any, cast
from uuid import uuid4

import chromadb
from chromadb.api.types import Embedding, Metadata
from fastapi import Depends

from app.clients.model import ModelClient, get_model_client
from app.config import settings
from app.utils.errors import ServiceError


class VectorRepository:
  def __init__(
    self,
    model_client: Annotated[ModelClient, Depends(get_model_client)],
  ):
    self.model_client = model_client
    self._chroma_client = None
    self._collection_cache: dict[str, chromadb.Collection] = {}

  @property
  def chroma_client(self):
    if self._chroma_client is None:
      try:
        self._chroma_client = chromadb.PersistentClient(path=settings.paths.vector_path)
      except Exception as e:
        raise ServiceError(f'Failed to initialize ChromaDB client: {str(e)}') from e
    return self._chroma_client

  def _get_collection(self, collection_name: str) -> chromadb.Collection:
    """
    Get or create a collection with cosine similarity.

    Note:
      Distance metric is hardcoded to 'cosine' because our similarity calculation
      (similarity = 1 - distance) only works correctly with cosine distance.
    """
    if collection_name not in self._collection_cache:
      try:
        self._collection_cache[collection_name] = self.chroma_client.get_or_create_collection(
          name=collection_name,
          metadata={'hnsw:space': 'cosine'},
        )
      except Exception as e:
        raise ServiceError(f'Failed to get or create collection {collection_name}: {str(e)}') from e
    return self._collection_cache[collection_name]

  async def add_documents(
    self,
    collection_name: str,
    documents: list[str],
    metadatas: list[Metadata] | None = None,
  ) -> None:
    """
    Add documents to a collection. Embeddings are generated via the model client.

    Args:
      collection_name: Name of the collection.
      documents: List of text strings to add.
      metadatas: Optional list of metadata dicts (one per document).
        Each metadata dict can contain str, int, float, bool, or None values.
    """
    if not documents:
      return

    try:
      collection = self._get_collection(collection_name)
      ids = [str(uuid4()) for _ in documents]
      embeddings = cast(list[Embedding], await self.model_client.embed(documents))

      collection.add(
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids,
      )
    except ServiceError:
      raise
    except Exception as e:
      msg = f'Failed to add documents to {collection_name}: {str(e)}'
      raise ServiceError(msg) from e

  async def get_documents(
    self, collection_name: str, where: dict[str, Any] | None = None
  ) -> list[tuple[str, dict[str, Any]]]:
    """
    Get all documents and metadata from a collection.

    Args:
      collection_name: Name of the collection.
      where: Optional metadata filter dict.

    Returns:
      List of (document_text, metadata) tuples.
    """
    try:
      collection = self._get_collection(collection_name)
      results = collection.get(where=where)

      documents: list[tuple[str, dict[str, Any]]] = []
      ids = results.get('ids', [])
      docs = results.get('documents') or []
      metas = results.get('metadatas') or []

      for i in range(len(ids)):
        doc_text = docs[i] if i < len(docs) else ''
        metadata = metas[i] if i < len(metas) else {}
        documents.append((str(doc_text), dict(metadata or {})))

      return documents
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to get documents from {collection_name}: {str(e)}') from e

  async def delete_documents(self, collection_name: str, where: dict[str, Any]) -> None:
    """
    Delete documents from a collection matching metadata filter.

    Args:
      collection_name: Name of the collection.
      where: Metadata filter dict.
    """
    try:
      collection = self._get_collection(collection_name)
      results = collection.get(where=where)
      ids = results.get('ids', [])
      if ids:
        collection.delete(ids=ids)
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to delete documents from {collection_name}: {str(e)}') from e

  async def search_documents(
    self, collection_name: str, query: str, k: int = 10
  ) -> list[tuple[str, dict[str, Any], float]]:
    """
    Search for similar documents in a collection.

    Args:
      collection_name: Name of the collection.
      query: Search query text.
      k: Number of results to return.

    Returns:
      List of (document_text, metadata, similarity_score) tuples.
      Similarity score is 0-1, where higher means more similar.
    """
    try:
      collection = self._get_collection(collection_name)
      query_embedding = cast(Embedding, (await self.model_client.embed([query]))[0])

      results = collection.query(query_embeddings=[query_embedding], n_results=k)

      documents: list[tuple[str, dict[str, Any], float]] = []

      result_ids = cast(list[list[str]], results.get('ids', [[]]))[0]
      result_docs = cast(list[list[str]], results.get('documents', [[]]))[0]
      result_metas = cast(list[list[dict[str, Any]]], results.get('metadatas', [[]]))[0]
      result_distances = cast(list[list[float]], results.get('distances', [[]]))[0]

      for i in range(len(result_ids)):
        doc_text = result_docs[i] if i < len(result_docs) else ''
        metadata = result_metas[i] if i < len(result_metas) else {}
        distance = result_distances[i] if i < len(result_distances) else 1.0

        # Convert cosine distance to similarity (0-1, higher is more similar)
        # ChromaDB returns cosine distance (0-2), we convert to similarity: 1 - distance
        similarity = 1 - distance

        documents.append((str(doc_text), dict(metadata or {}), float(similarity)))

      return documents
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to search documents in {collection_name}: {str(e)}') from e
