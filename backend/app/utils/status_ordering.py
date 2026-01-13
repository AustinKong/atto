from app.schemas.application import StatusEnum, StatusEvent

# Centralized status ordering logic for consistent sorting across Python and SQL.
# Events are sorted by date (newest first), then by status priority, then by stage (highest first).


def generate_latest_event_sql(
  date_column: str = 'se.date',
  status_column: str = 'se.status',
  stage_expression: str = "COALESCE(json_extract(se.payload, '$.stage'), 0)",
) -> str:
  """Generate complete CTE for finding the latest event per listing."""
  # Generate status priority CASE statement using StatusEnum.priority
  cases = [f"WHEN '{status.value}' THEN {status.priority}" for status in StatusEnum]
  status_case = (
    f'CASE {status_column}\n      ' + '\n      '.join(cases) + '\n      ELSE 999\n    END'
  )

  # Generate ORDER BY clause
  order_by = f"""{date_column} DESC,
             {status_case} DESC,
             {stage_expression} DESC"""

  return f"""WITH latest_events AS (
        SELECT 
          se.application_id,
          l.id as listing_id,
          se.status,
          se.date,
          ROW_NUMBER() OVER (
            PARTITION BY l.id 
            ORDER BY {order_by}
          ) as rn
        FROM listings l
        LEFT JOIN applications a ON l.id = a.listing_id
        LEFT JOIN status_events se ON a.id = se.application_id
      )"""


def create_status_event_sort_key(reverse: bool = False):
  """Create a sort key function for sorting status events in Python."""

  def sort_key(event: StatusEvent):
    stage = getattr(event, 'stage', float('inf') if not reverse else 0)

    return (
      event.date,
      event.status.priority,
      stage,
      str(event.id),
    )

  return sort_key
