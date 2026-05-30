from typing import cast
from uuid import uuid4

import pytest

from app.clients.application_analysis.local.client import LocalApplicationAnalysisClient
from app.clients.application_analysis.local.content_quality import build_requirement_texts
from app.clients.application_analysis.local.schemas import AISuggestionsResponse
from app.clients.application_analysis.local.text_units import extract_section_text_units
from app.schemas.listing import Listing
from app.schemas.resume import DetailedSection, Resume
from app.utils.errors import ServiceError
from app.utils.hash import hash_trimmed_text
from shared.schemas.application_analysis import SkillScoreResult, SkillScoreRow
from tests.application_analysis.constants import (
  SEMANTIC_MATCH_EMBEDDING,
  SEMANTIC_MISMATCH_EMBEDDING,
)
from tests.fakes.model_client import FakeModelClient

from ..factories import (
  make_application,
  make_detailed_section,
  make_listing,
  make_resume,
  make_simple_section,
)

pytestmark = pytest.mark.integration

HIGH_REQUIRED_SKILL_SCORE = 90
HIGH_RESUME_SKILL_SCORE = 90
LOW_RESUME_SKILL_SCORE = 5
MODERATE_REQUIRED_SKILL_SCORE = 30
MODERATE_RESUME_SKILL_SCORE = 30
STRONG_REQUIRED_SKILL_SCORE = 80
STRONG_RESUME_SKILL_SCORE = 80
STRONG_RESUME_ACCEPTANCE_THRESHOLD = 0.8
WEAK_RESUME_REJECTION_THRESHOLD = 0.35
SKILL_SCORE_MODEL_CALL_COUNT = 2
CACHED_CONTENT_QUALITY_EMBEDDING_CALL_COUNT = 3
ANALYSIS_WITHOUT_SUGGESTION_MODEL_CALL_COUNT = 2
ANALYSIS_WITH_SUGGESTION_MODEL_CALL_COUNT = 3


def skill_scores(*rows: tuple[str, int]) -> SkillScoreResult:
  return SkillScoreResult(rows=[SkillScoreRow(skill=skill, score=score) for skill, score in rows])


def queue_skill_scores(
  fake_model_client: FakeModelClient,
  *,
  required_score: int,
  resume_score: int,
) -> None:
  fake_model_client.queue_structured(
    skill_scores(('Python', required_score), ('SQL', required_score), ('APIs', required_score)),
    skill_scores(('Python', resume_score), ('SQL', resume_score), ('APIs', resume_score)),
  )


def configure_unit_embeddings(
  fake_model_client: FakeModelClient,
  resume: Resume,
  embedding: list[float],
) -> None:
  for section in resume.sections:
    for _, text in extract_section_text_units(section):
      fake_model_client.set_embedding(text, embedding)


def configure_requirement_embeddings(
  fake_model_client: FakeModelClient,
  listing: Listing,
  embedding: list[float],
) -> None:
  for text in build_requirement_texts(listing):
    fake_model_client.set_embedding(text, embedding)


@pytest.mark.anyio
async def test_generate_analysis_scores_strong_relevant_resume_above_acceptance_threshold(
  fake_model_client: FakeModelClient,
):
  """Runs the real analysis flow with fake model outputs for a strong role-fit resume."""
  listing = make_listing()
  resume = make_resume()
  application = make_application(listing_id=listing.id, resume_id=resume.id)
  configure_requirement_embeddings(fake_model_client, listing, SEMANTIC_MATCH_EMBEDDING)
  configure_unit_embeddings(fake_model_client, resume, SEMANTIC_MATCH_EMBEDDING)
  queue_skill_scores(
    fake_model_client,
    required_score=HIGH_REQUIRED_SKILL_SCORE,
    resume_score=HIGH_RESUME_SKILL_SCORE,
  )

  analysis = await LocalApplicationAnalysisClient(fake_model_client).generate_analysis(
    listing=listing,
    application=application,
    resume=resume,
  )

  assert analysis.match_score >= STRONG_RESUME_ACCEPTANCE_THRESHOLD
  assert analysis.ai_suggestions is not None
  assert not analysis.ai_suggestions.suggestions
  assert len(fake_model_client.structured_calls) == SKILL_SCORE_MODEL_CALL_COUNT
  assert len(fake_model_client.embedding_calls) >= SKILL_SCORE_MODEL_CALL_COUNT


