import json
from datetime import date
from sqlite3 import Row
from typing import Any
from uuid import UUID

from pydantic import TypeAdapter

from app.repositories.base import DatabaseRepository
from app.repositories.base.in_memory_kv_repository import InMemoryKVRepository
from app.schemas.application import (
  Application,
  StatusEnum,
  StatusEvent,
  StatusEventSaved,
)
from app.schemas.task_status import TaskStatus, TaskStatusEntry
from app.utils.errors import NotFoundError, ValidationError

event_adapter = TypeAdapter(StatusEvent)

STATUS_EVENTS_BETWEEN_QUERY = """
  SELECT
    se.application_id,
    se.id,
    se.status,
    se.date,
    se.notes,
    se.payload
  FROM status_events se
  WHERE se.date BETWEEN ? AND ?
  ORDER BY se.application_id, se.date ASC, se.id ASC
"""

APPLICATION_WITH_EVENTS_QUERY = """
  SELECT
    a.id as application_id,
    a.resume_id,
    a.listing_id,
    a.name,
    a.current_status,
    a.last_status_at,
    a.analysis,
    COALESCE(
      json_group_array(
        json_object(
          'id', se.id,
          'status', se.status,
          'date', se.date,
          'notes', se.notes,
          'payload', se.payload
        )
      ),
      json_array()
    ) as status_events_json
  FROM applications a
  LEFT JOIN status_events se ON a.id = se.application_id
"""


