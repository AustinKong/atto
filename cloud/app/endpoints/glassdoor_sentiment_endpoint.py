from typing import Annotated

from fastapi import Depends

from app.clients.glassdoor_client import GlassdoorClient
from app.endpoints.base_endpoint import BaseEndpoint
from app.schemas.research import SentimentAnalysisResult, SentimentAnalysisSource


class GlassdoorSentimentEndpoint(BaseEndpoint[SentimentAnalysisResult, GlassdoorClient]):
  token_cost = 10
  cache_enabled = True
  cache_ttl = 43200  # 12h — Glassdoor data changes slowly
  key = 'glassdoor-sentiment'
  response_model = SentimentAnalysisResult

  def __init__(self, client: Annotated[GlassdoorClient, Depends()]) -> None:
    self.provider_client = client

  def get_cache_key(self, params: dict[str, str]) -> str:
    company = params.get('company', '').lower().strip()
    role = params.get('role', '').lower().strip()
    return f'{company}:{role}'

  async def execute(self, params: dict[str, str]) -> SentimentAnalysisResult:
    reviews = await self.provider_client.get_company_reviews(
      company=params['company'],
      role=params.get('role', ''),
    )
    value = min(max(reviews.overall_rating / 5.0, 0.0), 1.0)
    sources = [
      SentimentAnalysisSource(url='https://glassdoor.com', content=r) for r in reviews.reviews[:3]
    ]
    return SentimentAnalysisResult(value=value, sources=sources)
