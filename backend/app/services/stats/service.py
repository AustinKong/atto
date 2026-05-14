import re
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
from typing import Annotated

from fastapi import Depends

from app.repositories import StatsRepository
from app.schemas.application import StatusEnum
from app.schemas.stats import (
  ApplicationFunnel,
  ApplicationFunnelLink,
  ApplicationFunnelNode,
  ApplicationHistory,
  ApplicationHistoryPoint,
  StatsResponse,
)

RELATIVE_DATE_PATTERN = re.compile(r'^(\d+)d$')


class StatsService:
  def __init__(
    self,
    stats_repository: Annotated[StatsRepository, Depends()],
  ) -> None:
    self.stats_repository = stats_repository

  async def get_stats(self, start_date: date | None) -> StatsResponse:
    status_events = self.stats_repository.list_status_events(start_date)

    return StatsResponse(
      application_funnel=self._build_funnel(status_events),
      application_history=self._build_history(status_events, start_date),
    )

  def parse_start_date(self, value: str) -> date | None:
    normalized = value.strip().lower()

    if normalized == 'all':
      return None

    if relative_match := RELATIVE_DATE_PATTERN.fullmatch(normalized):
      days = int(relative_match.group(1))
      if days < 1:
        raise ValueError('Relative day range must be at least 1 day')
      return datetime.now(UTC).date() - timedelta(days=days)

    try:
      return date.fromisoformat(normalized)
    except ValueError as error:
      raise ValueError(
        'Invalid startDate. Use "all", "<number>d" (for example "14d"), or "YYYY-MM-DD".'
      ) from error

  def _build_funnel(
    self,
    status_events: list[tuple[str, StatusEnum, date]],
  ) -> ApplicationFunnel:
    grouped_events: dict[str, list[StatusEnum]] = defaultdict(list)
    for application_id, status, _event_date in status_events:
      events = grouped_events[application_id]
      if not events or events[-1] != status:
        events.append(status)

    transition_counts: dict[tuple[StatusEnum, StatusEnum], int] = defaultdict(int)
    active_nodes: set[StatusEnum] = set()

    for statuses in grouped_events.values():
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

  def _build_history(
    self,
    status_events: list[tuple[str, StatusEnum, date]],
    start_date: date | None,
  ) -> ApplicationHistory:
    if not status_events:
      return ApplicationHistory(points=[])

    counts_by_date: dict[date, dict[StatusEnum, int]] = defaultdict(lambda: defaultdict(int))
    for _application_id, status, event_date in status_events:
      counts_by_date[event_date][status] += 1

    if start_date is not None:
      history_start = start_date
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
