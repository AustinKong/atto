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
  saved: int = 0
  applied: int = 0
  screening: int = 0
  interview: int = 0
  offer_received: int = 0
  accepted: int = 0
  rejected: int = 0
  ghosted: int = 0
  withdrawn: int = 0
  rescinded: int = 0


class ApplicationHistory(CamelModel):
  keys: list[StatusEnum] = Field(default_factory=lambda: [status for status in StatusEnum])
  points: list[ApplicationHistoryPoint] = Field(default_factory=list)


class StatsResponse(CamelModel):
  application_funnel: ApplicationFunnel
  application_history: ApplicationHistory
