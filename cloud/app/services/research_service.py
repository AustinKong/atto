from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis

from app.clients.glassdoor_client import GlassdoorClient
from app.clients.market_client import MarketClient
from app.clients.salary_client import SalaryClient
from app.dependencies import get_glassdoor_client, get_market_client, get_redis, get_salary_client
from app.utils.redis_keys import cache_key
from shared.schemas.research import (
  MarketContextResult,
  SalaryRangeResult,
  SentimentAnalysisResult,
  SentimentAnalysisSource,
)


class ResearchService:
  def __init__(
    self,
    glassdoor: Annotated[GlassdoorClient, Depends(get_glassdoor_client)],
    salary: Annotated[SalaryClient, Depends(get_salary_client)],
    market: Annotated[MarketClient, Depends(get_market_client)],
    redis: Annotated[Redis, Depends(get_redis)],
  ) -> None:
    self._glassdoor = glassdoor
    self._salary = salary
    self._market = market
    self._redis = redis

  async def get_glassdoor_sentiment(self, company: str, role: str) -> SentimentAnalysisResult:
    ck = cache_key(
      'glassdoor-sentiment',
      f'{company.lower().strip()}:{role.lower().strip()}',
    )
    cached = await self._redis.get(ck)
    if cached:
      return SentimentAnalysisResult.model_validate_json(cached)

    reviews = await self._glassdoor.get_company_reviews(company, role)
    value = min(max(reviews.overall_rating / 5.0, 0.0), 1.0)
    sources = [
      SentimentAnalysisSource(url='https://glassdoor.com', title='Glassdoor', content=review)
      for review in reviews.reviews[:3]
    ]
    result = SentimentAnalysisResult(value=value, sources=sources)
    await self._redis.setex(ck, 43200, result.model_dump_json())
    return result

  async def get_salary_range(
    self,
    role: str,
    company: str,
    location: str | None,
  ) -> SalaryRangeResult:
    location_key = (location or '').lower().strip()
    ck = cache_key(
      'salary-range',
      f'{role.lower().strip()}:{company.lower().strip()}:{location_key}',
    )
    cached = await self._redis.get(ck)
    if cached:
      return SalaryRangeResult.model_validate_json(cached)

    data = await self._salary.get_salary_range(role, company, location)
    result = SalaryRangeResult(
      industry_min=data.industry_min,
      industry_q1=data.industry_q1,
      industry_median=data.industry_median,
      industry_q3=data.industry_q3,
      industry_max=data.industry_max,
      currency=data.currency,
    )
    await self._redis.setex(ck, 86400, result.model_dump_json())
    return result

  async def get_market_context(self, company: str, role: str) -> MarketContextResult:
    ck = cache_key(
      'market-context',
      f'{company.lower().strip()}:{role.lower().strip()}',
    )
    cached = await self._redis.get(ck)
    if cached:
      return MarketContextResult.model_validate_json(cached)

    data = await self._market.get_market_news(company, role)
    snippets = [
      f'{article.title}: {article.snippet}' for article in data.articles if article.snippet
    ]
    summary = ' '.join(snippets[:5]) if snippets else 'No recent market context available.'
    result = MarketContextResult(summary=summary)
    await self._redis.setex(ck, 21600, result.model_dump_json())
    return result
