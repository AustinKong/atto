import json
import re
from typing import Any

from pydantic import BaseModel


def to_bullets(items: list[str], empty_message: str = 'No items provided.') -> str:
  """
  Convert a list of strings into a bulleted list.

  Args:
    items: Items to format.
    empty_message: Fallback message when items is empty.

  Returns:
    Bulleted list string or the empty message.
  """
  if not items:
    return empty_message
  return '\n'.join(f'- {item}' for item in items)


def to_json_string(value: Any, indent: int = 2) -> str:
  """
  Convert a value to a JSON string, supporting Pydantic models.

  Args:
    value: Value to serialize.
    indent: Indentation level for JSON output.

  Returns:
    JSON string representation.
  """
  if isinstance(value, BaseModel):
    return value.model_dump_json(indent=indent, by_alias=True)

  return json.dumps(value, indent=indent, default=str)


def find_phrase_matches(text: str, phrase: str) -> list[str]:
  normalized_phrase = phrase.strip()
  if not normalized_phrase:
    return []
  pattern = re.compile(rf'(?<!\w){re.escape(normalized_phrase)}(?!\w)', re.IGNORECASE)
  return pattern.findall(text)


def contains_phrase(text: str, phrase: str) -> bool:
  return len(find_phrase_matches(text, phrase)) > 0
