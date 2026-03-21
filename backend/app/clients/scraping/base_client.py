from abc import ABC, abstractmethod

from pydantic import HttpUrl

from .schemas import (
  CrawlFn,
  CrawlResult,
  SearchFn,
  SearchResult,
  Timelimit,
)


class ScrapingClient(ABC):
  @abstractmethod
  async def crawl(self, url: HttpUrl) -> CrawlResult:
    """Fetch a single URL."""
    pass

  @abstractmethod
  async def deep_crawl(
    self,
    url: HttpUrl,
    max_depth: int,
    max_pages: int,
    include_external: bool,
    keywords: list[str] | None = None,
  ) -> list[CrawlResult]:
    """Perform a Best-First Search (BestFS) crawl anchored at the given URL."""
    pass

  @abstractmethod
  async def search(
    self,
    query: str,
    max_results: int = 10,
    timelimit: Timelimit | None = None,
  ) -> list[SearchResult]:
    """Search the web using the provider's backend."""
    pass

  @abstractmethod
  async def search_news(
    self,
    query: str,
    max_results: int = 10,
    timelimit: Timelimit | None = None,
  ) -> list[SearchResult]:
    """Search news results using the provider's backend."""
    pass

  @abstractmethod
  async def search_and_crawl(
    self,
    search_fn: SearchFn,
    crawl_fn: CrawlFn,
    max_results: int = 10,
  ) -> list[CrawlResult]:
    """Search and enrich results by crawling each link."""
    pass
