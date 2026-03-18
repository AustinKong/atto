from typing import Any, cast

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlResult
from crawl4ai.async_configs import CrawlerRunConfig
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.deep_crawling import BestFirstCrawlingStrategy
from crawl4ai.deep_crawling.filters import ContentRelevanceFilter, FilterChain
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from ddgs import DDGS
from pydantic import BaseModel, HttpUrl

from app.config import settings
from app.utils.errors import ServiceError


class ScrapingResult(BaseModel):
  content: str
  screenshot: str | None = None


# Excluded tags for HTML content cleaning
BASIC_EXCLUDED_TAGS = [
  'script',
  'noscript',
  'iframe',
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


def _extract_crawl_results(result_data: Any) -> list[Any]:
  """
  Extract CrawlResult objects from the crawler response.

  The response can be either:
  - A list of CrawlResultContainer objects (from deep_crawl)
  - A CrawlResultContainer object (from single crawl)

  Each container is iterable and yields CrawlResult objects.
  """
  if isinstance(result_data, list):
    # Deep crawl returns a list of containers
    crawl_results = []
    for container in result_data:
      for item in container:
        crawl_results.append(item)
    return crawl_results
  else:
    # Single crawl returns a container directly
    return list(container for container in result_data)


def _cast_to_crawl_result(result: Any) -> CrawlResult:
  """
  Cast crawl4ai response to CrawlResult type.

  TODO: Remove this function once crawl4ai fixes type hints.
  See: https://github.com/unclecode/crawl4ai/issues/1543
  And: https://github.com/unclecode/crawl4ai/pull/1716
  crawl4ai.arun() returns RunManyReturn but should be properly typed as CrawlResult.
  Current workaround casts the response to CrawlResult for proper type hints.
  """
  return cast(CrawlResult, result)


class ScrapingService:
  async def fetch_and_clean(self, url: HttpUrl) -> ScrapingResult:
    try:
      # Map respect level to check_robots_txt boolean
      # STRICT & OPTIONAL: check robots.txt, PERMISSIVE: don't check + use stealth
      respect_level = settings.ingestion.web_respect_level
      check_robots = respect_level != 'permissive'

      # Configure markdown generation with pruning filter for clean, structured content
      # Higher threshold (0.7+) is better for noisy sites with repetitive boilerplate
      md_generator = DefaultMarkdownGenerator(
        content_filter=PruningContentFilter(
          threshold=0.7,  # Increased from 0.5 to be more aggressive
          threshold_type='fixed',  # Use fixed for more predictable filtering
          min_word_threshold=50,  # Increased from 10 to reject short snippets
        ),
        options={
          'ignore_links': True,
          'escape_html': False,
        },
      )

      # Configure crawl4ai with screenshot capture and markdown generation
      excluded_tags = (
        AGGRESSIVE_EXCLUDED_TAGS if settings.ingestion.aggressive else BASIC_EXCLUDED_TAGS
      )
      config = CrawlerRunConfig(
        screenshot=True,
        remove_forms=True,
        markdown_generator=md_generator,
        excluded_tags=excluded_tags,
        check_robots_txt=check_robots,
      )

      # Use stealth mode for permissive level
      if respect_level == 'permissive':
        browser_config = BrowserConfig(enable_stealth=True)
        async with AsyncWebCrawler(config=browser_config) as crawler:
          result_raw = await crawler.arun(str(url), config=config)
          result = _cast_to_crawl_result(result_raw)
      else:
        async with AsyncWebCrawler() as crawler:
          result_raw = await crawler.arun(str(url), config=config)
          result = _cast_to_crawl_result(result_raw)

      if not result.success or not result.html:
        raise ServiceError(f'Failed to fetch URL: {result.error_message or "Unknown error"}')

      # Use fit_markdown (pruned, structured content) for better LLM processing
      markdown_content = result.markdown.fit_markdown if result.markdown else ''

      # Debug: Log if markdown is empty
      if not markdown_content:
        print(f'[DEBUG] Empty markdown for {url}')
        print(f'[DEBUG] result.markdown: {result.markdown}')
        print(f'[DEBUG] result.html length: {len(result.html) if result.html else 0}')
        if result.markdown:
          print(f'[DEBUG] fit_markdown: {result.markdown.fit_markdown[:200]}...')
          print(f'[DEBUG] raw_markdown: {result.markdown.raw_markdown[:200]}...')

      # Get screenshot (base64-encoded PNG)
      screenshot = result.screenshot

      return ScrapingResult(content=markdown_content, screenshot=screenshot)
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to fetch and clean page {url}: {str(e)}') from e

  async def deep_crawl(
    self,
    url: HttpUrl,
    max_depth: int = 2,
    max_pages: int = 50,
    include_external: bool = False,
  ) -> str:
    """
    Perform a deep crawl of a website using BFS strategy.

    Args:
      url: The starting URL to crawl
      max_depth: Maximum crawl depth (default: 2)
      max_pages: Maximum number of pages to crawl (default: 50)
      include_external: Whether to follow external links (default: False)

    Returns:
      Combined markdown content from all successfully crawled pages
    """
    try:
      # Map respect level to check_robots_txt boolean
      # STRICT & OPTIONAL: check robots.txt, PERMISSIVE: don't check
      respect_level = settings.ingestion.web_respect_level
      check_robots = respect_level != 'permissive'

      # Configure markdown generation with pruning filter for clean, structured content
      # Higher threshold (0.7+) is better for noisy sites with repetitive boilerplate
      md_generator = DefaultMarkdownGenerator(
        content_filter=PruningContentFilter(
          threshold=0.7,  # Increased from 0.5 to be more aggressive
          threshold_type='fixed',  # Use fixed for more predictable filtering
          min_word_threshold=50,  # Increased from 10 to reject short snippets
        ),
        options={
          'ignore_links': True,
          'escape_html': False,
        },
      )

      # Configure deep crawl strategy with keyword-based relevance scoring
      # BestFirstCrawlingStrategy prioritizes more relevant pages first
      excluded_tags = (
        AGGRESSIVE_EXCLUDED_TAGS if settings.ingestion.aggressive else BASIC_EXCLUDED_TAGS
      )

      # Create a keyword scorer to focus on relevant content
      # Keywords help the crawler prioritize pages about the company
      # The scorer uses keyword matching on page content, which is better than URL patterns
      scorer = KeywordRelevanceScorer(
        keywords=[
          'company',
          'about',
          'careers',
          'team',
          'mission',
          'culture',
          'services',
          'products',
        ],
        weight=0.7,
      )

      # Create a sophisticated filter chain to improve page ranking
      # ContentRelevanceFilter measures semantic similarity to company research query
      filter_chain = FilterChain(
        [
          ContentRelevanceFilter(
            query='company information careers team culture products services engineering',
            threshold=0.3,  # Lower threshold to include diverse relevant content
          ),
        ]
      )

      deep_crawl_config = CrawlerRunConfig(
        deep_crawl_strategy=BestFirstCrawlingStrategy(
          max_depth=min(max_depth, 5),  # Limit to 5 page depth maximum
          max_pages=max_pages,
          include_external=include_external,
          url_scorer=scorer,
          filter_chain=filter_chain,
        ),
        screenshot=False,
        remove_forms=True,
        markdown_generator=md_generator,
        excluded_tags=excluded_tags,
        check_robots_txt=check_robots,
      )

      markdown_contents: list[str] = []

      # Use stealth mode for permissive level
      if respect_level == 'permissive':
        browser_config = BrowserConfig(enable_stealth=True)
        async with AsyncWebCrawler(config=browser_config) as crawler:
          result_raw = await crawler.arun(str(url), config=deep_crawl_config)
          result = _cast_to_crawl_result(result_raw)
      else:
        async with AsyncWebCrawler() as crawler:
          result_raw = await crawler.arun(str(url), config=deep_crawl_config)
          result = _cast_to_crawl_result(result_raw)

      # Extract all CrawlResult objects from response
      crawl_results = _extract_crawl_results(result)

      # Process each crawled page (filtering is now done by ContentRelevanceFilter in chain)
      for crawl_result in crawl_results:
        if crawl_result.success:
          # Use fit_markdown (pruned, structured content) for better LLM processing
          markdown_content = crawl_result.markdown.fit_markdown if crawl_result.markdown else ''
          if markdown_content:
            markdown_contents.append(markdown_content)

      # Join all markdown content with clear separators
      return '\n\n---\n\n'.join(markdown_contents)
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to deep crawl {url}: {str(e)}') from e

  def search(self, query: str, max_results: int = 10) -> list[dict[str, str]]:
    """
    Search the web using DuckDuckGo Search (ddgs).

    Args:
      query: The search query string
      max_results: Maximum number of results to return (default: 10)

    Returns:
      List of dictionaries with 'title', 'href', and 'body' keys for each result.
    """
    try:
      results = []
      with DDGS() as ddgs:
        for result in ddgs.text(query, max_results=max_results):
          results.append(
            {
              'title': result.get('title', ''),
              'href': result.get('href', ''),
              'body': result.get('body', ''),
            }
          )
      return results
    except Exception as e:
      raise ServiceError(f'Failed to search for "{query}": {str(e)}') from e
