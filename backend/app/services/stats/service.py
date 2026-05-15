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


class StatsService:
  def __init__(
    self,
    application_repository: Annotated[ApplicationRepository, Depends()],
  ) -> None:
    self.application_repository = application_repository

  def get_funnel(self, start_date: date) -> ApplicationFunnel:
    status_events = self.application_repository.list_status_events_by_date(start_date)
    status_sequences_by_app: dict[str, list[StatusEnum]] = defaultdict(list)
    for application_id, event in status_events:
      status_sequences_by_app[application_id].append(event.status)

    transition_counts: dict[tuple[StatusEnum, StatusEnum], int] = defaultdict(int)

    for statuses in status_sequences_by_app.values():
      for source, target in zip(statuses, statuses[1:], strict=False):
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

  def get_history(self, start_date: date) -> ApplicationHistory:
    status_events = self.application_repository.list_status_events_by_date(start_date)
    if not status_events:
      return ApplicationHistory(keys=[], points=[])

    counts_by_date: dict[date, dict[StatusEnum, int]] = defaultdict(lambda: defaultdict(int))
    for _application_id, event in status_events:
      counts_by_date[event.date][event.status] += 1

    active_keys = [
      status
      for status in StatusEnum
      if any(day_counts.get(status, 0) > 0 for day_counts in counts_by_date.values())
    ]
    history_start = max(start_date, min(counts_by_date.keys()))
    history_end = datetime.now(UTC).date()

    points: list[ApplicationHistoryPoint] = []
    cursor = history_start
    while cursor <= history_end:
      day_counts = counts_by_date.get(cursor, {})
      points.append(
        ApplicationHistoryPoint(
          date=cursor,
          counts={status: count for status, count in day_counts.items() if count > 0},
        )
      )
      cursor += timedelta(days=1)

    return ApplicationHistory(keys=active_keys, points=points)
