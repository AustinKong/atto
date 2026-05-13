import logging
from datetime import UTC, date, datetime
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from pydantic import HttpUrl

from app.clients.listing_research import ListingResearchClient, get_listing_research_client
from app.clients.model import ModelClient, get_model_client
from app.clients.scraping import ScrapingClient, get_scraping_client
from app.repositories import ApplicationRepository, ListingRepository
from app.schemas.listing import ListingResearch
from app.schemas.listing_draft import (
  ListingDraft,
  ListingDraftDuplicateContent,
  ListingDraftDuplicateUrl,
  ListingDraftError,
  ListingDraftUnique,
)
from app.schemas.task_status import TaskStatus
from app.utils.auth_context import use_session_token
from app.utils.url import normalize_url

from .drafts import build_duplicate_candidate, build_listing_extraction
from .prompts import LISTING_EXTRACTION_PROMPT
from .schemas import ExtractionResponse

logger = logging.getLogger(__name__)


class ListingService:
  def __init__(
    self,
    listing_repository: Annotated[ListingRepository, Depends()],
    application_repository: Annotated[ApplicationRepository, Depends()],
    listing_research_client: Annotated[ListingResearchClient, Depends(get_listing_research_client)],
    llm_client: Annotated[ModelClient, Depends(get_model_client)],
    scraping_client: Annotated[ScrapingClient, Depends(get_scraping_client)],
  ) -> None:
    self.listing_repository = listing_repository
    self.application_repository = application_repository
    self.listing_research_client = listing_research_client
    self.llm_client = llm_client
    self.scraping_client = scraping_client

  async def generate_listing_draft(
    self,
    url: HttpUrl,
    id: UUID,
    content: str | None = None,
  ) -> ListingDraft:
    url = normalize_url(url)
    screenshot = None

    if existing_listing := self.listing_repository.get_by_url(url):
      return ListingDraftDuplicateUrl(
        id=id,
        url=url,
        duplicate_of=existing_listing,
      )

    if content is None:
      try:
        crawl_result = await self.scraping_client.crawl(url)
        content = crawl_result.content
        screenshot = crawl_result.screenshot
      except Exception as e:
        return ListingDraftError(
          id=id,
          url=url,
          error=str(e),
        )

    try:
      extraction = await self.llm_client.call_structured(
        input=LISTING_EXTRACTION_PROMPT.format(
          current_date=date.today().isoformat(),
          content=content,
        ),
        response_model=ExtractionResponse,
      )

      if extraction.error:
        raise ValueError(extraction.error)

      listing = build_listing_extraction(extraction, content)

    except Exception as e:
      return ListingDraftError(
        id=id,
        url=url,
        error=str(e),
        screenshot=screenshot,
      )

    # TODO: If salary is null after extraction, look it up via external sources.
    # - Cloud mode: call a salary API (e.g. Levels.fyi, Glassdoor API) using company + title.
    # - Local mode: use scraping_client.search() against sites like nodeflair.com, glassdoor.com.
    similar_match = await self.listing_repository.find_similar(
      build_duplicate_candidate(listing, id, url)
    )
    if similar_match:
      return ListingDraftDuplicateContent(
        id=id,
        url=url,
        listing=listing,
        duplicate_of=similar_match,
        screenshot=screenshot,
      )

    return ListingDraftUnique(
      id=id,
      url=url,
      listing=listing,
      screenshot=screenshot,
    )

  # Must manually plumb the Clerk session cookie because this is a background task
  async def generate_research_task(
    self,
    listing_id: UUID,
    session_token: str | None = None,
  ) -> None:
    with use_session_token(session_token):
      self.listing_repository.set_research_status(listing_id, TaskStatus.RUNNING)

      try:
        listing = self.listing_repository.get(listing_id)

        # Perform sequentially since crawling is very resource intensive
        # TODO: Allow user to crawl in parallel, adding a setting for users with powerful machines
        sentiment = await self.listing_research_client.get_sentiment_analysis(listing)
        salary = await self.listing_research_client.get_salary_range(listing)
        market = await self.listing_research_client.get_market_context(listing)

        insights_result = await self.listing_research_client.get_applicant_insights(
          listing=listing,
          sentiment=sentiment,
          salary=salary,
          market=market,
        )
        research = ListingResearch(
          sentiment=sentiment,
          salary=salary,
          market=market,
          applicant_insights=insights_result,
          generated_at=datetime.now(UTC),
        )

        self.listing_repository.update_research(
          listing_id,
          research.model_dump_json(by_alias=True),
        )
        self.listing_repository.set_research_status(listing_id, TaskStatus.SUCCEEDED)
      except Exception as e:
        self.listing_repository.set_research_status(listing_id, TaskStatus.FAILED, str(e))
        logger.exception('Listing research generation failed for listing %s', listing_id)
