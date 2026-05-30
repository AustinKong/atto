from uuid import UUID, uuid4

import pytest

from app.clients.application_analysis.local.ai_suggestions import (
  AI_SUGGESTIONS_SCORE_THRESHOLD,
  MAX_AI_SUGGESTIONS,
  build_suggestion_unit_rows,
  compute_suggestion_budget,
  map_suggestions_response,
)
from app.clients.application_analysis.local.schemas import (
  AISuggestionsResponse,
  AIUnitSuggestionResponse,
)
from app.schemas.resume import ParagraphSection, Resume, SimpleSection, TextUnit

pytestmark = pytest.mark.unit

LOW_QUALITY_SCORE = 0.1
SECOND_LOW_QUALITY_SCORE = 0.2
PARAGRAPH_QUALITY_SCORE = 0.25
MODERATE_QUALITY_SCORE = 0.35
WEAK_QUALITY_SCORE = 0.4
STRONG_QUALITY_SCORE = 0.7
HIGH_QUALITY_SCORE = 0.8
VERY_HIGH_QUALITY_SCORE = 0.9
EXCELLENT_QUALITY_SCORE = 0.95
EXTRA_SUGGESTIONS_OVER_PRODUCT_LIMIT = 2


def build_resume() -> tuple[Resume, dict[str, UUID]]:
  section_one_low = uuid4()
  section_one_mid = uuid4()
  section_one_high = uuid4()
  section_two_low = uuid4()
  section_two_high = uuid4()
  section_three = uuid4()

  resume = Resume(
    template_id=uuid4(),
    sections=[
      SimpleSection(
        id=uuid4(),
        content=[
          TextUnit(id=section_one_low, content='   Weak bullet one   '),
          TextUnit(id=section_one_mid, content='Moderate bullet one'),
          TextUnit(id=section_one_high, content='Strong bullet one'),
        ],
      ),
      SimpleSection(
        id=uuid4(),
        content=[
          TextUnit(id=section_two_low, content='Weak bullet two'),
          TextUnit(id=section_two_high, content='Strong bullet two'),
        ],
      ),
      ParagraphSection(
        id=uuid4(),
        content=TextUnit(id=section_three, content='Paragraph section bullet'),
      ),
    ],
  )

  return resume, {
    'section_one_low': section_one_low,
    'section_one_mid': section_one_mid,
    'section_one_high': section_one_high,
    'section_two_low': section_two_low,
    'section_two_high': section_two_high,
    'section_three': section_three,
  }


def test_build_suggestion_unit_rows_only_includes_units_below_quality_threshold():
  """Only low-quality resume units should be considered for AI suggestions."""
  resume, unit_ids = build_resume()
  quality_score_by_unit_id: dict[UUID, float] = {
    unit_ids['section_one_low']: LOW_QUALITY_SCORE,
    unit_ids['section_one_mid']: AI_SUGGESTIONS_SCORE_THRESHOLD,
    unit_ids['section_one_high']: EXCELLENT_QUALITY_SCORE,
    unit_ids['section_two_low']: SECOND_LOW_QUALITY_SCORE,
    unit_ids['section_two_high']: STRONG_QUALITY_SCORE,
    unit_ids['section_three']: WEAK_QUALITY_SCORE,
  }

  unit_rows = build_suggestion_unit_rows(resume, quality_score_by_unit_id)

  assert [row['text'] for row in unit_rows] == [
    'Weak bullet one',
    'Weak bullet two',
    'Paragraph section bullet',
  ]
  assert all(
    float(row['content_quality_score']) < AI_SUGGESTIONS_SCORE_THRESHOLD for row in unit_rows
  )


def test_build_suggestion_unit_rows_prioritizes_lowest_quality_units_first():
  """The lowest-quality resume units should be surfaced before less severe ones."""
  resume, unit_ids = build_resume()
  quality_score_by_unit_id: dict[UUID, float] = {
    unit_ids['section_one_low']: WEAK_QUALITY_SCORE,
    unit_ids['section_one_mid']: MODERATE_QUALITY_SCORE,
    unit_ids['section_one_high']: VERY_HIGH_QUALITY_SCORE,
    unit_ids['section_two_low']: LOW_QUALITY_SCORE,
    unit_ids['section_two_high']: HIGH_QUALITY_SCORE,
    unit_ids['section_three']: PARAGRAPH_QUALITY_SCORE,
  }

  unit_rows = build_suggestion_unit_rows(resume, quality_score_by_unit_id)

  assert [float(row['content_quality_score']) for row in unit_rows] == [
    LOW_QUALITY_SCORE,
    PARAGRAPH_QUALITY_SCORE,
    MODERATE_QUALITY_SCORE,
    WEAK_QUALITY_SCORE,
  ]
  assert [row['text'] for row in unit_rows] == [
    'Weak bullet two',
    'Paragraph section bullet',
    'Moderate bullet one',
    'Weak bullet one',
  ]