@pytest.mark.anyio
async def test_generate_analysis_scores_weak_generic_resume_below_acceptance_threshold(
  fake_model_client: FakeModelClient,
):
  """A generic resume should stay low when skill evidence and content relevance are both weak."""
  resume = make_resume(
    sections=[
      make_detailed_section(
        'Experience',
        bullets=[
          'Coordinated team meetings and maintained project documentation.',
          'Helped stakeholders track timelines and follow up on open tasks.',
        ],
      ),
      make_simple_section('Skills', ['Communication', 'Scheduling', 'Documentation']),
    ]
  )
  listing = make_listing()
  application = make_application(listing_id=listing.id, resume_id=resume.id)
  configure_requirement_embeddings(fake_model_client, listing, SEMANTIC_MATCH_EMBEDDING)
  configure_unit_embeddings(fake_model_client, resume, SEMANTIC_MISMATCH_EMBEDDING)
  queue_skill_scores(
    fake_model_client,
    required_score=HIGH_REQUIRED_SKILL_SCORE,
    resume_score=LOW_RESUME_SKILL_SCORE,
  )
  fake_model_client.queue_structured(AISuggestionsResponse(summary='Improve role alignment'))

  analysis = await LocalApplicationAnalysisClient(fake_model_client).generate_analysis(
    listing=listing,
    application=application,
    resume=resume,
  )

  assert analysis.match_score <= WEAK_RESUME_REJECTION_THRESHOLD
  assert analysis.ai_suggestions is not None
  assert not analysis.ai_suggestions.suggestions
  assert len(fake_model_client.structured_calls) == ANALYSIS_WITH_SUGGESTION_MODEL_CALL_COUNT


@pytest.mark.anyio
async def test_generate_analysis_reuses_content_quality_scores_for_suggestions(
  fake_model_client: FakeModelClient,
):
  """Content quality embeddings should be cached and reused when suggestions run."""
  listing = make_listing()
  resume = make_resume()
  application = make_application(listing_id=listing.id, resume_id=resume.id)
  configure_requirement_embeddings(fake_model_client, listing, SEMANTIC_MATCH_EMBEDDING)
  configure_unit_embeddings(fake_model_client, resume, SEMANTIC_MATCH_EMBEDDING)
  queue_skill_scores(
    fake_model_client,
    required_score=MODERATE_REQUIRED_SKILL_SCORE,
    resume_score=MODERATE_RESUME_SKILL_SCORE,
  )

  analysis = await LocalApplicationAnalysisClient(fake_model_client).generate_analysis(
    listing=listing,
    application=application,
    resume=resume,
  )

  assert analysis.ai_suggestions is not None
  assert not analysis.ai_suggestions.suggestions
  assert len(fake_model_client.embedding_calls) == CACHED_CONTENT_QUALITY_EMBEDDING_CALL_COUNT
  assert len(fake_model_client.structured_calls) == ANALYSIS_WITHOUT_SUGGESTION_MODEL_CALL_COUNT


@pytest.mark.anyio
async def test_generate_analysis_rejects_incomplete_model_skill_scores(
  fake_model_client: FakeModelClient,
):
  """Rejects partial model skill scores before they can produce a misleading match score."""
  listing = make_listing()
  resume = make_resume()
  application = make_application(listing_id=listing.id, resume_id=resume.id)
  fake_model_client.queue_structured(
    skill_scores(('Python', HIGH_REQUIRED_SKILL_SCORE), ('SQL', HIGH_REQUIRED_SKILL_SCORE))
  )

  with pytest.raises(ServiceError, match='AI response was incomplete'):
    await LocalApplicationAnalysisClient(fake_model_client).generate_analysis(
      listing=listing,
      application=application,
      resume=resume,
    )


@pytest.mark.anyio
async def test_generate_analysis_preserves_resume_unit_ids_and_hashes_across_model_boundaries(
  fake_model_client: FakeModelClient,
):
  """Unit IDs and hashes should survive the model boundary and match source text."""
  bullet_1 = '   Worked on backend systems   '
  bullet_2 = 'Built scalable APIs in Python'

  bullet_1_id = uuid4()
  bullet_2_id = uuid4()

  resume = make_resume(
    sections=[
      make_detailed_section(
        'Experience',
        item_title='Software Engineer',
        bullets=[bullet_1, bullet_2],
      ),
    ],
  )
  experience_section = cast(DetailedSection, resume.sections[0])
  experience_item = experience_section.content[0]
  experience_item.bullets[0].id = bullet_1_id
  experience_item.bullets[1].id = bullet_2_id

  listing = make_listing()
  application = make_application(listing_id=listing.id, resume_id=resume.id)
  configure_requirement_embeddings(fake_model_client, listing, SEMANTIC_MATCH_EMBEDDING)
  configure_unit_embeddings(fake_model_client, resume, SEMANTIC_MATCH_EMBEDDING)
  queue_skill_scores(
    fake_model_client,
    required_score=STRONG_REQUIRED_SKILL_SCORE,
    resume_score=STRONG_RESUME_SKILL_SCORE,
  )
  fake_model_client.queue_structured(
    AISuggestionsResponse(summary='Great job', suggestions=[]),
  )

  analysis = await LocalApplicationAnalysisClient(fake_model_client).generate_analysis(
    listing=listing,
    application=application,
    resume=resume,
  )

  unit_ids_in_content_quality = set()
  for section in analysis.content_quality:
    for score in section.scores:
      unit_ids_in_content_quality.add(score.unit_id)
      if score.unit_id == bullet_1_id:
        assert score.unit_hash == hash_trimmed_text(bullet_1)
      elif score.unit_id == bullet_2_id:
        assert score.unit_hash == hash_trimmed_text(bullet_2)

  assert bullet_1_id in unit_ids_in_content_quality
  assert bullet_2_id in unit_ids_in_content_quality
