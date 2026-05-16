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

MINIMUM_SKILL_IMPORTANCE_WEIGHT = 0.1
ZERO_REQUIRED_SKILL_COVERAGE = 1.0

SUGGESTION_PENALTY_PER_ITEM = 0.02
SUGGESTION_PENALTY_MAX = 0.15

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
    ai_suggestions = await self.get_ai_suggestions(
      listing=listing,
      application=application,
      resume=resume,
    )
    match_score = self.compute_match_score(
      skills_comparison=skills_comparison,
      content_quality=content_quality,
      ai_suggestions=ai_suggestions,
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
  ) -> AISuggestions:
    """Generate holistic AI summary and unit-level suggestions for a listing+resume pair."""
    pass

  # TODO: Actually review/test the algorithm
  def compute_match_score(
    self,
    skills_comparison: list[SkillComparisonRow],
    content_quality: list[ContentQualitySection],
    ai_suggestions: AISuggestions | None,
  ) -> float:
    skill_match = self._compute_skill_match(skills_comparison)
    content_match = self._compute_content_quality_match(content_quality)
    suggestion_count = len(ai_suggestions.suggestions) if ai_suggestions else 0
    suggestion_penalty = self._compute_suggestion_penalty(suggestion_count)

    return clamp(
      (
        (SKILL_COVERAGE_WEIGHT * skill_match)
        + (CONTENT_QUALITY_WEIGHT * content_match)
        - suggestion_penalty
      ),
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
    total_score = 0.0
    score_count = 0

    for section in content_quality:
      for row in section.scores:
        total_score += row.score
        score_count += 1

    if score_count <= 0:
      return MATCH_SCORE_EMPTY_VALUE

    return clamp(total_score / score_count, MATCH_SCORE_MIN, MATCH_SCORE_MAX)

  def _compute_suggestion_penalty(self, suggestion_count: int) -> float:
    return clamp(
      suggestion_count * SUGGESTION_PENALTY_PER_ITEM,
      MATCH_SCORE_MIN,
      SUGGESTION_PENALTY_MAX,
    )
