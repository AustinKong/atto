from typing import Annotated

from fastapi import Depends

from app.services.config import get_settings
from app.services.config.schemas import AppConfig

from .base_client import ScrapingClient
from .local_client import LocalScrapingClient
from .schemas import CrawlResult, SearchResult


def get_scraping_client(config: Annotated[AppConfig, Depends(get_settings)]) -> ScrapingClient:
  return LocalScrapingClient(config)


__all__ = ['ScrapingClient', 'CrawlResult', 'SearchResult', 'get_scraping_client']
