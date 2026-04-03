from typing import Annotated

from fastapi import Depends

from app.clients.cloud_api_client import CloudApiClient
from app.clients.model import ModelClient, get_model_client
from app.clients.scraping import ScrapingClient, get_scraping_client
from app.utils.auth_context import is_authorized

from .base_client import ListingResearchClient
from .cloud_client import CloudListingResearchClient
from .local_client import LocalListingResearchClient


def get_listing_research_client(
  llm_client: Annotated[ModelClient, Depends(get_model_client)],
  scraping_client: Annotated[ScrapingClient, Depends(get_scraping_client)],
  cloud_api_client: Annotated[CloudApiClient, Depends(CloudApiClient)],
) -> ListingResearchClient:
  if is_authorized():
    return CloudListingResearchClient(
      llm_client=llm_client,
      scraping_client=scraping_client,
      cloud_api_client=cloud_api_client,
    )

  return LocalListingResearchClient(
    llm_client=llm_client,
    scraping_client=scraping_client,
  )


__all__ = ['ListingResearchClient', 'get_listing_research_client']
