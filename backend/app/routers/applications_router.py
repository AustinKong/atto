from uuid import UUID

from fastapi import APIRouter

from app.schemas import Application, StatusEvent
from app.services import applications_service

router = APIRouter(
  prefix='/applications',
  tags=['Applications'],
)


@router.get('/{id}', response_model=Application)
async def get_application(id: UUID):
  application = applications_service.get(id)
  return application


@router.post('/', response_model=Application)
async def create_application(application: Application):
  created_application = applications_service.create(application)
  return created_application


@router.post('/{application_id}/events', response_model=StatusEvent)
async def create_status_event(application_id: UUID, status_event: StatusEvent):
  created_event = applications_service.create_event(status_event, application_id)
  return created_event


@router.put('/{application_id}/events/{event_id}', response_model=StatusEvent)
async def update_status_event(application_id: UUID, event_id: UUID, status_event: StatusEvent):
  status_event.id = event_id
  updated_event = applications_service.update_event(status_event)
  return updated_event


@router.delete('/{application_id}/events/{event_id}', response_model=None)
async def delete_status_event(application_id: UUID, event_id: UUID):
  applications_service.delete_event(event_id)
  return None
