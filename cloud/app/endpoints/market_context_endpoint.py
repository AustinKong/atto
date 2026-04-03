from typing import Annotated

from fastapi import Depends

from app.clients.market_client import MarketClient
from app.endpoints.base_endpoint import BaseEndpoint
from app.schemas.research import MarketContextResult


class MarketContextEndpoint(BaseEndpoint[MarketContextResult, MarketClient]):
  token_cost = 12
  cache_enabled = True
  cache_ttl = 21600  # 6h — market news changes more frequently
  key = 'market-context'
  response_model = MarketContextResult

  def __init__(self, client: Annotated[MarketClient, Depends()]) -> None:
    self.provider_client = client

  def get_cache_key(self, params: dict[str, str]) -> str:
    company = params.get('company', '').lower().strip()
    role = params.get('role', '').lower().strip()
    return f'{company}:{role}'

  async def execute(self, params: dict[str, str]) -> MarketContextResult:
    data = await self.provider_client.get_market_news(
      company=params['company'],
      role=params.get('role', ''),
    )
    snippets = [f'{a.title}: {a.snippet}' for a in data.articles if a.snippet]
    summary = ' '.join(snippets[:5]) if snippets else 'No recent market context available.'
    return MarketContextResult(summary=summary)
