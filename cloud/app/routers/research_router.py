from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.dependencies import require_tokens
from app.services.research_service import ResearchService
from shared.schemas.research import MarketContextResult, SalaryRangeResult, SentimentAnalysisResult

router = APIRouter(prefix='/cloud', tags=['Research'])


@router.get(
  '/glassdoor-sentiment-analysis',
  response_model=SentimentAnalysisResult,
  dependencies=[Depends(require_tokens(cost=10))],
)
async def glassdoor_sentiment_analysis(
  company: Annotated[str, Query()],
  role: Annotated[str, Query()],
  research_service: Annotated[ResearchService, Depends()],
) -> SentimentAnalysisResult:
  return await research_service.get_glassdoor_sentiment(company, role)


@router.get(
  '/salary-range', response_model=SalaryRangeResult, dependencies=[Depends(require_tokens(cost=8))]
)
async def salary_range(
  role: Annotated[str, Query()],
  company: Annotated[str, Query()],
  research_service: Annotated[ResearchService, Depends()],
  location: Annotated[str | None, Query()] = None,
) -> SalaryRangeResult:
  return await research_service.get_salary_range(role, company, location)


@router.get(
  '/market-context',
  response_model=MarketContextResult,
  dependencies=[Depends(require_tokens(cost=12))],
)
async def market_context(
  company: Annotated[str, Query()],
  role: Annotated[str, Query()],
  research_service: Annotated[ResearchService, Depends()],
) -> MarketContextResult:
  return await research_service.get_market_context(company, role)
