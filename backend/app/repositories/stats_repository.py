from datetime import date

from app.repositories.base import DatabaseRepository
from app.schemas.application import StatusEnum

STATUS_EVENTS_QUERY = """
  SELECT
    se.application_id,
    se.status,
    se.date
  FROM status_events se
"""


class StatsRepository(DatabaseRepository):
  def __init__(self):
    super().__init__()

  def list_status_events(
    self,
    start_date: date | None = None,
  ) -> list[tuple[str, StatusEnum, date]]:
    where_clause = ' WHERE se.date >= ?' if start_date else ''
    rows = self.fetch_all(
      f'{STATUS_EVENTS_QUERY}{where_clause} ORDER BY se.application_id, se.date ASC, se.id ASC',
      (start_date.isoformat(),) if start_date else (),
    )

    return [
      (
        row['application_id'],
        StatusEnum(row['status']),
        date.fromisoformat(row['date']),
      )
      for row in rows
    ]
