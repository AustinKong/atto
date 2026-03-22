from __future__ import annotations

import asyncio

from app.clients.model import ModelClient
from app.clients.scraping import ScrapingClient
from app.schemas.listing import (
  Listing,
  MarketContextResult,
  SalaryRangeResult,
  SentimentAnalysisResult,
)
from app.utils.text import to_json_string

from .base_client import ListingResearchClient
from .constants import (
  MARKET_MAX_RESULTS,
  MARKET_PROMPT_TEMPLATE,
  MARKET_SEARCH_QUERY_1,
  MARKET_SEARCH_QUERY_2,
  SALARY_MAX_RESULTS,
  SALARY_PROMPT_TEMPLATE,
  SALARY_SEARCH_QUERY,
  SENTIMENT_PROMPT_TEMPLATE,
  SENTIMENT_SEARCH_QUERY,
)


class LocalListingResearchClient(ListingResearchClient):
  def __init__(
    self,
    llm_client: ModelClient,
    scraping_client: ScrapingClient,
  ):
    self.llm_client = llm_client
    self.scraping_client = scraping_client

  async def get_sentiment_analysis(self, listing: Listing) -> SentimentAnalysisResult:
    query = SENTIMENT_SEARCH_QUERY.format(company=listing.company)

    results = await self.scraping_client.search_and_crawl(
      search_fn=lambda: self.scraping_client.search(
        query,
        max_results=5,
      ),
      crawl_fn=self.scraping_client.crawl,
      max_results=15,
    )

    prompt = SENTIMENT_PROMPT_TEMPLATE.format(
      listing_json=listing.model_dump_json(),
      research_context=self.format_crawl_results(results),
    )
    return await self.llm_client.call_structured(prompt, SentimentAnalysisResult)

  async def get_salary_range(self, listing: Listing) -> SalaryRangeResult:
    location_hint = f'near {listing.location}' if listing.location else ''
    query = SALARY_SEARCH_QUERY.format(
      title=listing.title,
      company=listing.company,
      location=location_hint,
    ).strip()
    documents = await self.scraping_client.search_and_crawl(
      search_fn=lambda: self.scraping_client.search(
        query,
        max_results=SALARY_MAX_RESULTS,
      ),
      crawl_fn=self.scraping_client.crawl,
      max_results=SALARY_MAX_RESULTS,
    )
    prompt = SALARY_PROMPT_TEMPLATE.format(
      listing_json=to_json_string(listing),
      research_context=self.format_crawl_results(documents),
    )
    return await self.llm_client.call_structured(prompt, SalaryRangeResult)

  async def get_market_context(self, listing: Listing) -> MarketContextResult:
    query_one = MARKET_SEARCH_QUERY_1.format(company=listing.company)
    query_two = MARKET_SEARCH_QUERY_2.format(title=listing.title)
    results_one, results_two = await asyncio.gather(
      self.scraping_client.search_and_crawl(
        search_fn=lambda: self.scraping_client.search_news(
          query_one,
          max_results=MARKET_MAX_RESULTS,
        ),
        crawl_fn=self.scraping_client.crawl,
        max_results=MARKET_MAX_RESULTS,
      ),
      self.scraping_client.search_and_crawl(
        search_fn=lambda: self.scraping_client.search_news(
          query_two,
          max_results=MARKET_MAX_RESULTS,
        ),
        crawl_fn=self.scraping_client.crawl,
        max_results=MARKET_MAX_RESULTS,
      ),
    )
    combined = (results_one + results_two)[:MARKET_MAX_RESULTS]
    prompt = MARKET_PROMPT_TEMPLATE.format(
      listing_json=to_json_string(listing),
      research_context=self.format_crawl_results(combined),
    )
    response_text = await self.llm_client.call_unstructured(prompt)
    return MarketContextResult(summary=response_text.strip())
