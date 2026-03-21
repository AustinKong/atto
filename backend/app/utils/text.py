import json
import re
from typing import Any

from pydantic import BaseModel
from rapidfuzz import fuzz, process


def ground_quote(quote: str, text: str, threshold: float = 50.0) -> str:
  """
  Attempts to ground an AI-generated quote to the exact substring in the source text.
  Uses token_set_ratio to find best matching substring that contains key words from quote.
  """
  if not quote or not text:
    return quote

  # Fast path: exact match
  if quote in text:
    return quote

  # Split into sentences (natural boundaries)
  sentences = re.split(r'[.\n;]+', text)
  sentences = [s.strip() for s in sentences if s.strip()]

  if not sentences:
    return quote

  # Find the best matching sentence using token_set_ratio
  # This compares the quote's tokens against each sentence's tokens
  match = process.extractOne(quote, sentences, scorer=fuzz.token_set_ratio)

  if match and match[1] >= threshold:
    return match[0]

  return quote


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
