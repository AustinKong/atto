import pytest

from app.services.listing.service import ListingService
from tests.fakes import (
  FakeApplicationRepository,
  FakeListingRepository,
  FakeListingResearchClient,
  FakeScrapingClient,
)
from tests.fakes.model_client import FakeModelClient


@pytest.fixture
def fake_listing_repository() -> FakeListingRepository:
  return FakeListingRepository()


@pytest.fixture
def fake_scraping_client() -> FakeScrapingClient:
  return FakeScrapingClient()


@pytest.fixture
def listing_service(
  fake_listing_repository: FakeListingRepository,
  fake_model_client: FakeModelClient,
  fake_scraping_client: FakeScrapingClient,
) -> ListingService:
  return ListingService(
    listing_repository=fake_listing_repository,
    application_repository=FakeApplicationRepository(),
    listing_research_client=FakeListingResearchClient(),
    llm_client=fake_model_client,
    scraping_client=fake_scraping_client,
  )
