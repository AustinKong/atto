from app.schemas.listing import Listing
from app.utils.deduplication import cosine_similarity, deduplicate_by
from app.utils.math import clamp
from app.utils.text import contains_phrase

CONTENT_LEXICAL_WEIGHT = 0.4
CONTENT_SEMANTIC_WEIGHT = 0.6


def build_requirement_texts(listing: Listing) -> list[str]:
  terms = (
    [listing.title, listing.description]
    + listing.skills
    + [keyword.word for keyword in listing.keywords]
    + listing.requirements
  )
  return [term.strip() for term in terms if term.strip()]


def build_lexical_terms(listing: Listing) -> list[str]:
  terms = listing.skills + [keyword.word for keyword in listing.keywords] + listing.requirements
  return deduplicate_by(
    [term.strip() for term in terms if term.strip()],
    key_selector=lambda term: term.lower(),
  )


def calculate_content_quality_score(
  text: str,
  unit_embedding: list[float],
  requirement_embeddings: list[list[float]],
  lexical_terms: list[str],
) -> float:
  lexical_hit = 1.0 if any(contains_phrase(text, term) for term in lexical_terms) else 0.0

  semantic_score = 0.0
  for requirement_embedding in requirement_embeddings:
    similarity = cosine_similarity(unit_embedding, requirement_embedding)
    semantic_score = max(semantic_score, similarity)

  return clamp(
    (CONTENT_LEXICAL_WEIGHT * lexical_hit) + (CONTENT_SEMANTIC_WEIGHT * semantic_score),
    0.0,
    1.0,
  )
