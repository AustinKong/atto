from uuid import UUID

from pydantic import Field

from .dates import ISODatetime
from .types import CamelModel


class SkillComparisonRow(CamelModel):
  skill: str
  resume_score: int = Field(ge=0, le=100)
  required_score: int = Field(ge=0, le=100)


class SkillScoreRow(CamelModel):
  skill: str
  score: int = Field(ge=0, le=100)


class SkillScoreResult(CamelModel):
  rows: list[SkillScoreRow]


class ContentQualityScore(CamelModel):
  unit_id: UUID
  score: float = Field(ge=0.0, le=1.0)


class ContentQualitySection(CamelModel):
  section_id: UUID
  scores: list[ContentQualityScore] = Field(default_factory=list)


class AIUnitSuggestion(CamelModel):
  id: str
  unit_id: UUID
  suggestion: str
  replacement_text: str | None = None


class AISuggestions(CamelModel):
  summary: str
  suggestions: list[AIUnitSuggestion] = Field(default_factory=list)


class ApplicationAnalysis(CamelModel):
  resume_hash: str
  generated_at: ISODatetime
  match_score: float = Field(default=0.0, ge=0.0, le=1.0)
  skills_comparison: list[SkillComparisonRow] = Field(default_factory=list)
  content_quality: list[ContentQualitySection] = Field(default_factory=list)
  ai_suggestions: AISuggestions | None = None
