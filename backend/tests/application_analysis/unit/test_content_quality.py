import pytest

from app.clients.application_analysis.local.content_quality import (
  calculate_content_quality_score,
)
from tests.application_analysis.constants import (
  PARTIAL_SEMANTIC_MATCH_EMBEDDING,
  SEMANTIC_MATCH_EMBEDDING,
  SEMANTIC_MISMATCH_EMBEDDING,
)

pytestmark = pytest.mark.unit

MAX_CONTENT_QUALITY_SCORE = 1.0


def test_calculate_content_quality_score_combines_semantic_similarity_and_lexical_hits():
  """Lexical matches should boost a strong semantic match without overpowering it."""
  lexical_only_score = calculate_content_quality_score(
    text='Built scalable systems in Python and SQL.',
    unit_embedding=SEMANTIC_MISMATCH_EMBEDDING,
    requirement_embeddings=[SEMANTIC_MATCH_EMBEDDING],
    lexical_terms=['Python'],
  )
  semantic_only_score = calculate_content_quality_score(
    text='Built scalable systems in Python and SQL.',
    unit_embedding=SEMANTIC_MATCH_EMBEDDING,
    requirement_embeddings=[SEMANTIC_MATCH_EMBEDDING],
    lexical_terms=['golang'],
  )
  semantic_and_lexical_score = calculate_content_quality_score(
    text='Built scalable systems in Python and SQL.',
    unit_embedding=SEMANTIC_MATCH_EMBEDDING,
    requirement_embeddings=[SEMANTIC_MATCH_EMBEDDING],
    lexical_terms=['Python'],
  )

  assert semantic_only_score > lexical_only_score
  assert semantic_and_lexical_score > semantic_only_score
  assert semantic_and_lexical_score <= MAX_CONTENT_QUALITY_SCORE


def test_calculate_content_quality_score_uses_the_best_requirement_match_across_embeddings():
  """A section should score against its strongest requirement signal, not an average."""
  score_without_exact_requirement = calculate_content_quality_score(
    text='Implemented scalable Python services for data pipelines.',
    unit_embedding=SEMANTIC_MISMATCH_EMBEDDING,
    requirement_embeddings=[
      SEMANTIC_MATCH_EMBEDDING,
      PARTIAL_SEMANTIC_MATCH_EMBEDDING,
    ],
    lexical_terms=['Java'],
  )
  score_with_exact_requirement = calculate_content_quality_score(
    text='Implemented scalable Python services for data pipelines.',
    unit_embedding=SEMANTIC_MISMATCH_EMBEDDING,
    requirement_embeddings=[
      SEMANTIC_MATCH_EMBEDDING,
      SEMANTIC_MISMATCH_EMBEDDING,
      PARTIAL_SEMANTIC_MATCH_EMBEDDING,
    ],
    lexical_terms=['Java'],
  )

  assert score_with_exact_requirement > score_without_exact_requirement


def test_calculate_content_quality_score_clamps_to_the_product_maximum():
  """A perfect semantic and lexical match should saturate at the maximum score."""
  score = calculate_content_quality_score(
    text='Python Python Python',
    unit_embedding=SEMANTIC_MATCH_EMBEDDING,
    requirement_embeddings=[SEMANTIC_MATCH_EMBEDDING],
    lexical_terms=['Python'],
  )

  assert score == MAX_CONTENT_QUALITY_SCORE
