from abc import ABC, abstractmethod

from app.schemas import Application, Listing, Resume, SkillComparisonRow


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
