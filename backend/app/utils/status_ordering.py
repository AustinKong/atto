"""Centralized status ordering logic for consistent sorting across Python and SQL."""
# TODO: Maybe move contents of this file to schema/application.py and/or listings_service.py (generation of cte)

from typing import TYPE_CHECKING

if TYPE_CHECKING:
  pass

# Canonical status priority order
STATUS_PRIORITY = {
  'saved': 1,
  'applied': 2,
  'screening': 3,
  'interview': 4,
  'offer_received': 5,
  'accepted': 6,
  'rejected': 7,
  'ghosted': 8,
  'withdrawn': 9,
  'rescinded': 10,
}


def generate_status_priority_case_sql(column_name: str = 'status') -> str:
  """Generate a SQL CASE statement for status priority ordering."""
  cases = []
  for status, priority in STATUS_PRIORITY.items():
    cases.append(f"WHEN '{status}' THEN {priority}")

  case_sql = f'CASE {column_name}\n      ' + '\n      '.join(cases) + '\n      ELSE 999\n    END'
  return case_sql


def generate_latest_event_order_by_sql(
  date_column: str = 'date',
  status_column: str = 'status',
  stage_expression: str = "COALESCE(json_extract(payload, '$.stage'), 0)",
) -> str:
  """Generate SQL ORDER BY clause for finding the latest/most relevant event."""
  status_case = generate_status_priority_case_sql(status_column)

  return f"""{date_column} DESC,
             {status_case} DESC,
             {stage_expression} DESC"""


def generate_latest_event_cte() -> str:
  """Generate CTE subquery for finding the latest event per listing."""
  latest_event_order_by = generate_latest_event_order_by_sql(
    date_column='se.date',
    status_column='se.status',
    stage_expression="COALESCE(json_extract(se.payload, '$.stage'), 0)",
  )

  return f"""WITH latest_events AS (
        SELECT 
          se.application_id,
          l.id as listing_id,
          se.status,
          se.date,
          ROW_NUMBER() OVER (
            PARTITION BY l.id 
            ORDER BY {latest_event_order_by}
          ) as rn
        FROM listings l
        LEFT JOIN applications a ON l.id = a.listing_id
        LEFT JOIN status_events se ON a.id = se.application_id
      )"""


def create_status_event_sort_key(reverse: bool = False):
  """Create a sort key function for sorting status events in Python."""

  def sort_key(event):
    stage = getattr(event, 'stage', float('inf') if not reverse else 0)
    status_value = event.status.value if hasattr(event.status, 'value') else event.status

    return (
      event.date,
      STATUS_PRIORITY[status_value],
      stage,
      str(event.id),
    )

  return sort_key
