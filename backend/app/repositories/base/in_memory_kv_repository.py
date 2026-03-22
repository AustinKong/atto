from __future__ import annotations

from typing import Any


class InMemoryKVRepository:
  _store: dict[tuple[str, str], Any] = {}

  def set_value(self, namespace: str, key: str, value: Any) -> None:
    self.__class__._store[(namespace, key)] = value

  def get_value(self, namespace: str, key: str) -> Any:
    return self.__class__._store.get((namespace, key))

  def clear_value(self, namespace: str, key: str) -> None:
    self.__class__._store.pop((namespace, key), None)
