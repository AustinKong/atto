from typing import Any

from .types import CamelModel


class CallStructuredRequest(CamelModel):
  input: str
  response_schema: dict[str, Any]
