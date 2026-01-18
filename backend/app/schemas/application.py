from datetime import date
from enum import Enum
from typing import Annotated, Literal
from uuid import UUID, uuid4

from pydantic import Field, field_validator

from app.schemas.dates import ISODate, ISODatetime
from app.schemas.types import CamelModel


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

  # Metadata for ordering StatusEvents in utils/status_ordering.py
  @property
  def priority(self) -> int:
    """Return the priority order for this status (lower = earlier in process)."""
    return {
      self.SAVED: 1,
      self.APPLIED: 2,
      self.SCREENING: 3,
      self.INTERVIEW: 4,
      self.OFFER_RECEIVED: 5,
      self.ACCEPTED: 6,
      self.REJECTED: 7,
      self.GHOSTED: 8,
      self.WITHDRAWN: 9,
      self.RESCINDED: 10,
    }[self]


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
  scheduled_at: ISODatetime | None = None
  location: str | None = None


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
  # resumeId is optional during creation but it's non-nullable in the database and frontend type
  resume_id: UUID | None = None
  status_events: list[StatusEvent] = Field(default_factory=list)
  # Denormalized to significantly simplify listings_service.list_all query
  current_status: StatusEnum = Field(default=StatusEnum.SAVED)
  last_status_at: ISODate = Field(default_factory=date.today)

  @field_validator('status_events')
  @classmethod
  def sort_status_events(cls, events: list[StatusEvent]) -> list[StatusEvent]:
    from app.utils.status_ordering import create_status_event_sort_key

    return sorted(events, key=create_status_event_sort_key(reverse=False))
