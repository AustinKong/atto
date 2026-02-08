import json
from sqlite3 import Row
from typing import Any
from uuid import UUID, uuid4

from pydantic import TypeAdapter

from app.config import settings
from app.repositories import DatabaseRepository
from app.schemas import (
  Application,
  Resume,
  StatusEnum,
  StatusEvent,
  StatusEventSaved,
)
from app.utils.errors import NotFoundError

event_adapter = TypeAdapter(StatusEvent)

APPLICATION_WITH_EVENTS_QUERY = """
  SELECT
    a.id as application_id,
    a.resume_id,
    a.listing_id,
    a.current_status,
    a.last_status_at,
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


class ApplicationsService(DatabaseRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, application_id: UUID) -> Application:
    row = self.fetch_one(
      f'{APPLICATION_WITH_EVENTS_QUERY} WHERE a.id = ? GROUP BY a.id',
      (str(application_id),),
    )

    if not row:
      raise NotFoundError(f'Application {application_id} not found')

    return self._parse_application_row(row)

  def get_by_resume_id(self, resume_id: UUID) -> Application:
    row = self.fetch_one(
      f'{APPLICATION_WITH_EVENTS_QUERY} WHERE a.resume_id = ? GROUP BY a.id',
      (str(resume_id),),
    )

    if not row:
      raise NotFoundError(f'No application found for resume {resume_id}')

    return self._parse_application_row(row)

  def get_by_listing_id(self, listing_id: UUID) -> list[Application]:
    rows = self.fetch_all(
      f'{APPLICATION_WITH_EVENTS_QUERY} WHERE a.listing_id = ? GROUP BY a.id',
      (str(listing_id),),
    )

    return [self._parse_application_row(row) for row in rows]

  def create(self, application: Application) -> Application:
    with self.transaction():
      resume = Resume(
        id=uuid4(),
        template=settings.resume.default_template,
        sections=[],
      )
      self.execute(
        'INSERT INTO resumes (id, template, sections) VALUES (?, ?, ?)',
        (
          str(resume.id),
          resume.template,
          json.dumps([]),
        ),
      )

      application.resume_id = resume.id

      self.execute(
        'INSERT INTO applications (id, listing_id, resume_id, current_status, last_status_at) '
        'VALUES (?, ?, ?, ?, ?)',
        (
          str(application.id),
          str(application.listing_id),
          str(application.resume_id),
          application.current_status.value,
          application.last_status_at,
        ),
      )

      self._sync_application_status(application.id)

    return self.get(application.id)

  def create_event(self, status_event: StatusEvent, application_id: UUID) -> StatusEvent:
    with self.transaction():
      # Prevent manually creating "saved" status events
      if status_event.status == StatusEnum.SAVED:
        raise ValueError('Cannot manually create a "saved" status event')

      application = self.fetch_one(
        'SELECT id FROM applications WHERE id = ?',
        (str(application_id),),
      )
      if not application:
        raise NotFoundError(f'Application {application_id} not found')

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
        raise NotFoundError(f'Status event {status_event.id} not found')

      if existing['status'] == StatusEnum.SAVED.value:
        raise ValueError('Cannot update the "saved" status event')

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
        raise NotFoundError(f'Status event {status_event_id} not found')

      if existing['status'] == StatusEnum.SAVED.value:
        raise ValueError('Cannot delete the "saved" status event')

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
        base_data = {
          'id': event['id'],
          'date': event['date'],
          'notes': event.get('notes'),
          'status': event['status'],
        }
        payload = json.loads(event.get('payload', '{}')) if event.get('payload') else {}
        status_event = event_adapter.validate_python({**base_data, **payload})
        status_events.append(status_event)

    row_dict['id'] = row_dict.pop('application_id')

    return Application(**row_dict, status_events=status_events)

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
