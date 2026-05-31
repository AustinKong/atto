from uuid import uuid4

import pytest
from pydantic import HttpUrl

from app.schemas.listing_draft import (
  ListingDraftDuplicateContent,
  ListingDraftDuplicateUrl,
  ListingDraftError,
  ListingDraftUnique,
)
from app.services.listing.service import ListingService
from tests.fakes import FakeListingRepository, FakeScrapingClient
from tests.fakes.model_client import FakeModelClient

from ..factories import (
  VALID_LISTING_CONTENT,
  make_crawl_result,
  make_extraction_response,
  make_listing,
)

pytestmark = pytest.mark.integration

RAW_JOB_URL = 'https://example.com/jobs/backend-engineer'
NORMALIZED_JOB_URL = HttpUrl('https://example.com/jobs/backend-engineer')
TRACKED_JOB_URL = HttpUrl('http://www.example.com/jobs/backend-engineer?utm_source=feed#top')
SCRAPE_FAILURE_MESSAGE = 'Scrape failed'
MODEL_INVALID_LISTING_ERROR = (
  'Atto could not find a complete job listing there. Paste the job description manually.'
)
HIGH_DUPLICATE_SCORE = 0.96


@pytest.mark.anyio
async def test_generate_listing_draft_returns_duplicate_url_before_scraping_or_model_calls(
  listing_service: ListingService,
  fake_listing_repository: FakeListingRepository,
  fake_scraping_client: FakeScrapingClient,
  fake_model_client: FakeModelClient,
):
  """A known normalized URL should short-circuit before expensive scraping or model work."""
  draft_id = uuid4()
  existing_listing = make_listing(url=RAW_JOB_URL)
  fake_listing_repository.listings_by_url[str(existing_listing.url)] = existing_listing

  draft = await listing_service.generate_listing_draft(
    url=TRACKED_JOB_URL,
    id=draft_id,
  )

  assert isinstance(draft, ListingDraftDuplicateUrl)
  assert draft.id == draft_id
  assert draft.url == NORMALIZED_JOB_URL
  assert draft.duplicate_of == existing_listing
  assert fake_scraping_client.crawl_calls == []
  assert fake_model_client.structured_calls == []


@pytest.mark.anyio
async def test_generate_listing_draft_uses_pasted_content_without_scraping(
  listing_service: ListingService,
  fake_listing_repository: FakeListingRepository,
  fake_scraping_client: FakeScrapingClient,
  fake_model_client: FakeModelClient,
):
  """Pasted job content should be sent directly to extraction and skip web crawling."""
  draft_id = uuid4()
  fake_model_client.queue_structured(
    make_extraction_response(keywords=['Python', 'PostgreSQL', 'Missing'])
  )

  draft = await listing_service.generate_listing_draft(
    url=NORMALIZED_JOB_URL,
    id=draft_id,
    content=VALID_LISTING_CONTENT,
  )

  assert isinstance(draft, ListingDraftUnique)
  assert draft.id == draft_id
  assert draft.screenshot is None
  assert draft.listing.skills == ['Python', 'PostgreSQL', 'REST APIs']
  assert [keyword.word for keyword in draft.listing.keywords] == ['Python', 'PostgreSQL']
  assert fake_scraping_client.crawl_calls == []
  assert len(fake_model_client.structured_calls) == 1
  assert VALID_LISTING_CONTENT in fake_model_client.structured_calls[0].input
  assert len(fake_listing_repository.semantic_duplicate_calls) == 1
  assert len(fake_listing_repository.heuristic_duplicate_calls) == 1


@pytest.mark.anyio
async def test_generate_listing_draft_crawls_when_content_is_missing(
  listing_service: ListingService,
  fake_scraping_client: FakeScrapingClient,
  fake_model_client: FakeModelClient,
):
  """URL-only ingestion should crawl the page and preserve the screenshot on the draft."""
  fake_scraping_client.crawl_responses.append(make_crawl_result())
  fake_model_client.queue_structured(make_extraction_response())

  draft = await listing_service.generate_listing_draft(
    url=NORMALIZED_JOB_URL,
    id=uuid4(),
  )

  assert isinstance(draft, ListingDraftUnique)
  assert draft.screenshot == 'base64-png'
  assert fake_scraping_client.crawl_calls == [NORMALIZED_JOB_URL]
  assert VALID_LISTING_CONTENT in fake_model_client.structured_calls[0].input


