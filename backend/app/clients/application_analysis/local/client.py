from typing import Annotated
from uuid import UUID

from fastapi import Depends

from app.clients.model import ModelClient, get_model_client
from app.schemas.application import Application
from app.schemas.listing import Listing
from app.schemas.resume import Resume
from app.utils.errors import ServiceError
from app.utils.hash import hash_trimmed_text
from app.utils.text import to_bullets, to_json_string
from shared.schemas.application_analysis import (
  AISuggestions,
  ContentQualityScore,
  ContentQualitySection,
  SkillComparisonRow,
)

from ..base_client import ApplicationAnalysisClient
from .ai_suggestions import (
  DEFAULT_EMPTY_SUGGESTIONS_SUMMARY,
  build_content_quality_lookups,
  build_suggestion_unit_rows,
  map_suggestions_response,
)
from .analysis_text import build_listing_analysis_text, build_resume_analysis_text
from .content_quality import (
  build_lexical_terms,
  build_requirement_texts,
  calculate_content_quality_score,
)
from .prompts import (
  AI_SUGGESTIONS_PROMPT,
  SKILL_REQUIRED_SCORE_PROMPT,
  SKILL_RESUME_SCORE_PROMPT,
)
from .schemas import AISuggestionsResponse
from .skills_comparison import score_skills_from_prompt
from .text_units import extract_section_text_units


class LocalApplicationAnalysisClient(ApplicationAnalysisClient):
  def __init__(
    self,
    llm_client: Annotated[ModelClient, Depends(get_model_client)],
  ) -> None:
    self.llm_client = llm_client
    # Reuse content-quality scores locally without coupling the base client to this optimization.
    self._content_quality_cache: dict[tuple[UUID, UUID, str], list[ContentQualitySection]] = {}

  async def get_skills_comparison(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> list[SkillComparisonRow]:
    skills = listing.skills
    listing_text = build_listing_analysis_text(listing)
    resume_text = build_resume_analysis_text(resume)

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

    required_scores = await score_skills_from_prompt(
      llm_client=self.llm_client,
      skills=skills,
      source_text=listing_text,
      prompt=required_prompt,
    )
    resume_scores = await score_skills_from_prompt(
      llm_client=self.llm_client,
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
    cache_key = (
      listing.id,
      application.id,
      resume.create_hash(),
    )

    if cache_key in self._content_quality_cache:
      return self._content_quality_cache[cache_key]

    requirement_texts = build_requirement_texts(listing)
    if not requirement_texts:
      raise ServiceError('Add requirements to the listing before running content analysis.')

    lexical_terms = build_lexical_terms(listing)
    requirement_embeddings = await self.llm_client.embed(requirement_texts)
    section_summaries: list[ContentQualitySection] = []

    for section in resume.sections:
      section_units = extract_section_text_units(section)
      if not section_units:
        continue

      unit_embeddings = await self.llm_client.embed([text for _, text in section_units])
      scored_units: list[ContentQualityScore] = []

      for (unit_id, text), unit_embedding in zip(section_units, unit_embeddings, strict=True):
        score = calculate_content_quality_score(
          text=text,
          unit_embedding=unit_embedding,
          requirement_embeddings=requirement_embeddings,
          lexical_terms=lexical_terms,
        )
        scored_units.append(
          ContentQualityScore(
            unit_id=unit_id,
            unit_hash=hash_trimmed_text(text),
            score=score,
          )
        )

      section_summaries.append(
        ContentQualitySection(
          section_id=section.id,
          scores=scored_units,
        )
      )

    self._content_quality_cache[cache_key] = section_summaries
    return section_summaries

  async def get_ai_suggestions(
    self,
    listing: Listing,
    application: Application,
    resume: Resume,
  ) -> AISuggestions:
    content_quality = await self.get_content_quality(
      listing=listing,
      application=application,
      resume=resume,
    )
    quality_score_by_unit_id, unit_hash_by_unit_id = build_content_quality_lookups(content_quality)
    unit_rows = build_suggestion_unit_rows(resume, quality_score_by_unit_id)

    if not unit_rows:
      return AISuggestions(
        summary=DEFAULT_EMPTY_SUGGESTIONS_SUMMARY,
      )

    prompt = AI_SUGGESTIONS_PROMPT.format(
      application_name=application.name,
      listing_title=listing.title,
      listing_description=listing.description,
      listing_skills=to_bullets(listing.skills),
      listing_keywords=to_bullets([keyword.word for keyword in listing.keywords]),
      listing_requirements=to_bullets(listing.requirements),
      units_json=to_json_string(unit_rows),
    )
    suggestions_response = await self.llm_client.call_structured(
      input=prompt,
      response_model=AISuggestionsResponse,
    )

    return map_suggestions_response(suggestions_response, unit_hash_by_unit_id)
