from datetime import UTC, date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.schemas.stats import StatsResponse
from app.services.stats import StatsService
from shared.schemas.dates import ISODate

router = APIRouter(
  prefix='/dashboard',
  tags=['Dashboard'],
)

UNIX_EPOCH_DATE = date(1970, 1, 1)


@router.get('/stats', response_model=StatsResponse)
async def get_stats(
  stats_service: Annotated[StatsService, Depends()],
  start_date: Annotated[ISODate | None, Query(alias='startDate')] = (
    datetime.now(UTC).date() - timedelta(days=7)
  ),
):
  resolved_start_date = None if start_date == UNIX_EPOCH_DATE else start_date
  return StatsResponse(
    application_funnel=stats_service.get_funnel(resolved_start_date),
    application_history=stats_service.get_history(resolved_start_date),
  )
