from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.schemas.stats import StatsResponse
from app.services.stats import StatsService

router = APIRouter(
  prefix='/dashboard',
  tags=['Dashboard'],
)


@router.get('/stats', response_model=StatsResponse)
async def get_stats(
  stats_service: Annotated[StatsService, Depends()],
  days: Annotated[int, Query(ge=1, le=36500)] = 7,
) -> StatsResponse:
  end_date = datetime.now(UTC).date()
  start_date = end_date - timedelta(days=days)

  return StatsResponse(
    summary=stats_service.get_summary(
      start_date,
      end_date,
    ),
    application_funnel=stats_service.get_funnel(
      start_date,
      end_date,
    ),
    application_history=stats_service.get_history(
      start_date,
      end_date,
    ),
  )
