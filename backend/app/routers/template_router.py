from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends
from fastapi.responses import Response

from app.repositories import TemplateRepository
from app.schemas import Page, Profile, Section, Template, TemplateSummary
from app.services import TemplateService

router = APIRouter(
  prefix='/templates',
  tags=['Templates'],
)


@router.get('', response_model=Page[TemplateSummary])
async def list_templates(
  template_repository: Annotated[TemplateRepository, Depends()],
  page: int = 1,
  size: int = 10,
):
  """Returns a merged, deduplicated list of local and remote templates.
  Templates available both locally and remotely are returned once with source='both'."""
  remote_summaries = await template_repository.list_remote_templates()
  remote_ids = {s.id for s in remote_summaries}

  local_summaries = template_repository.list_local_templates()
  local_only = [s for s in local_summaries if s.id not in remote_ids]

  summaries = remote_summaries + local_only
  total = len(summaries)
  offset = (page - 1) * size
  items = summaries[offset : offset + size]

  return Page(
    items=items,
    total=total,
    page=page,
    size=size,
    pages=(total + size - 1) // size,
  )


@router.get('/local', response_model=Page[TemplateSummary])
async def list_local_templates(
  template_repository: Annotated[TemplateRepository, Depends()],
  page: int = 1,
  size: int = 10,
):
  summaries = template_repository.list_local_templates()
  total = len(summaries)
  offset = (page - 1) * size
  items = summaries[offset : offset + size]

  return Page(
    items=items,
    total=total,
    page=page,
    size=size,
    pages=(total + size - 1) // size,
  )


@router.get('/{id}', response_model=Template)
async def get_template(
  id: UUID,
  template_repository: Annotated[TemplateRepository, Depends()],
):
  """Returns the template, preferring the local copy if it exists."""
  try:
    return template_repository.get_local_template(id)
  except FileNotFoundError:
    return await template_repository.get_remote_template(id)


@router.get('/local/{id}', response_model=Template)
async def get_local_template(
  id: UUID,
  template_repository: Annotated[TemplateRepository, Depends()],
):
  return template_repository.get_local_template(id)


@router.post('/render')
async def render_template(
  template_service: Annotated[TemplateService, Depends()],
  template: Annotated[Template, Body()],
  sections: Annotated[list[Section], Body()],
  profile: Annotated[Profile, Body()],
):
  pdf_bytes = await template_service.render_pdf(template.content, profile, sections)
  return Response(
    content=pdf_bytes,
    media_type='application/pdf',
    headers={
      'Content-Disposition': 'attachment; filename="resume.pdf"',
    },
  )


@router.post('/remote/{id}/download')
async def download_remote_template(
  id: UUID,
  template_repository: Annotated[TemplateRepository, Depends()],
):
  await template_repository.download_remote_template(id)
  return {'message': f"Template '{id}' downloaded successfully"}
