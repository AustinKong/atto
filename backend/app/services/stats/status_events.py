from datetime import date

from app.schemas.application import StatusEnum, StatusEvent

ACTIVE_PIPELINE_STATUSES = (
  StatusEnum.APPLIED,
  StatusEnum.SCREENING,
  StatusEnum.INTERVIEW,
  StatusEnum.OFFER_RECEIVED,
)

FIRST_RESPONSE_STATUSES = (
  StatusEnum.SCREENING,
  StatusEnum.INTERVIEW,
  StatusEnum.OFFER_RECEIVED,
  StatusEnum.ACCEPTED,
  StatusEnum.REJECTED,
  StatusEnum.RESCINDED,
)

STATUS_EVENT_START_DATE = date.min
StatusEventsByApplication = dict[str, list[StatusEvent]]


def count_status_events_in_range(
  status_events_by_app: StatusEventsByApplication,
  status: StatusEnum,
  start_date: date,
  end_date: date,
) -> int:
  return sum(
    1
    for events in status_events_by_app.values()
    for event in events
    if event.status == status and start_date <= event.date <= end_date
  )


def get_first_applied_dates_by_app(
  status_events_by_app: StatusEventsByApplication,
  start_date: date,
  end_date: date,
) -> dict[str, date]:
  return {
    application_id: applied_events[0].date
    for application_id, events in status_events_by_app.items()
    if (
      applied_events := [
        event
        for event in events
        if event.status == StatusEnum.APPLIED and start_date <= event.date <= end_date
      ]
    )
  }


def get_first_response_date(
  events: list[StatusEvent],
  applied_date: date,
) -> date | None:
  response_dates = [
    event.date
    for event in events
    if event.date >= applied_date and event.status in FIRST_RESPONSE_STATUSES
  ]

  return response_dates[0] if response_dates else None


def get_status_on_date(
  events: list[StatusEvent],
  target_date: date,
) -> StatusEnum | None:
  current_status = None
  for event in events:
    if event.date > target_date:
      break
    current_status = event.status

  return current_status
