from abc import ABC, abstractmethod

from app.clients.model import ModelClient
from app.clients.scraping import ScrapingClient
from app.clients.scraping.schemas import CrawlResult
from app.schemas.listing import (
  ApplicantInsightsResult,
  Listing,
  MarketContextResult,
  SalaryRangeResult,
  SentimentAnalysisResult,
)
from app.utils.text import to_bullets, to_json_string

from .constants import APPLICANT_INSIGHTS_PROMPT_TEMPLATE


class ListingResearchClient(ABC):
  llm_client: ModelClient
  scraping_client: ScrapingClient

  @abstractmethod
  async def get_sentiment_analysis(
    self,
    listing: Listing,
  ) -> SentimentAnalysisResult:
    """Analyze the sentiment of the job listing and company."""
    pass

  @abstractmethod
  async def get_salary_range(
    self,
    listing: Listing,
  ) -> SalaryRangeResult:
    """Research and estimate the salary range for the given listing."""
    pass

  @abstractmethod
  async def get_market_context(
    self,
    listing: Listing,
  ) -> MarketContextResult:
    """Gather market context, industry trends, and demand for the role."""
    pass

  async def get_applicant_insights(
    self,
    listing: Listing,
    sentiment: SentimentAnalysisResult,
    salary: SalaryRangeResult,
    market: MarketContextResult,
  ) -> ApplicantInsightsResult:
    """
    Combine listing data and gathered research to produce final applicant insights.
    """
    prompt = APPLICANT_INSIGHTS_PROMPT_TEMPLATE.format(
      listing_json=to_json_string(listing),
      sentiment_json=to_json_string(sentiment),
      salary_json=to_json_string(salary),
      market_summary=market.summary,
      listing_description=listing.description,
      listing_requirements=to_bullets(listing.requirements),
    )
    response = await self.llm_client.call_structured(
      prompt,
      ApplicantInsightsResult,
    )
    return response

  @staticmethod
  def format_crawl_results(results: list[CrawlResult]) -> str:
    if not results:
      return 'No external research results were retrieved.'

    chunks = [
      f'[Source {idx}] {result.url}\n{result.content.strip()}'
      for idx, result in enumerate(results, start=1)
      if result.content.strip()
    ]

    if not chunks:
      return 'External sources returned no readable content.'

    return '\n\n'.join(chunks)