def test_map_suggestions_response_drops_suggestions_for_unknown_resume_units():
  """Suggestions for stale or unknown unit ids should be ignored."""
  known_unit_id = uuid4()
  unknown_unit_id = uuid4()

  mapped = map_suggestions_response(
    AISuggestionsResponse(
      summary='Improve the resume',
      suggestions=[
        AIUnitSuggestionResponse(
          id='known',
          unit_id=known_unit_id,
          suggestion='Clarify impact',
        ),
        AIUnitSuggestionResponse(
          id='unknown',
          unit_id=unknown_unit_id,
          suggestion='Remove this',
        ),
      ],
    ),
    {known_unit_id: 'known-hash'},
  )

  assert [suggestion.id for suggestion in mapped.suggestions] == ['known']
  assert mapped.suggestions[0].unit_hash == 'known-hash'


def test_map_suggestions_response_caps_suggestions_to_the_product_limit():
  """Only the first product-sized batch of suggestions should be kept."""
  unit_hash_by_unit_id = {}
  suggestions = []
  for index in range(MAX_AI_SUGGESTIONS + EXTRA_SUGGESTIONS_OVER_PRODUCT_LIMIT):
    unit_id = uuid4()
    unit_hash_by_unit_id[unit_id] = f'hash-{index}'
    suggestions.append(
      AIUnitSuggestionResponse(
        id=f'suggestion-{index}',
        unit_id=unit_id,
        suggestion=f'Suggestion {index}',
      )
    )

  mapped = map_suggestions_response(
    AISuggestionsResponse(summary='Improve the resume', suggestions=suggestions),
    unit_hash_by_unit_id,
  )

  assert len(mapped.suggestions) == MAX_AI_SUGGESTIONS
  assert [suggestion.id for suggestion in mapped.suggestions] == [
    f'suggestion-{index}' for index in range(MAX_AI_SUGGESTIONS)
  ]


def test_map_suggestions_response_caps_suggestions_to_the_match_budget():
  """The match-derived suggestion budget can be smaller than the product maximum."""
  max_suggestions = 2
  unit_hash_by_unit_id = {}
  suggestions = []
  for index in range(MAX_AI_SUGGESTIONS):
    unit_id = uuid4()
    unit_hash_by_unit_id[unit_id] = f'hash-{index}'
    suggestions.append(
      AIUnitSuggestionResponse(
        id=f'suggestion-{index}',
        unit_id=unit_id,
        suggestion=f'Suggestion {index}',
      )
    )

  mapped = map_suggestions_response(
    AISuggestionsResponse(summary='Improve the resume', suggestions=suggestions),
    unit_hash_by_unit_id,
    max_suggestions=max_suggestions,
  )

  assert len(mapped.suggestions) == max_suggestions
  assert [suggestion.id for suggestion in mapped.suggestions] == [
    f'suggestion-{index}' for index in range(max_suggestions)
  ]


@pytest.mark.parametrize(
  ('match_score', 'expected_budget'),
  [
    (0.96, 0),
    (0.90, 1),
    (0.80, 2),
    (0.65, 3),
    (0.40, 5),
    (0.00, 8),
  ],
)
def test_compute_suggestion_budget_scales_feedback_with_match_strength(
  match_score: float,
  expected_budget: int,
):
  """Strong matches get less coaching; weak matches can receive a larger suggestion set."""
  assert compute_suggestion_budget(match_score) == expected_budget


def test_compute_suggestion_budget_clamps_out_of_range_match_scores():
  """Out-of-range scores should not produce impossible suggestion budgets."""
  assert compute_suggestion_budget(1.2) == 0
  assert compute_suggestion_budget(-0.2) == MAX_AI_SUGGESTIONS


def test_map_suggestions_response_preserves_unit_hashes_for_staleness_detection():
  """Mapped suggestions should carry the current unit hash from content-quality lookup state."""
  unit_id = uuid4()

  mapped = map_suggestions_response(
    AISuggestionsResponse(
      summary='Improve the resume',
      suggestions=[
        AIUnitSuggestionResponse(
          id='suggestion-1',
          unit_id=unit_id,
          suggestion='Use a stronger metric',
          replacement_text='Led a migration that cut runtime by 40%.',
        )
      ],
    ),
    {unit_id: 'fresh-unit-hash'},
  )

  assert mapped.suggestions[0].unit_hash == 'fresh-unit-hash'
  assert mapped.suggestions[0].replacement_text == 'Led a migration that cut runtime by 40%.'
