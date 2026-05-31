import asyncio
from uuid import uuid4

import pytest

from app.clients.model import ModelClient, get_local_model_client
from app.schemas.listing_draft import ListingDraft
from app.services.listing.service import ListingService
from tests.conftest import build_eval_config
from tests.fakes import (
  FakeApplicationRepository,
  FakeListingRepository,
  FakeListingResearchClient,
  FakeScrapingClient,
)

from .golden_cases import GOLDEN_CASES, GoldenCaseId


async def run_listing_draft_eval() -> dict[GoldenCaseId, ListingDraft]:
  config = build_eval_config()
  model_client = get_local_model_client(config)
  service = ListingService(
    listing_repository=FakeListingRepository(),
    application_repository=FakeApplicationRepository(),
    listing_research_client=FakeListingResearchClient(),
    llm_client=model_client,
    scraping_client=FakeScrapingClient(),
  )
  results: dict[GoldenCaseId, ListingDraft] = {}

  for case_id, case in GOLDEN_CASES.items():
    print(f'Running listing-draft eval case: {case_id.value}')
    results[case_id] = await service.generate_listing_draft(
      url=case.url,
      id=uuid4(),
      content=case.content,
    )

  return results


@pytest.fixture(scope='session')
def listing_draft_eval_results() -> dict[GoldenCaseId, ListingDraft]:
  return asyncio.run(run_listing_draft_eval())


@pytest.fixture(scope='session')
def listing_draft_judge_model_client() -> ModelClient:
  return get_local_model_client(build_eval_config())
