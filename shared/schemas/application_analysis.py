from pydantic import Field

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


class ApplicationAnalysis(CamelModel):
  resume_hash: str
  generated_at: str
  skills_comparison: list[SkillComparisonRow] = Field(default_factory=list)
