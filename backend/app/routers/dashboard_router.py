from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.schemas.stats import StatsResponse
from app.services.stats import StatsService
from shared.schemas.dates import ISODate

router = APIRouter(
  prefix='/dashboard',
  tags=['Dashboard'],
)


@router.get('/stats', response_model=StatsResponse)
async def get_stats(
  stats_service: Annotated[StatsService, Depends()],
  start_date: Annotated[ISODate | None, Query(alias='startDate')] = None,
):
  return StatsResponse(
    application_funnel=stats_service.get_funnel(start_date),
    application_history=stats_service.get_history(start_date),
  )
