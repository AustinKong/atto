from uuid import uuid4

import pytest

from app.clients.application_analysis.base_client import (
  ApplicationAnalysisClient,
)
from app.schemas.application import Application
from app.schemas.listing import Listing
from app.schemas.resume import Resume
from shared.schemas.application_analysis import (
  AISuggestions,
  ContentQualityScore,
  ContentQualitySection,
  SkillComparisonRow,
)

pytestmark = pytest.mark.unit

HIGH_IMPORTANCE_REQUIRED_SCORE = 90
LOW_IMPORTANCE_REQUIRED_SCORE = 20
NEGLIGIBLE_IMPORTANCE_REQUIRED_SCORE = 5
PARTIAL_REQUIRED_SCORE = 80
PARTIAL_RESUME_SCORE = 40
MISSING_RESUME_SCORE = 0
WEAK_CONTENT_QUALITY_SCORE = 0.5
MODERATE_CONTENT_QUALITY_SCORE = 0.6
STRONG_CONTENT_QUALITY_SCORE = 0.8
PERFECT_CONTENT_QUALITY_SCORE = 1.0
STRONG_MATCH_ACCEPTANCE_THRESHOLD = 0.9
LOW_SUPPORTING_CONTENT_QUALITY_SCORE = 0.1


class StubApplicationAnalysisClient(ApplicationAnalysisClient):
  async def get_skills_comparison(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> list[SkillComparisonRow]:
    raise NotImplementedError

  async def get_content_quality(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> list[ContentQualitySection]:
    raise NotImplementedError

  async def get_ai_suggestions(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
    match_score: float,
  ) -> AISuggestions:
    raise NotImplementedError


def rows(*values: tuple[str, int, int]) -> list[SkillComparisonRow]:
  return [
    SkillComparisonRow(skill=skill, required_score=required_score, resume_score=resume_score)
    for skill, required_score, resume_score in values
  ]


def content_quality_scores(*scores: float) -> list[ContentQualitySection]:
  return [
    ContentQualitySection(
      section_id=uuid4(),
      scores=[
        ContentQualityScore(unit_id=uuid4(), unit_hash='unit', score=score) for score in scores
      ],
    )
  ]


def test_compute_match_score_rewards_resume_coverage_of_high_importance_required_skills():
  """High-importance required skills should influence the final score more strongly."""
  client = StubApplicationAnalysisClient()

  score_with_high_importance_coverage = client.compute_match_score(
    skills_comparison=rows(
      ('Python', HIGH_IMPORTANCE_REQUIRED_SCORE, HIGH_IMPORTANCE_REQUIRED_SCORE),
      ('Go', LOW_IMPORTANCE_REQUIRED_SCORE, MISSING_RESUME_SCORE),
    ),
    content_quality=content_quality_scores(WEAK_CONTENT_QUALITY_SCORE),
  )
  score_missing_high_importance_skill = client.compute_match_score(
    skills_comparison=rows(
      ('Python', HIGH_IMPORTANCE_REQUIRED_SCORE, MISSING_RESUME_SCORE),
      ('Go', LOW_IMPORTANCE_REQUIRED_SCORE, LOW_IMPORTANCE_REQUIRED_SCORE),
    ),
    content_quality=content_quality_scores(WEAK_CONTENT_QUALITY_SCORE),
  )

  assert score_with_high_importance_coverage > score_missing_high_importance_skill


def test_compute_match_score_does_not_over_penalize_missing_low_importance_skills():
  """Missing a low-importance skill should not erase a strong overall match."""
  client = StubApplicationAnalysisClient()

  score = client.compute_match_score(
    skills_comparison=rows(
      ('Python', HIGH_IMPORTANCE_REQUIRED_SCORE, HIGH_IMPORTANCE_REQUIRED_SCORE),
      ('Rust', NEGLIGIBLE_IMPORTANCE_REQUIRED_SCORE, MISSING_RESUME_SCORE),
    ),
    content_quality=content_quality_scores(PERFECT_CONTENT_QUALITY_SCORE),
  )

  assert score > STRONG_MATCH_ACCEPTANCE_THRESHOLD


def test_compute_match_score_combines_skill_coverage_and_content_quality():
  """The final score should blend skill match and content quality as fit evidence."""
  client = StubApplicationAnalysisClient()

  score = client.compute_match_score(
    skills_comparison=rows(('Python', PARTIAL_REQUIRED_SCORE, PARTIAL_RESUME_SCORE)),
    content_quality=content_quality_scores(
      MODERATE_CONTENT_QUALITY_SCORE,
      STRONG_CONTENT_QUALITY_SCORE,
    ),
  )

  assert score > 0


def test_compute_match_score_is_independent_from_suggestion_count():
  """Suggestions are coaching output, not fit evidence that should lower match score."""
  client = StubApplicationAnalysisClient()

  score_before_suggestions = client.compute_match_score(
    skills_comparison=rows(('Python', PARTIAL_REQUIRED_SCORE, PARTIAL_RESUME_SCORE)),
    content_quality=content_quality_scores(
      MODERATE_CONTENT_QUALITY_SCORE,
      STRONG_CONTENT_QUALITY_SCORE,
    ),
  )
  score_after_suggestions = client.compute_match_score(
    skills_comparison=rows(('Python', PARTIAL_REQUIRED_SCORE, PARTIAL_RESUME_SCORE)),
    content_quality=content_quality_scores(
      MODERATE_CONTENT_QUALITY_SCORE,
      STRONG_CONTENT_QUALITY_SCORE,
    ),
  )

  assert score_after_suggestions == pytest.approx(score_before_suggestions)


def test_compute_match_score_uses_strongest_content_evidence_without_averaging_all_units_down():
  """Strong role evidence should carry match quality even when supporting lines are weaker."""
  client = StubApplicationAnalysisClient()

  score_with_supporting_lines = client.compute_match_score(
    skills_comparison=rows(
      (
        'Python',
        HIGH_IMPORTANCE_REQUIRED_SCORE,
        HIGH_IMPORTANCE_REQUIRED_SCORE,
      )
    ),
    content_quality=content_quality_scores(
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
      LOW_SUPPORTING_CONTENT_QUALITY_SCORE,
      LOW_SUPPORTING_CONTENT_QUALITY_SCORE,
    ),
  )
  score_without_supporting_lines = client.compute_match_score(
    skills_comparison=rows(
      (
        'Python',
        HIGH_IMPORTANCE_REQUIRED_SCORE,
        HIGH_IMPORTANCE_REQUIRED_SCORE,
      )
    ),
    content_quality=content_quality_scores(
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
    ),
  )

  assert score_with_supporting_lines == pytest.approx(score_without_supporting_lines)


def test_compute_match_score_keeps_excellent_resumes_above_threshold():
  """An excellent match should stay excellent without depending on suggestion behavior."""
  client = StubApplicationAnalysisClient()

  score = client.compute_match_score(
    skills_comparison=rows(
      (
        'Python',
        HIGH_IMPORTANCE_REQUIRED_SCORE,
        HIGH_IMPORTANCE_REQUIRED_SCORE,
      )
    ),
    content_quality=content_quality_scores(
      PERFECT_CONTENT_QUALITY_SCORE,
      PERFECT_CONTENT_QUALITY_SCORE,
      STRONG_CONTENT_QUALITY_SCORE,
      STRONG_CONTENT_QUALITY_SCORE,
      STRONG_CONTENT_QUALITY_SCORE,
    ),
  )

  assert score >= STRONG_MATCH_ACCEPTANCE_THRESHOLD
