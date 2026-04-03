from typing import Annotated

import httpx
from fastapi import Depends
from pydantic import BaseModel

from app.clients.base_client import ProviderClient
from app.dependencies import get_http_client
from app.utils.settings import settings


class MarketArticle(BaseModel):
  title: str
  url: str
  snippet: str


class MarketData(BaseModel):
  articles: list[MarketArticle]


class MarketClient(ProviderClient):
  provider_name = 'market'
  bucket_capacity = 150
  refill_rate = 1.5

  def __init__(self, http: Annotated[httpx.AsyncClient, Depends(get_http_client)]) -> None:
    self._api_key = settings.market_api_key
    self._http = http

  async def get_market_news(self, company: str, role: str) -> MarketData:
    # TODO: replace with real news/market API endpoint
    response = await self._http.get(
      'https://newsapi.org/v2/everything',
      params={'apiKey': self._api_key, 'q': f'{company} {role}', 'pageSize': '10'},
    )
    response.raise_for_status()
    data = response.json()
    articles = [
      MarketArticle(
        title=a.get('title', ''),
        url=a.get('url', ''),
        snippet=a.get('description', ''),
      )
      for a in data.get('articles', [])
    ]
    return MarketData(articles=articles)
