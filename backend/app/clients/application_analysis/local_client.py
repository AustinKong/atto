from typing import Annotated, TypedDict
from uuid import UUID

from fastapi import Depends
from pydantic import BaseModel

from app.clients.model import ModelClient, get_model_client
from app.resources.prompts import (
  AI_SUGGESTIONS_PROMPT,
  SKILL_REQUIRED_SCORE_PROMPT,
  SKILL_RESUME_SCORE_PROMPT,
)
from app.schemas import (
  Application,
  Listing,
  Resume,
)
from app.schemas.resume import BaseSection, Section, TextUnit
from app.utils.deduplication import cosine_similarity, deduplicate_by
from app.utils.errors import ServiceError
from app.utils.math import clamp
from app.utils.text import contains_phrase, find_phrase_matches, to_bullets, to_json_string
from shared.schemas.application_analysis import (
  AiSuggestions,
  ContentQualityScore,
  ContentQualitySection,
  SkillComparisonRow,
  SkillScoreResult,
)

from .base_client import ApplicationAnalysisClient

LLM_WEIGHT = 0.6
KEYWORD_WEIGHT = 0.4
CONTENT_LEXICAL_WEIGHT = 0.4
CONTENT_SEMANTIC_WEIGHT = 0.6
DEFAULT_EMPTY_SUGGESTIONS_SUMMARY = 'No actionable suggestions were found for this resume.'
# TODO: Add LLM component that looks for action verbs and quantifiable achievements


class UnitSuggestionInput(TypedDict):
  """Resume unit context passed to the LLM for AI suggestion generation."""

  section_id: str
  unit_id: str
  text: str
  content_quality_score: float | None


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

  async def get_content_quality(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> list[ContentQualitySection]:
    requirement_texts = (
      [listing.title, listing.description]
      + listing.skills
      + [keyword.word for keyword in listing.keywords]
      + listing.requirements
    )
    requirement_texts = [term.strip() for term in requirement_texts if term.strip()]
    if not requirement_texts:
      raise ServiceError('Listing has no requirement text for content quality scoring')

    lexical_terms = (
      listing.skills + [keyword.word for keyword in listing.keywords] + listing.requirements
    )
    lexical_terms = deduplicate_by(
      [term.strip() for term in lexical_terms if term.strip()],
      key_selector=lambda term: term.lower(),
    )

    requirement_embeddings = await self.llm_client.embed(requirement_texts)
    section_summaries: list[ContentQualitySection] = []

    for section in resume.sections:
      section_units = self._extract_section_text_units(section)
      if not section_units:
        continue

      unit_embeddings = await self.llm_client.embed([text for _, text in section_units])
      scored_units: list[ContentQualityScore] = []

      for (unit_id, text), unit_embedding in zip(section_units, unit_embeddings, strict=True):
        lexical_hit = 1.0 if any(contains_phrase(text, term) for term in lexical_terms) else 0.0

        semantic_score = 0.0
        for requirement_embedding in requirement_embeddings:
          similarity = cosine_similarity(unit_embedding, requirement_embedding)
          semantic_score = max(semantic_score, similarity)

        score = clamp(
          (CONTENT_LEXICAL_WEIGHT * lexical_hit) + (CONTENT_SEMANTIC_WEIGHT * semantic_score),
          0.0,
          1.0,
        )
        scored_units.append(ContentQualityScore(unit_id=unit_id, score=score))

      section_summaries.append(
        ContentQualitySection(
          section_id=section.id,
          scores=scored_units,
        )
      )

    return section_summaries

  async def get_ai_suggestions(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
    content_quality: list[ContentQualitySection],
  ) -> AiSuggestions:
    quality_score_by_unit_id = self._create_content_quality_score_map(content_quality)
    unit_rows: list[UnitSuggestionInput] = []

    for section in resume.sections:
      section_units = self._extract_section_text_units(section)
      for unit_id, text in section_units:
        unit_rows.append(
          {
            'section_id': str(section.id),
            'unit_id': str(unit_id),
            'text': text,
            'content_quality_score': quality_score_by_unit_id.get(unit_id),
          }
        )

    if not unit_rows:
      return AiSuggestions(
        summary=DEFAULT_EMPTY_SUGGESTIONS_SUMMARY,
      )

    prompt = AI_SUGGESTIONS_PROMPT.format(
      application_name=application.name,
      listing_title=listing.title,
      listing_requirements=to_bullets(listing.requirements),
      units_json=to_json_string(unit_rows),
    )
    return await self.llm_client.call_structured(
      input=prompt,
      response_model=AiSuggestions,
    )

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
      row.skill.lower().strip(): int(clamp(row.score, 0.0, 100.0)) for row in llm_result.rows
    }
    keyword_counts_by_skill: dict[str, int] = {}
    for skill in skills:
      key = skill.lower().strip()
      keyword_counts_by_skill[key] = len(find_phrase_matches(source_text, skill))

    max_count = max(keyword_counts_by_skill.values()) if keyword_counts_by_skill else 0

    hybrid_scores: dict[str, int] = {}
    for skill in skills:
      key = skill.lower().strip()
      keyword_count = keyword_counts_by_skill[key]
      keyword_score = (keyword_count / max_count) if max_count > 0 else 0.0
      llm_component = llm_scores_by_skill[key] / 100
      # hybrid = (0.6 * llm_component + 0.4 * keyword_score) * 100
      combined = (LLM_WEIGHT * llm_component + KEYWORD_WEIGHT * keyword_score) * 100
      hybrid_scores[skill] = int(round(clamp(combined, 0.0, 100.0)))

    return hybrid_scores

  def _extract_section_text_units(self, section: Section) -> list[tuple[UUID, str]]:
    units: list[tuple[UUID, str]] = []

    def walk(node: BaseModel | list[object]) -> None:
      if isinstance(node, TextUnit):
        text = node.content.strip()
        if text:
          units.append((node.id, text))
        return

      if isinstance(node, BaseModel):
        for field_name in node.__class__.model_fields:
          if isinstance(node, BaseSection) and field_name == 'title':
            continue
          field_value = getattr(node, field_name)
          if isinstance(field_value, (BaseModel, list)):
            walk(field_value)
        return

      for item in node:
        if isinstance(item, (BaseModel, list)):
          walk(item)

    walk(section)
    return units

  def _create_content_quality_score_map(
    self, content_quality: list[ContentQualitySection]
  ) -> dict[UUID, float]:
    """Create a unit-id keyed lookup table for content quality scores."""

    score_by_unit_id: dict[UUID, float] = {}
    for section in content_quality:
      for row in section.scores:
        score_by_unit_id[row.unit_id] = row.score
    return score_by_unit_id
