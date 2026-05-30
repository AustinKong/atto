from uuid import UUID

from app.schemas.resume import Resume
from app.utils.math import clamp
from shared.schemas.application_analysis import (
  AISuggestions,
  AIUnitSuggestion,
  ContentQualitySection,
)

from .schemas import AISuggestionsResponse
from .text_units import extract_section_text_units

DEFAULT_EMPTY_SUGGESTIONS_SUMMARY = 'No actionable suggestions were found for this resume.'
AI_SUGGESTIONS_SCORE_THRESHOLD = 0.6
MAX_SUGGESTION_CANDIDATES = 8
MAX_AI_SUGGESTIONS = 8
MATCH_SCORE_MIN = 0.0
MATCH_SCORE_MAX = 1.0


def compute_suggestion_budget(match_score: float) -> int:
  normalized_score = clamp(match_score, MATCH_SCORE_MIN, MATCH_SCORE_MAX)
  return round((MATCH_SCORE_MAX - normalized_score) * MAX_AI_SUGGESTIONS)


def build_content_quality_lookups(
  content_quality: list[ContentQualitySection],
) -> tuple[dict[UUID, float], dict[UUID, str]]:
  quality_score_by_unit_id: dict[UUID, float] = {}
  unit_hash_by_unit_id: dict[UUID, str] = {}

  for section in content_quality:
    for row in section.scores:
      quality_score_by_unit_id[row.unit_id] = row.score
      unit_hash_by_unit_id[row.unit_id] = row.unit_hash

  return quality_score_by_unit_id, unit_hash_by_unit_id


def build_suggestion_unit_rows(
  resume: Resume,
  quality_score_by_unit_id: dict[UUID, float],
) -> list[dict[str, str | float]]:
  unit_rows: list[dict[str, str | float]] = []

  for section in resume.sections:
    section_units = extract_section_text_units(section)
    for unit_id, text in section_units:
      content_quality_score = quality_score_by_unit_id[unit_id]
      if content_quality_score >= AI_SUGGESTIONS_SCORE_THRESHOLD:
        continue

      unit_rows.append(
        {
          'unit_id': str(unit_id),
          'text': text,
          'content_quality_score': content_quality_score,
        }
      )

  return sorted(
    unit_rows,
    key=lambda unit: float(unit['content_quality_score']),
  )[:MAX_SUGGESTION_CANDIDATES]


def map_suggestions_response(
  suggestions_response: AISuggestionsResponse,
  unit_hash_by_unit_id: dict[UUID, str],
  *,
  max_suggestions: int = MAX_AI_SUGGESTIONS,
) -> AISuggestions:
  suggestions: list[AIUnitSuggestion] = []

  for suggestion in suggestions_response.suggestions[:max_suggestions]:
    unit_hash = unit_hash_by_unit_id.get(suggestion.unit_id)
    if unit_hash is None:
      continue

    suggestions.append(
      AIUnitSuggestion(
        id=suggestion.id,
        unit_id=suggestion.unit_id,
        unit_hash=unit_hash,
        suggestion=suggestion.suggestion,
        replacement_text=suggestion.replacement_text,
      )
    )

  return AISuggestions(summary=suggestions_response.summary, suggestions=suggestions)
