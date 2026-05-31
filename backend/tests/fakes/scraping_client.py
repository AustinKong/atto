from dataclasses import dataclass, field

from pydantic import HttpUrl

from app.clients.scraping import ScrapingClient
from app.clients.scraping.schemas import CrawlFn, CrawlResult, SearchFn, SearchResult, Timelimit


@dataclass
class FakeScrapingClient(ScrapingClient):
  crawl_responses: list[CrawlResult | Exception] = field(default_factory=list)
  crawl_calls: list[HttpUrl] = field(default_factory=list)

  async def crawl(self, url: HttpUrl) -> CrawlResult:
    self.crawl_calls.append(url)
    if not self.crawl_responses:
      raise AssertionError('No fake crawl response queued.')

    response = self.crawl_responses.pop(0)
    if isinstance(response, Exception):
      raise response

    return response

  async def deep_crawl(
    self,
    url: HttpUrl,
    max_depth: int,
    max_pages: int,
    include_external: bool,
    keywords: list[str] | None = None,
  ) -> list[CrawlResult]:
    raise AssertionError('deep_crawl should not be called during this test.')

  async def search(
    self,
    query: str,
    max_results: int = 10,
    timelimit: Timelimit | None = None,
  ) -> list[SearchResult]:
    raise AssertionError('search should not be called during this test.')

  async def search_news(
    self,
    query: str,
    max_results: int = 10,
    timelimit: Timelimit | None = None,
  ) -> list[SearchResult]:
    raise AssertionError('search_news should not be called during this test.')

  async def search_and_crawl(
    self,
    search_fn: SearchFn,
    crawl_fn: CrawlFn,
    max_results: int = 10,
  ) -> list[CrawlResult]:
    raise AssertionError('search_and_crawl should not be called during this test.')
