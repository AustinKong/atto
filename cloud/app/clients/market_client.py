import httpx
from pydantic import BaseModel

from app.clients.base_client import ProviderClient, throttled
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

  def __init__(self, http_client: httpx.AsyncClient) -> None:
    super().__init__()
    self._http_client = http_client
    self._api_key = settings.market_api_key

  @throttled
  async def get_market_news(self, company: str, role: str) -> MarketData:
    # TODO: replace with real news/market API endpoint
    response = await self._http_client.get(
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