@pytest.mark.anyio
async def test_generate_listing_draft_returns_error_when_scraping_fails(
  listing_service: ListingService,
  fake_scraping_client: FakeScrapingClient,
  fake_model_client: FakeModelClient,
):
  """Crawl failures should become user-facing draft errors without invoking the model."""
  fake_scraping_client.crawl_responses.append(RuntimeError(SCRAPE_FAILURE_MESSAGE))

  draft = await listing_service.generate_listing_draft(
    url=NORMALIZED_JOB_URL,
    id=uuid4(),
  )

  assert isinstance(draft, ListingDraftError)
  assert draft.error == SCRAPE_FAILURE_MESSAGE
  assert fake_model_client.structured_calls == []


@pytest.mark.anyio
async def test_generate_listing_draft_returns_error_when_model_marks_page_invalid(
  listing_service: ListingService,
  fake_scraping_client: FakeScrapingClient,
  fake_model_client: FakeModelClient,
):
  """Model-detected non-listing pages should produce an editable draft error with context."""
  fake_scraping_client.crawl_responses.append(make_crawl_result(screenshot='shot'))
  fake_model_client.queue_structured(
    make_extraction_response(
      title=None,
      company=None,
      domain=None,
      location=None,
      description=None,
      posted_date=None,
      error='Page requires login',
    )
  )

  draft = await listing_service.generate_listing_draft(
    url=NORMALIZED_JOB_URL,
    id=uuid4(),
  )

  assert isinstance(draft, ListingDraftError)
  assert draft.error == MODEL_INVALID_LISTING_ERROR
  assert draft.screenshot == 'shot'


@pytest.mark.anyio
async def test_generate_listing_draft_returns_error_for_incomplete_model_response(
  listing_service: ListingService,
  fake_model_client: FakeModelClient,
):
  """Incomplete extraction should fail closed instead of producing a partial listing draft."""
  fake_model_client.queue_structured(
    {
      'title': None,
      'company': 'Example Co',
      'domain': 'example.com',
      'location': None,
      'description': 'Build services.',
      'postedDate': None,
      'skills': [],
      'requirements': [],
      'keywords': [],
      'error': None,
    }
  )

  draft = await listing_service.generate_listing_draft(
    url=NORMALIZED_JOB_URL,
    id=uuid4(),
    content=VALID_LISTING_CONTENT,
  )

  assert isinstance(draft, ListingDraftError)
  assert draft.error == MODEL_INVALID_LISTING_ERROR


@pytest.mark.anyio
async def test_generate_listing_draft_returns_duplicate_content_after_successful_extraction(
  listing_service: ListingService,
  fake_listing_repository: FakeListingRepository,
  fake_scraping_client: FakeScrapingClient,
  fake_model_client: FakeModelClient,
):
  """Content duplicates should surface the extracted draft alongside the matched listing."""
  draft_id = uuid4()
  duplicate = make_listing(title='Backend Engineer', company='Example Co')
  fake_listing_repository.semantic_candidates = [(duplicate, HIGH_DUPLICATE_SCORE)]
  fake_scraping_client.crawl_responses.append(make_crawl_result(screenshot='shot'))
  fake_model_client.queue_structured(make_extraction_response())

  draft = await listing_service.generate_listing_draft(
    url=NORMALIZED_JOB_URL,
    id=draft_id,
  )

  assert isinstance(draft, ListingDraftDuplicateContent)
  assert draft.id == draft_id
  assert draft.duplicate_of == duplicate
  assert draft.listing.title == 'Backend Engineer'
  assert draft.screenshot == 'shot'


@pytest.mark.anyio
async def test_generate_listing_draft_checks_duplicates_with_candidate_id_and_normalized_url(
  listing_service: ListingService,
  fake_listing_repository: FakeListingRepository,
  fake_model_client: FakeModelClient,
):
  """Duplicate checks should use the canonical URL and caller-provided draft id."""
  draft_id = uuid4()
  fake_model_client.queue_structured(make_extraction_response())

  draft = await listing_service.generate_listing_draft(
    url=TRACKED_JOB_URL,
    id=draft_id,
    content=VALID_LISTING_CONTENT,
  )

  assert isinstance(draft, ListingDraftUnique)
  assert fake_listing_repository.get_by_url_calls == [NORMALIZED_JOB_URL]
  candidate = fake_listing_repository.semantic_duplicate_calls[0]
  assert candidate.id == draft_id
  assert candidate.url == NORMALIZED_JOB_URL
