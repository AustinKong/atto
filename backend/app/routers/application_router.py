from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Cookie, Depends, status

from app.repositories import ApplicationRepository
from app.schemas import Application, StatusEvent
from app.schemas.task_status import TaskStatus, TaskStatusEntry
from app.services import ApplicationService

router = APIRouter(
  prefix='/applications',
  tags=['Applications'],
)


@router.get('/{id}', response_model=Application)
async def get_application(
  id: UUID, application_repository: Annotated[ApplicationRepository, Depends()]
):
  return application_repository.get(id)


@router.post('/', response_model=Application)
async def create_application(
  application: Application, application_repository: Annotated[ApplicationRepository, Depends()]
):
  return application_repository.create(application)


@router.post('/{application_id}/events', response_model=StatusEvent)
async def create_status_event(
  application_id: UUID,
  status_event: StatusEvent,
  application_repository: Annotated[ApplicationRepository, Depends()],
):
  return application_repository.create_event(status_event, application_id)


@router.put('/{application_id}/events/{event_id}', response_model=StatusEvent)
async def update_status_event(
  application_id: UUID,
  event_id: UUID,
  status_event: StatusEvent,
  application_repository: Annotated[ApplicationRepository, Depends()],
):
  status_event.id = event_id
  return application_repository.update_event(status_event)


@router.delete('/{application_id}/events/{event_id}', response_model=None)
async def delete_status_event(
  application_id: UUID,
  event_id: UUID,
  application_repository: Annotated[ApplicationRepository, Depends()],
):
  application_repository.delete_event(event_id)


@router.post('/{id}/analysis', response_model=TaskStatusEntry, status_code=status.HTTP_202_ACCEPTED)
async def generate_analysis(
  id: UUID,
  background_tasks: BackgroundTasks,
  application_service: Annotated[ApplicationService, Depends()],
  application_repository: Annotated[ApplicationRepository, Depends()],
  session_token: Annotated[str | None, Cookie(alias='__session')] = None,
):
  application_repository.set_analysis_status(id, TaskStatus.PENDING)
  background_tasks.add_task(
    application_service.generate_analysis_task,
    id,
    session_token,
  )
  return application_repository.get_analysis_status(id)


@router.get('/{id}/analysis/status', response_model=TaskStatusEntry | None)
async def get_analysis_status(
  id: UUID,
  application_repository: Annotated[ApplicationRepository, Depends()],
):
  return application_repository.get_analysis_status(id)