class ApplicationRepository(DatabaseRepository, InMemoryKVRepository):
  ANALYSIS_TASK_NAMESPACE = 'application_analysis'

  def __init__(self):
    DatabaseRepository.__init__(self)
    InMemoryKVRepository.__init__(self)

  def get(self, application_id: UUID) -> Application:
    row = self.fetch_one(
      f'{APPLICATION_WITH_EVENTS_QUERY} WHERE a.id = ? GROUP BY a.id',
      (str(application_id),),
    )

    if not row:
      raise NotFoundError('Application not found.')

    return self._parse_application_row(row)

  def get_by_resume_id(self, resume_id: UUID) -> Application:
    row = self.fetch_one(
      f'{APPLICATION_WITH_EVENTS_QUERY} WHERE a.resume_id = ? GROUP BY a.id',
      (str(resume_id),),
    )

    if not row:
      raise NotFoundError('No application was found for that resume.')

    return self._parse_application_row(row)

  def get_by_listing_id(self, listing_id: UUID) -> list[Application]:
    rows = self.fetch_all(
      f'{APPLICATION_WITH_EVENTS_QUERY} WHERE a.listing_id = ? GROUP BY a.id',
      (str(listing_id),),
    )

    return [self._parse_application_row(row) for row in rows]

  def list_status_events_between(
    self,
    start_date: date,
    end_date: date,
  ) -> list[tuple[str, StatusEvent]]:
    rows = self.fetch_all(
      STATUS_EVENTS_BETWEEN_QUERY,
      (start_date.isoformat(), end_date.isoformat()),
    )

    return [(row['application_id'], self._parse_status_event_row(row)) for row in rows]

  def create(self, application: Application) -> Application:
    with self.transaction():
      self.execute(
        'INSERT INTO applications (id, listing_id, name, resume_id, current_status, '
        'last_status_at) VALUES (?, ?, ?, ?, ?, ?)',
        (
          str(application.id),
          str(application.listing_id),
          application.name,
          str(application.resume_id),
          application.current_status.value,
          application.last_status_at,
        ),
      )

      self._sync_application_status(application.id)

    return self.get(application.id)

  def seed(self, application: Application) -> Application:
    with self.transaction():
      self.execute(
        """
        INSERT INTO applications (
          id, listing_id, name, resume_id, analysis, current_status, last_status_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
          str(application.id),
          str(application.listing_id),
          application.name,
          str(application.resume_id),
          application.analysis.model_dump_json(by_alias=True)
          if application.analysis
          else None,
          application.current_status.value,
          application.last_status_at.isoformat(),
        ),
      )

      for event in application.status_events:
        self.execute(
          """
          INSERT INTO status_events (id, application_id, status, date, notes, payload)
          VALUES (?, ?, ?, ?, ?, ?)
          """,
          (
            str(event.id),
            str(application.id),
            event.status.value,
            event.date.isoformat(),
            event.notes,
            json.dumps(self._extract_payload_from_event(event)),
          ),
        )

    return application

  def update_analysis(self, application_id: UUID, analysis_json: str | None) -> Application:
    self.execute(
      """
      UPDATE applications
      SET analysis = ?
      WHERE id = ?
      """,
      (analysis_json, str(application_id)),
    )

    return self.get(application_id)

  def set_analysis_status(
    self, application_id: UUID, status: TaskStatus, error: str | None = None
  ) -> None:
    self.set_value(
      self.ANALYSIS_TASK_NAMESPACE, str(application_id), TaskStatusEntry(status=status, error=error)
    )

  def get_analysis_status(self, application_id: UUID) -> TaskStatusEntry | None:
    return self.get_value(self.ANALYSIS_TASK_NAMESPACE, str(application_id))

  def create_event(self, status_event: StatusEvent, application_id: UUID) -> StatusEvent:
    with self.transaction():
      # Prevent manually creating "saved" status events
      if status_event.status == StatusEnum.SAVED:
        raise ValidationError('The initial saved status cannot be added manually.')

      application = self.fetch_one(
        'SELECT id FROM applications WHERE id = ?',
        (str(application_id),),
      )
      if not application:
        raise NotFoundError('Application not found.')

      self.execute(
        'INSERT INTO status_events (id, application_id, status, date, notes, payload) '
        'VALUES (?, ?, ?, ?, ?, ?)',
        (
          str(status_event.id),
          str(application_id),
          status_event.status,
          status_event.date,
          status_event.notes,
          json.dumps(self._extract_payload_from_event(status_event)),
        ),
      )

      self._sync_application_status(application_id)

    return status_event

  def update_event(self, status_event: StatusEvent) -> StatusEvent:
    with self.transaction():
      existing = self.fetch_one(
        'SELECT application_id, status FROM status_events WHERE id = ?',
        (str(status_event.id),),
      )
      if not existing:
        raise NotFoundError('Status event not found.')

      if existing['status'] == StatusEnum.SAVED.value:
        raise ValidationError('The initial saved status cannot be changed.')

      application_id = existing['application_id']

      self.execute(
        'UPDATE status_events SET status = ?, date = ?, notes = ?, payload = ? WHERE id = ?',
        (
          status_event.status,
          status_event.date,
          status_event.notes,
          json.dumps(self._extract_payload_from_event(status_event)),
          str(status_event.id),
        ),
      )

      self._sync_application_status(application_id)

    return status_event

  def delete_event(self, status_event_id: UUID) -> None:
    with self.transaction():
      existing = self.fetch_one(
        'SELECT application_id, status FROM status_events WHERE id = ?',
        (str(status_event_id),),
      )
      if not existing:
        raise NotFoundError('Status event not found.')

      if existing['status'] == StatusEnum.SAVED.value:
        raise ValidationError('The initial saved status cannot be deleted.')

      application_id = existing['application_id']

      self.execute('DELETE FROM status_events WHERE id = ?', (str(status_event_id),))

      self._sync_application_status(application_id)

  def _extract_payload_from_event(self, status_event: StatusEvent) -> dict[str, Any]:
    event_dict = status_event.model_dump(mode='json')

    # Remove base fields that are stored as columns
    base_fields = {'id', 'date', 'notes', 'status'}
    payload = {k: v for k, v in event_dict.items() if k not in base_fields}

    return payload

  def _parse_application_row(self, row: Row) -> Application:
    """Parse a row from the database into an Application object"""
    row_dict = dict(row)

    status_events_json = row_dict.pop('status_events_json')
    status_events = []
    for event in json.loads(status_events_json):
      if event.get('id'):
        status_events.append(self._parse_status_event_row(event))

    row_dict['id'] = row_dict.pop('application_id')

    return Application(**row_dict, status_events=status_events)

  def _parse_status_event_row(self, row: Row | dict[str, Any]) -> StatusEvent:
    base_data = {
      'id': row['id'],
      'date': row['date'],
      'notes': row['notes'] if isinstance(row, Row) else row.get('notes'),
      'status': row['status'],
    }
    payload = json.loads(row['payload']) if row['payload'] else {}
    return event_adapter.validate_python({**base_data, **payload})

  def _sync_application_status(self, application_id: UUID) -> None:
    """Synchronize application's current_status and last_status_at with latest event."""
    # Wrap in transaction here to be safe, but upstream functions should already be in a transaction
    with self.transaction():
      app = self.get(application_id)

      # If no events exist, create a default "saved" event
      if not app.status_events:
        saved_event = StatusEventSaved()
        self.execute(
          'INSERT INTO status_events (id, application_id, status, date, notes, payload) '
          'VALUES (?, ?, ?, ?, ?, ?)',
          (
            str(saved_event.id),
            str(application_id),
            saved_event.status,
            saved_event.date,
            saved_event.notes,
            json.dumps({}),
          ),
        )
        current_status = saved_event.status
        last_status_at = saved_event.date
      else:
        # Get the last event (most recent based on our sorting logic)
        last_event = app.status_events[-1]
        current_status = last_event.status
        last_status_at = last_event.date

      self.execute(
        'UPDATE applications SET current_status = ?, last_status_at = ? WHERE id = ?',
        (current_status, last_status_at, str(application_id)),
      )
