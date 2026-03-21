from typing import Annotated

from fastapi import Depends

from app.clients.llm import LLMClient, get_llm_client
from app.clients.scraping import ScrapingClient, get_scraping_client

from .base_client import ListingResearchClient
from .local_client import LocalListingResearchClient


def get_listing_research_client(
  llm_client: Annotated[LLMClient, Depends(get_llm_client)],
  scraping_client: Annotated[ScrapingClient, Depends(get_scraping_client)],
) -> ListingResearchClient:
  return LocalListingResearchClient(
    llm_client=llm_client,
    scraping_client=scraping_client,
  )


__all__ = ['ListingResearchClient', 'get_listing_research_client']
