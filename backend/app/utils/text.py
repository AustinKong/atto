import re

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
