import re
from typing import Annotated

from fastapi import Depends

from app.clients.model import ModelClient, get_model_client
from app.resources.prompts import SKILL_REQUIRED_SCORE_PROMPT, SKILL_RESUME_SCORE_PROMPT
from app.schemas import (
  Application,
  Listing,
  Resume,
  SkillComparisonRow,
)
from app.utils.errors import ServiceError
from app.utils.text import to_bullets
from shared.schemas.application_analysis import SkillScoreResult

from .base_client import ApplicationAnalysisClient

LLM_WEIGHT = 0.6
KEYWORD_WEIGHT = 0.4


class LocalApplicationAnalysisClient(ApplicationAnalysisClient):
  def __init__(
    self,
    llm_client: Annotated[ModelClient, Depends(get_model_client)],
  ) -> None:
    self.llm_client = llm_client

  async def get_skills_comparison(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> list[SkillComparisonRow]:
    skills = listing.skills
    listing_text = listing.to_analysis_text()
    resume_text = resume.to_analysis_text()
    required_prompt = SKILL_REQUIRED_SCORE_PROMPT.format(
      application_name=application.name,
      listing_title=listing.title,
      skills=to_bullets(skills),
      source_text=listing_text,
    )
    resume_prompt = SKILL_RESUME_SCORE_PROMPT.format(
      application_name=application.name,
      skills=to_bullets(skills),
      source_text=resume_text,
    )

    required_scores = await self._score_skills_from_prompt(
      skills=skills,
      source_text=listing_text,
      prompt=required_prompt,
    )
    resume_scores = await self._score_skills_from_prompt(
      skills=skills,
      source_text=resume_text,
      prompt=resume_prompt,
    )

    return [
      SkillComparisonRow(
        skill=skill,
        required_score=required_scores[skill],
        resume_score=resume_scores[skill],
      )
      for skill in skills
    ]

  async def _score_skills_from_prompt(
    self,
    skills: list[str],
    source_text: str,
    prompt: str,
  ) -> dict[str, int]:
    llm_result = await self.llm_client.call_structured(
      input=prompt,
      response_model=SkillScoreResult,
    )

    expected_skills = {skill.lower().strip() for skill in skills}
    scored_skills = {row.skill.lower().strip() for row in llm_result.rows}
    if expected_skills != scored_skills:
      raise ServiceError('Invalid skill scoring response')

    llm_scores_by_skill = {
      row.skill.lower().strip(): min(100, max(0, row.score)) for row in llm_result.rows
    }
    keyword_counts_by_skill: dict[str, int] = {}
    for skill in skills:
      key = skill.lower().strip()
      pattern = re.compile(rf'(?<!\w){re.escape(skill.strip())}(?!\w)', re.IGNORECASE)
      keyword_counts_by_skill[key] = len(pattern.findall(source_text))

    max_count = max(keyword_counts_by_skill.values()) if keyword_counts_by_skill else 0

    hybrid_scores: dict[str, int] = {}
    for skill in skills:
      key = skill.lower().strip()
      keyword_count = keyword_counts_by_skill[key]
      keyword_score = (keyword_count / max_count) if max_count > 0 else 0.0
      llm_component = llm_scores_by_skill[key] / 100
      # hybrid = (0.6 * llm_component + 0.4 * keyword_score) * 100
      combined = (LLM_WEIGHT * llm_component + KEYWORD_WEIGHT * keyword_score) * 100
      hybrid_scores[skill] = int(round(min(100, max(0, combined))))

    return hybrid_scores
