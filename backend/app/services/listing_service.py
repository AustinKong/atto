import asyncio
from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from pydantic import HttpUrl

from app.clients import LLMClient, ScrapingClient, get_llm_client, get_scraping_client
from app.clients.listing_research import ListingResearchClient, get_listing_research_client
from app.repositories import ApplicationRepository, ListingRepository
from app.resources.prompts import LISTING_EXTRACTION_PROMPT
from app.schemas import (
  ExtractionResponse,
  Listing,
  ListingDraft,
  ListingDraftDuplicateContent,
  ListingDraftDuplicateUrl,
  ListingDraftError,
  ListingDraftUnique,
  ListingExtraction,
)
from app.utils.text import ground_quote, to_bullets
from app.utils.url import normalize_url


class ListingService:
  def __init__(
    self,
    listing_repository: Annotated[ListingRepository, Depends()],
    application_repository: Annotated[ApplicationRepository, Depends()],
    listing_research_client: Annotated[ListingResearchClient, Depends(get_listing_research_client)],
    llm_client: Annotated[LLMClient, Depends(get_llm_client)],
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

    except Exception as e:
      return ListingDraftError(
        id=id,
        url=url,
        error=str(e),
        screenshot=screenshot,
      )

    listing = ListingExtraction.model_validate(extraction.model_dump())

    for skill in listing.skills:
      if skill.quote:
        skill.quote = ground_quote(skill.quote, content)

    for req in listing.requirements:
      if req.quote:
        req.quote = ground_quote(req.quote, content)

    if similar_match := self.listing_repository.find_similar(
      Listing(
        **listing.model_dump(exclude={'skills', 'requirements'}),
        skills=[skill.value for skill in listing.skills],
        requirements=[req.value for req in listing.requirements],
        id=id,
        url=url,
      )
    ):
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

  async def generate_insights(
    self,
    listing_id: UUID,
  ) -> Listing:
    listing = self.listing_repository.get(listing_id)

    sentiment, salary, market = await asyncio.gather(
      self.listing_research_client.get_sentiment_analysis(listing),
      self.listing_research_client.get_salary_range(listing),
      self.listing_research_client.get_market_context(listing),
    )

    insights_result = await self.listing_research_client.get_applicant_insights(
      listing=listing,
      sentiment=sentiment,
      salary=salary,
      market=market,
    )
    # TODO: How to store? Maybe need to change db schema
    insights_text = self._format_insights(insights_result.insights)

    updated_listing = self.listing_repository.update_insights(listing_id, insights_text)
    updated_listing.applications = self.application_repository.get_by_listing_id(listing_id)

    return updated_listing

  @staticmethod
  def _format_insights(insights: list[str]) -> str | None:
    if not insights:
      return None
    formatted = to_bullets(insights, empty_message='')
    return formatted.strip() or None
