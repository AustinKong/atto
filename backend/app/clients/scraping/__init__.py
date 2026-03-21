from .base_client import ScrapingClient
from .local_client import LocalScrapingClient
from .schemas import CrawlResult, SearchResult


def get_scraping_client() -> ScrapingClient:
  return LocalScrapingClient()


__all__ = ['ScrapingClient', 'CrawlResult', 'SearchResult', 'get_scraping_client']
