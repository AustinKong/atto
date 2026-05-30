from abc import ABC, abstractmethod
from datetime import UTC, datetime

from app.schemas.application import Application
from app.schemas.listing import Listing
from app.schemas.resume import Resume
from app.utils.math import clamp
from shared.schemas.application_analysis import (
  AISuggestions,
  ApplicationAnalysis,
  ContentQualitySection,
  SkillComparisonRow,
)

MATCH_SCORE_MIN = 0.0
MATCH_SCORE_MAX = 1.0
MATCH_SCORE_PERCENT_DIVISOR = 100.0

SKILL_COVERAGE_WEIGHT = 0.75
CONTENT_QUALITY_WEIGHT = 0.25
CONTENT_QUALITY_TOP_EVIDENCE_COUNT = 5

MINIMUM_SKILL_IMPORTANCE_WEIGHT = 0.1
ZERO_REQUIRED_SKILL_COVERAGE = 1.0

MATCH_SCORE_EMPTY_VALUE = 0.0


class ApplicationAnalysisClient(ABC):
  async def generate_analysis(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> ApplicationAnalysis:
    skills_comparison = await self.get_skills_comparison(
      listing=listing,
      application=application,
      resume=resume,
    )
    content_quality = await self.get_content_quality(
      listing=listing,
      application=application,
      resume=resume,
    )
    match_score = self.compute_match_score(
      skills_comparison=skills_comparison,
      content_quality=content_quality,
    )
    ai_suggestions = await self.get_ai_suggestions(
      listing=listing,
      application=application,
      resume=resume,
      match_score=match_score,
    )

    return ApplicationAnalysis(
      resume_hash=resume.create_hash(),
      generated_at=datetime.now(UTC),
      match_score=match_score,
      skills_comparison=skills_comparison,
      content_quality=content_quality,
      ai_suggestions=ai_suggestions,
    )

  @abstractmethod
  async def get_skills_comparison(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> list[SkillComparisonRow]:
    """Generate required vs resume skill scores for a listing+resume pair."""
    pass

  @abstractmethod
  async def get_content_quality(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> list[ContentQualitySection]:
    """Generate section-bucketed content quality units for a listing+resume pair."""
    pass

  @abstractmethod
  async def get_ai_suggestions(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
    match_score: float,
  ) -> AISuggestions:
    """Generate holistic AI summary and unit-level suggestions for a listing+resume pair."""
    pass

  def compute_match_score(
    self,
    skills_comparison: list[SkillComparisonRow],
    content_quality: list[ContentQualitySection],
  ) -> float:
    skill_match = self._compute_skill_match(skills_comparison)
    content_match = self._compute_content_quality_match(content_quality)

    return clamp(
      (SKILL_COVERAGE_WEIGHT * skill_match) + (CONTENT_QUALITY_WEIGHT * content_match),
      MATCH_SCORE_MIN,
      MATCH_SCORE_MAX,
    )

  def _compute_skill_match(self, rows: list[SkillComparisonRow]) -> float:
    if not rows:
      return MATCH_SCORE_EMPTY_VALUE

    weighted_coverage_sum = 0.0
    total_importance_weight = 0.0

    for row in rows:
      required_normalized = row.required_score / MATCH_SCORE_PERCENT_DIVISOR
      resume_normalized = row.resume_score / MATCH_SCORE_PERCENT_DIVISOR
      importance_weight = max(MINIMUM_SKILL_IMPORTANCE_WEIGHT, required_normalized)
      coverage = (
        ZERO_REQUIRED_SKILL_COVERAGE
        if row.required_score <= 0
        else clamp(resume_normalized / required_normalized, MATCH_SCORE_MIN, MATCH_SCORE_MAX)
      )

      weighted_coverage_sum += importance_weight * coverage
      total_importance_weight += importance_weight

    if total_importance_weight <= 0:
      return MATCH_SCORE_EMPTY_VALUE

    return clamp(weighted_coverage_sum / total_importance_weight, MATCH_SCORE_MIN, MATCH_SCORE_MAX)

  def _compute_content_quality_match(self, content_quality: list[ContentQualitySection]) -> float:
    scores = [row.score for section in content_quality for row in section.scores]

    if not scores:
      return MATCH_SCORE_EMPTY_VALUE

    # Choose only the strongest content quality to take into account
    # This stops necessary but low-quality content (education etc.) from dragging down the score
    strongest_scores = sorted(scores, reverse=True)[:CONTENT_QUALITY_TOP_EVIDENCE_COUNT]
    return clamp(
      sum(strongest_scores) / len(strongest_scores),
      MATCH_SCORE_MIN,
      MATCH_SCORE_MAX,
    )
