from typing import Annotated

from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db_session
from app.dependencies import get_redis
from app.endpoints.glassdoor_sentiment_endpoint import GlassdoorSentimentEndpoint
from app.endpoints.market_context_endpoint import MarketContextEndpoint
from app.endpoints.salary_range_endpoint import SalaryRangeEndpoint
from app.schemas.auth import AuthenticatedUser
from app.schemas.research import MarketContextResult, SalaryRangeResult, SentimentAnalysisResult
from app.services.auth_service import get_authenticated_user
from app.services.request_handler import handle_request

router = APIRouter(prefix='/cloud', tags=['Research'])


@router.get('/glassdoor-sentiment-analysis', response_model=SentimentAnalysisResult)
async def glassdoor_sentiment_analysis(
  company: str,
  role: str,
  user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
  redis: Annotated[Redis, Depends(get_redis)],
  db: Annotated[AsyncSession, Depends(get_db_session)],
  endpoint: Annotated[GlassdoorSentimentEndpoint, Depends()],
) -> SentimentAnalysisResult:
  return await handle_request(user, endpoint, {'company': company, 'role': role}, redis, db)


@router.get('/salary-range', response_model=SalaryRangeResult)
async def salary_range(
  role: str,
  company: str,
  user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
  redis: Annotated[Redis, Depends(get_redis)],
  db: Annotated[AsyncSession, Depends(get_db_session)],
  endpoint: Annotated[SalaryRangeEndpoint, Depends()],
  location: str | None = None,
) -> SalaryRangeResult:
  params = {'role': role, 'company': company}
  if location:
    params['location'] = location
  return await handle_request(user, endpoint, params, redis, db)


@router.get('/market-context', response_model=MarketContextResult)
async def market_context(
  company: str,
  role: str,
  user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
  redis: Annotated[Redis, Depends(get_redis)],
  db: Annotated[AsyncSession, Depends(get_db_session)],
  endpoint: Annotated[MarketContextEndpoint, Depends()],
) -> MarketContextResult:
  return await handle_request(user, endpoint, {'company': company, 'role': role}, redis, db)
