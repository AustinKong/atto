from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
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
)
from shared.schemas.dates import ISODate


class StatsService:
  def __init__(
    self,
    application_repository: Annotated[ApplicationRepository, Depends()],
  ) -> None:
    self.application_repository = application_repository

  def get_funnel(self, start_date: ISODate | None) -> ApplicationFunnel:
    status_events = self.application_repository.list_status_events(start_date)
    status_sequences_by_app: dict[str, list[StatusEnum]] = defaultdict(list)
    for application_id, status, _event_date in status_events:
      events = status_sequences_by_app[application_id]
      if not events or events[-1] != status:
        events.append(status)

    transition_counts: dict[tuple[StatusEnum, StatusEnum], int] = defaultdict(int)
    active_nodes: set[StatusEnum] = set()

    for statuses in status_sequences_by_app.values():
      active_nodes.update(statuses)
      for source, target in zip(statuses, statuses[1:], strict=False):
        transition_counts[(source, target)] += 1

    ordered_nodes = [status for status in StatusEnum if status in active_nodes]

    ordered_links = [
      ApplicationFunnelLink(source=source, target=target, value=value)
      for source in StatusEnum
      for target in StatusEnum
      if (value := transition_counts.get((source, target), 0)) > 0
    ]

    return ApplicationFunnel(
      nodes=[ApplicationFunnelNode(id=status) for status in ordered_nodes],
      links=ordered_links,
    )

  def get_history(self, start_date: ISODate | None) -> ApplicationHistory:
    status_events = self.application_repository.list_status_events(start_date)
    if not status_events:
      return ApplicationHistory(points=[])

    counts_by_date: dict[date, dict[StatusEnum, int]] = defaultdict(lambda: defaultdict(int))
    for _application_id, status, event_date in status_events:
      counts_by_date[event_date][status] += 1

    if start_date is not None:
      history_start = start_date
      history_end = datetime.now(UTC).date()
    else:
      history_start = min(counts_by_date.keys())
      history_end = max(counts_by_date.keys())

    points: list[ApplicationHistoryPoint] = []
    cursor = history_start
    while cursor <= history_end:
      day_counts = counts_by_date.get(cursor, {})
      points.append(
        ApplicationHistoryPoint(
          date=cursor,
          saved=day_counts.get(StatusEnum.SAVED, 0),
          applied=day_counts.get(StatusEnum.APPLIED, 0),
          screening=day_counts.get(StatusEnum.SCREENING, 0),
          interview=day_counts.get(StatusEnum.INTERVIEW, 0),
          offer_received=day_counts.get(StatusEnum.OFFER_RECEIVED, 0),
          accepted=day_counts.get(StatusEnum.ACCEPTED, 0),
          rejected=day_counts.get(StatusEnum.REJECTED, 0),
          ghosted=day_counts.get(StatusEnum.GHOSTED, 0),
          withdrawn=day_counts.get(StatusEnum.WITHDRAWN, 0),
          rescinded=day_counts.get(StatusEnum.RESCINDED, 0),
        )
      )
      cursor += timedelta(days=1)

    return ApplicationHistory(points=points)
