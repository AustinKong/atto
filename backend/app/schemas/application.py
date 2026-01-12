from datetime import date
from enum import Enum
from typing import Annotated, Literal
from uuid import UUID, uuid4

from pydantic import Field, field_validator

from app.schemas.dates import ISODate
from app.schemas.types import CamelModel
from app.utils.status_ordering import create_status_event_sort_key


class StatusEnum(str, Enum):
  SAVED = 'saved'
  APPLIED = 'applied'
  SCREENING = 'screening'
  INTERVIEW = 'interview'
  OFFER_RECEIVED = 'offer_received'
  ACCEPTED = 'accepted'
  REJECTED = 'rejected'
  GHOSTED = 'ghosted'
  WITHDRAWN = 'withdrawn'
  RESCINDED = 'rescinded'


class Person(CamelModel):
  name: str
  contact: str | None = None


class BaseStatusEvent(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  date: ISODate = Field(default_factory=date.today)
  notes: str | None = None


class StatusEventSaved(BaseStatusEvent):
  status: Literal[StatusEnum.SAVED] = StatusEnum.SAVED


class StatusEventApplied(BaseStatusEvent):
  status: Literal[StatusEnum.APPLIED] = StatusEnum.APPLIED
  referrals: list[Person] = Field(default_factory=list)


class StatusEventScreening(BaseStatusEvent):
  status: Literal[StatusEnum.SCREENING] = StatusEnum.SCREENING


class StatusEventInterview(BaseStatusEvent):
  status: Literal[StatusEnum.INTERVIEW] = StatusEnum.INTERVIEW
  stage: int
  interviewers: list[Person] = Field(default_factory=list)
  # TODO: Add date/time field? Location field?


class StatusEventOfferReceived(BaseStatusEvent):
  status: Literal[StatusEnum.OFFER_RECEIVED] = StatusEnum.OFFER_RECEIVED


class StatusEventAccepted(BaseStatusEvent):
  status: Literal[StatusEnum.ACCEPTED] = StatusEnum.ACCEPTED


class StatusEventRejected(BaseStatusEvent):
  status: Literal[StatusEnum.REJECTED] = StatusEnum.REJECTED


class StatusEventGhosted(BaseStatusEvent):
  status: Literal[StatusEnum.GHOSTED] = StatusEnum.GHOSTED


class StatusEventWithdrawn(BaseStatusEvent):
  status: Literal[StatusEnum.WITHDRAWN] = StatusEnum.WITHDRAWN


class StatusEventRescinded(BaseStatusEvent):
  status: Literal[StatusEnum.RESCINDED] = StatusEnum.RESCINDED


StatusEvent = Annotated[
  StatusEventSaved
  | StatusEventApplied
  | StatusEventScreening
  | StatusEventInterview
  | StatusEventOfferReceived
  | StatusEventAccepted
  | StatusEventRejected
  | StatusEventGhosted
  | StatusEventWithdrawn
  | StatusEventRescinded,
  Field(discriminator='status'),
]


class Application(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  listing_id: UUID
  resume_id: UUID | None = None
  status_events: list[StatusEvent] = Field(default_factory=list)
  # Denormalized to significantly simplify listings_service.list_all query
  current_status: StatusEnum = Field(default=StatusEnum.SAVED)
  last_status_at: ISODate = Field(default_factory=date.today)

  @field_validator('status_events')
  @classmethod
  def sort_status_events(cls, events: list[StatusEvent]) -> list[StatusEvent]:
    return sorted(events, key=create_status_event_sort_key(reverse=False))
