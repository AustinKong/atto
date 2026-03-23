import asyncio
from typing import Any, cast

from crawl4ai import AsyncWebCrawler, BrowserConfig, SEOFilter
from crawl4ai import CrawlResult as Crawl4aiResult
from crawl4ai.async_configs import CrawlerRunConfig
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.deep_crawling import BestFirstCrawlingStrategy
from crawl4ai.deep_crawling.filters import ContentRelevanceFilter, FilterChain
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from ddgs import DDGS
from pydantic import HttpUrl

from app.config import settings
from app.utils.deduplication import deduplicate_by
from app.utils.errors import ServiceError

from .base_client import ScrapingClient
from .schemas import (
  CrawlFn,
  CrawlResult,
  DDGSNewsResult,
  DDGSTextResult,
  SearchFn,
  SearchResult,
  Timelimit,
)

# Excluded tags for HTML content cleaning
BASIC_EXCLUDED_TAGS = [
  'script',
  'noscript',
  'object',
  'embed',
  'style',
  'link',
  'meta',
  'svg',
  'canvas',
  'img',
  'image',
]

AGGRESSIVE_EXCLUDED_TAGS = BASIC_EXCLUDED_TAGS + [
  'map',
  'area',
  'video',
  'audio',
  'picture',
  'source',
  'nav',
  'footer',
  'aside',
]


class LocalScrapingClient(ScrapingClient):
  @property
  def base_crawl_config(self) -> dict[str, Any]:
    return {
      # Performance & Reliability
      'remove_overlay_elements': True,
      'process_iframes': True,
      'wait_for_images': False,
      'page_timeout': 30000,
      'verbose': settings.experimental.debug_mode,
      # Content Cleaning
      'remove_forms': True,
      'excluded_tags': AGGRESSIVE_EXCLUDED_TAGS
      if settings.ingestion.aggressive
      else BASIC_EXCLUDED_TAGS,
      'exclude_external_links': True,
      # Respect Policies
      'check_robots_txt': settings.ingestion.web_respect_level == 'strict',
      # Content Quality
      'markdown_generator': DefaultMarkdownGenerator(
        content_filter=PruningContentFilter(
          threshold=0.2, min_word_threshold=3, threshold_type='dynamic'
        ),
        options={
          'ignore_links': True,
          'ignore_images': True,
          'escape_html': False,
        },
      ),
    }

  async def _crawl(
    self,
    url: HttpUrl,
    config: CrawlerRunConfig,
  ) -> Crawl4aiResult | list[Crawl4aiResult]:
    browser_config = BrowserConfig(
      enable_stealth=settings.ingestion.web_respect_level == 'permissive',
      verbose=settings.experimental.debug_mode,
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
      result = await crawler.arun(str(url), config=config)

      # TODO: Remove this function once crawl4ai fixes type hints.
      # See: https://github.com/unclecode/crawl4ai/issues/1543 and https://github.com/unclecode/crawl4ai/pull/1716
      # crawl4ai.arun() returns RunManyReturn but should be properly typed as CrawlResult.
      return cast(Crawl4aiResult | list[Crawl4aiResult], result)

  async def crawl(self, url: HttpUrl) -> CrawlResult:
    config = CrawlerRunConfig(**self.base_crawl_config, screenshot=True)

    try:
      result = await self._crawl(url, config)
      result = cast(Crawl4aiResult, result)

      if not result.success or not result.markdown:
        raise ServiceError(f'Failed to fetch URL: {result.error_message or "Unknown error"}')

      return CrawlResult(
        url=url, content=result.markdown.fit_markdown, screenshot=result.screenshot
      )
    except Exception as e:
      raise ServiceError(f'Failed to crawl {url}: {str(e)}') from e

  async def deep_crawl(
    self,
    url: HttpUrl,
    max_depth: int = 2,
    max_pages: int = 10,
    include_external: bool = False,
    keywords: list[str] | None = None,
  ) -> list[CrawlResult]:
    filter_chain = FilterChain([])
    url_scorer = None

    if keywords:
      filter_chain = FilterChain(
        [SEOFilter(keywords=keywords), ContentRelevanceFilter(query=keywords, threshold=0.5)]
      )
      url_scorer = KeywordRelevanceScorer(keywords=keywords)

    deep_crawl_strategy = BestFirstCrawlingStrategy(
      max_depth=max_depth,
      max_pages=max_pages,
      include_external=include_external,
      url_scorer=url_scorer,
      filter_chain=filter_chain,
    )

    config = CrawlerRunConfig(**self.base_crawl_config, deep_crawl_strategy=deep_crawl_strategy)
    try:
      crawl_summaries: list[CrawlResult] = []

      results = await self._crawl(url, config)
      results = cast(list[Crawl4aiResult], results)

      for result in results:
        if not result.success or not result.markdown:
          continue

        crawl_summaries.append(
          CrawlResult(
            url=HttpUrl(result.url),
            content=result.markdown.fit_markdown,
            screenshot=result.screenshot,
          )
        )

      return crawl_summaries
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to deep crawl {url}: {str(e)}') from e

  async def search(
    self,
    query: str,
    max_results: int = 10,
    timelimit: Timelimit | None = None,
  ) -> list[SearchResult]:
    def sync_search() -> list[SearchResult]:
      results: list[SearchResult] = []
      with DDGS() as ddgs:
        for result in ddgs.text(
          query,
          max_results=max_results,
          timelimit=timelimit.value if timelimit else None,
        ):
          result = DDGSTextResult.model_validate(result)
          results.append(
            SearchResult(
              title=result.title,
              url=HttpUrl(result.href),
              body=result.body,
            )
          )
      return results

    try:
      return await asyncio.to_thread(sync_search)
    except Exception as e:
      raise ServiceError(f'Failed to search for "{query}": {str(e)}') from e

  async def search_news(
    self,
    query: str,
    max_results: int = 10,
    timelimit: Timelimit | None = None,
  ) -> list[SearchResult]:
    def sync_search_news() -> list[SearchResult]:
      results: list[SearchResult] = []
      with DDGS() as ddgs:
        for result in ddgs.news(
          query,
          max_results=max_results,
          timelimit=timelimit.value if timelimit else None,
        ):
          result = DDGSNewsResult.model_validate(result)
          results.append(
            SearchResult(
              title=result.title,
              url=HttpUrl(result.url),
              body=result.body,
            )
          )
      return results

    try:
      return await asyncio.to_thread(sync_search_news)
    except Exception as e:
      raise ServiceError(f'Failed to search news for "{query}": {str(e)}') from e

  async def search_and_crawl(
    self,
    search_fn: SearchFn,
    crawl_fn: CrawlFn,
    max_results: int = 10,
  ) -> list[CrawlResult]:
    try:
      search_results = await search_fn()
    except Exception:
      # TODO: Add logger
      return []

    search_results = deduplicate_by(search_results, key_selector=lambda result: result.url)

    crawl_results = await asyncio.gather(
      *[crawl_fn(result.url) for result in search_results],
      return_exceptions=True,
    )

    results: list[CrawlResult] = []

    for search_result, crawl_result in zip(search_results, crawl_results, strict=True):
      if isinstance(crawl_result, CrawlResult):
        results.append(crawl_result)
      elif isinstance(crawl_result, list):
        results.extend(crawl_result)
      else:
        # If crawling fails, we can still include the search result content as a fallback.
        results.append(CrawlResult(url=search_result.url, content=search_result.body))

    # TODO: Arbitrary truncation for now, consider using crawl_result Crawl4aiResult derived
    # relevance scores for better pruning in the future.
    return results[:max_results]
