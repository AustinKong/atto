from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.stats import StatsResponse
from app.services.stats import StatsService

router = APIRouter(
  prefix='/dashboard',
  tags=['Dashboard'],
)


@router.get('/stats', response_model=StatsResponse)
async def get_stats(
  stats_service: Annotated[StatsService, Depends()],
  start_date: Annotated[str, Query(alias='startDate')] = '14d',
):
  try:
    parsed_start_date = stats_service.parse_start_date(start_date)
  except ValueError as error:
    raise HTTPException(
      status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
      detail=str(error),
    ) from error

  return await stats_service.get_stats(parsed_start_date)
