import asyncio

import httpx

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
  SENTIMENT_PROMPT_TEMPLATE,
  SENTIMENT_SEARCH_QUERY,
)


class CloudListingResearchClient(ListingResearchClient):
  def __init__(
    self,
    llm_client: ModelClient,
    scraping_client: ScrapingClient,
  ):
    self.llm_client = llm_client
    self.scraping_client = scraping_client

  async def get_sentiment_analysis(self, listing: Listing) -> SentimentAnalysisResult:
    query = SENTIMENT_SEARCH_QUERY.format(company=listing.company)

    # Limit to fewer max results since cloud results should be higher quality
    search_and_crawl_results = await self.scraping_client.search_and_crawl(
      search_fn=lambda: self.scraping_client.search(
        query,
        max_results=3,
      ),
      crawl_fn=self.scraping_client.crawl,
      max_results=10,
    )

    # TODO: Create an API client that handles auth and error handling instead of raw httpx calls.
    async with httpx.AsyncClient() as http_client:
      response = await http_client.get(
        'cloud/glassdoor-sentiment-analysis',
        params={'company': listing.company, 'role': listing.title},
      )
      response.raise_for_status()
      _sentiment_results = response.json()

    prompt = SENTIMENT_PROMPT_TEMPLATE.format(
      listing_json=listing.model_dump_json(),
      research_context=self.format_crawl_results(search_and_crawl_results),
      # TODO: Join with sentiment_results
    )
    return await self.llm_client.call_structured(prompt, SentimentAnalysisResult)

  async def get_salary_range(self, listing: Listing) -> SalaryRangeResult:
    async with httpx.AsyncClient() as http_client:
      response = await http_client.get(
        'cloud/salary-range',
        params={'company': listing.company, 'role': listing.title, 'location': listing.location},
      )
      response.raise_for_status()
      results = response.json()

    return SalaryRangeResult.model_validate(results)

  async def get_market_context(self, listing: Listing) -> MarketContextResult:
    async with httpx.AsyncClient() as http_client:
      response = await http_client.get(
        'cloud/market-context',
        params={'company': listing.company, 'role': listing.title},
      )
      response.raise_for_status()
      _market_results = response.json()

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
    # TODO: Join with cloud results
    prompt = MARKET_PROMPT_TEMPLATE.format(
      listing_json=to_json_string(listing),
      research_context=self.format_crawl_results(combined),
    )
    response_text = await self.llm_client.call_unstructured(prompt)
    return MarketContextResult(summary=response_text.strip())
