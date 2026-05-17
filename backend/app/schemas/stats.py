from pydantic import Field

from app.schemas.application import StatusEnum
from shared.schemas.dates import ISODate
from shared.schemas.types import CamelModel


class ApplicationFunnelNode(CamelModel):
  id: StatusEnum


class ApplicationFunnelLink(CamelModel):
  source: StatusEnum
  target: StatusEnum
  value: int


class ApplicationFunnel(CamelModel):
  nodes: list[ApplicationFunnelNode] = Field(default_factory=list)
  links: list[ApplicationFunnelLink] = Field(default_factory=list)


class ApplicationHistoryPoint(CamelModel):
  date: ISODate
  counts: dict[StatusEnum, int] = Field(default_factory=dict)


class ApplicationHistory(CamelModel):
  keys: list[StatusEnum] = Field(default_factory=list)
  points: list[ApplicationHistoryPoint] = Field(default_factory=list)


class StatValue(CamelModel):
  value: int | float | None
  trend: float | None = None


class SummaryStats(CamelModel):
  applications_saved: StatValue
  applications_sent: StatValue
  active_pipeline: StatValue
  response_rate: StatValue
  average_days_to_first_response: StatValue


class StatsResponse(CamelModel):
  summary: SummaryStats
  application_funnel: ApplicationFunnel
  application_history: ApplicationHistory
