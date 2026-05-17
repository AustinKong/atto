from collections import defaultdict
from datetime import date, timedelta
from typing import Annotated

from fastapi import Depends

from app.repositories import ApplicationRepository
from app.schemas.application import StatusEnum
from app.schemas.stats import (
  ApplicationFunnel,
  ApplicationFunnelLink,
  ApplicationFunnelNode,
  ApplicationHistory,
  ApplicationHistoryPoint,
  StatValue,
  SummaryStats,
)
from app.services.stats.status_events import (
  ACTIVE_PIPELINE_STATUSES,
  STATUS_EVENT_START_DATE,
  StatusEventsByApplication,
  count_status_events_in_range,
  get_first_applied_dates_by_app,
  get_first_response_date,
  get_status_on_date,
)


class StatsService:
  def __init__(
    self,
    application_repository: Annotated[ApplicationRepository, Depends()],
  ) -> None:
    self.application_repository = application_repository

  def get_summary(
    self,
    start_date: date,
    end_date: date,
  ) -> SummaryStats:
    status_events_by_app = self._get_status_events_by_app(
      STATUS_EVENT_START_DATE,
      end_date,
    )

    previous_end_date = start_date - timedelta(days=1)
    previous_start_date = previous_end_date - (end_date - start_date)

    applications_saved = self.get_applications_saved(
      status_events_by_app,
      start_date,
      end_date,
    )
    previous_applications_saved = self.get_applications_saved(
      status_events_by_app,
      previous_start_date,
      previous_end_date,
    )

    applications_sent = self.get_applications_sent(
      status_events_by_app,
      start_date,
      end_date,
    )
    previous_applications_sent = self.get_applications_sent(
      status_events_by_app,
      previous_start_date,
      previous_end_date,
    )

    active_pipeline = self.get_active_pipeline_at(status_events_by_app, end_date)
    previous_active_pipeline = self.get_active_pipeline_at(
      status_events_by_app,
      previous_end_date,
    )

    response_rate = self.get_response_rate(status_events_by_app, start_date, end_date)
    previous_response_rate = self.get_response_rate(
      status_events_by_app,
      previous_start_date,
      previous_end_date,
    )

    average_days_to_first_response = self.get_average_days_to_first_response(
      status_events_by_app,
      start_date,
      end_date,
    )
    previous_average_days_to_first_response = self.get_average_days_to_first_response(
      status_events_by_app,
      previous_start_date,
      previous_end_date,
    )

    return SummaryStats(
      applications_saved=StatValue(
        value=applications_saved,
        trend=(applications_saved - previous_applications_saved) / previous_applications_saved
        if previous_applications_saved
        else None,
      ),
      applications_sent=StatValue(
        value=applications_sent,
        trend=(applications_sent - previous_applications_sent) / previous_applications_sent
        if previous_applications_sent
        else None,
      ),
      active_pipeline=StatValue(
        value=active_pipeline,
        trend=(active_pipeline - previous_active_pipeline) / previous_active_pipeline
        if previous_active_pipeline
        else None,
      ),
      response_rate=StatValue(
        value=response_rate,
        trend=(response_rate - previous_response_rate) / previous_response_rate
        if response_rate is not None and previous_response_rate
        else None,
      ),
      average_days_to_first_response=StatValue(
        value=average_days_to_first_response,
        trend=(average_days_to_first_response - previous_average_days_to_first_response)
        / previous_average_days_to_first_response
        if average_days_to_first_response is not None and previous_average_days_to_first_response
        else None,
      ),
    )

  def get_applications_saved(
    self,
    status_events_by_app: StatusEventsByApplication,
    start_date: date,
    end_date: date,
  ) -> int:
    return count_status_events_in_range(
      status_events_by_app,
      StatusEnum.SAVED,
      start_date,
      end_date,
    )

  def get_applications_sent(
    self,
    status_events_by_app: StatusEventsByApplication,
    start_date: date,
    end_date: date,
  ) -> int:
    return count_status_events_in_range(
      status_events_by_app,
      StatusEnum.APPLIED,
      start_date,
      end_date,
    )

  def get_active_pipeline_at(
    self,
    status_events_by_app: StatusEventsByApplication,
    target_date: date,
  ) -> int:
    return sum(
      1
      for events in status_events_by_app.values()
      if (status := get_status_on_date(events, target_date)) and status in ACTIVE_PIPELINE_STATUSES
    )

  def get_response_rate(
    self,
    status_events_by_app: StatusEventsByApplication,
    start_date: date,
    end_date: date,
  ) -> float | None:
    applied_dates_by_app = get_first_applied_dates_by_app(
      status_events_by_app,
      start_date,
      end_date,
    )
    applications_sent = len(applied_dates_by_app)
    if applications_sent == 0:
      return None

    applications_with_response = sum(
      1
      for application_id, applied_date in applied_dates_by_app.items()
      if get_first_response_date(
        status_events_by_app[application_id],
        applied_date,
      )
    )

    return applications_with_response / applications_sent

  def get_average_days_to_first_response(
    self,
    status_events_by_app: StatusEventsByApplication,
    start_date: date,
    end_date: date,
  ) -> float | None:
    applied_dates_by_app = get_first_applied_dates_by_app(
      status_events_by_app,
      start_date,
      end_date,
    )
    days_to_first_response = [
      (response_date - applied_date).days
      for application_id, applied_date in applied_dates_by_app.items()
      if (
        response_date := get_first_response_date(
          status_events_by_app[application_id],
          applied_date,
        )
      )
    ]

    if not days_to_first_response:
      return None

    return sum(days_to_first_response) / len(days_to_first_response)

  def get_funnel(
    self,
    start_date: date,
    end_date: date,
  ) -> ApplicationFunnel:
    status_events_by_app = self._get_status_events_by_app(
      STATUS_EVENT_START_DATE,
      end_date,
      active_since=start_date,
    )
    transition_counts: dict[tuple[StatusEnum, StatusEnum], int] = defaultdict(int)

    for events in status_events_by_app.values():
      for source_event, target_event in zip(events, events[1:], strict=False):
        if target_event.date < start_date:
          continue

        source = source_event.status
        target = target_event.status
        # Nivo Sankey crashes if there are loops, need to filter
        if target.priority <= source.priority:
          continue
        transition_counts[(source, target)] += 1

    active_nodes = {status for transition in transition_counts for status in transition}
    ordered_nodes = [
      ApplicationFunnelNode(id=status)
      for status in sorted(active_nodes, key=lambda status: status.priority)
    ]

    ordered_links = [
      ApplicationFunnelLink(source=source, target=target, value=value)
      for source in StatusEnum
      for target in StatusEnum
      if (value := transition_counts.get((source, target), 0)) > 0
    ]

    return ApplicationFunnel(
      nodes=ordered_nodes,
      links=ordered_links,
    )

  def get_history(
    self,
    start_date: date,
    end_date: date,
  ) -> ApplicationHistory:
    status_events_by_app = self._get_status_events_by_app(
      STATUS_EVENT_START_DATE,
      end_date,
      active_since=start_date,
    )
    if not status_events_by_app:
      return ApplicationHistory(keys=[], points=[])

    first_event_date = min(
      event.date for events in status_events_by_app.values() for event in events
    )
    history_start = max(start_date, first_event_date)

    points: list[ApplicationHistoryPoint] = []
    cursor = history_start
    while cursor <= end_date:
      day_counts: dict[StatusEnum, int] = defaultdict(int)
      for events in status_events_by_app.values():
        current_status = None
        for event in events:
          if event.date > cursor:
            break
          current_status = event.status
        if current_status:
          day_counts[current_status] += 1

      points.append(
        ApplicationHistoryPoint(
          date=cursor,
          counts={status: count for status, count in day_counts.items() if count > 0},
        )
      )
      cursor += timedelta(days=1)

    active_keys = [
      status for status in StatusEnum if any(point.counts.get(status, 0) > 0 for point in points)
    ]

    return ApplicationHistory(keys=active_keys, points=points)

  def _get_status_events_by_app(
    self,
    start_date: date,
    end_date: date,
    active_since: date | None = None,
  ) -> StatusEventsByApplication:
    status_events = self.application_repository.list_status_events_between(start_date, end_date)
    status_events_by_app: StatusEventsByApplication = defaultdict(list)

    for application_id, event in status_events:
      status_events_by_app[application_id].append(event)

    if active_since is None:
      return dict(status_events_by_app)

    return {
      application_id: events
      for application_id, events in status_events_by_app.items()
      if any(event.date >= active_since for event in events)
    }
