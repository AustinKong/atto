from abc import ABC, abstractmethod

from app.schemas import Application, Listing, Resume
from shared.schemas.application_analysis import (
  AISuggestions,
  ContentQualitySection,
  SkillComparisonRow,
)


class ApplicationAnalysisClient(ABC):
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
