from typing import Annotated

from fastapi import APIRouter, Body
from fastapi.responses import Response

from app.config import settings
from app.schemas import Page, Profile, Section, Template, TemplateSummary
from app.services import template_service
from app.utils.errors import NotFoundError

router = APIRouter(
  prefix='/templates',
  tags=['Templates'],
)


@router.get('/local', response_model=Page[TemplateSummary])
async def list_local_templates(page: int = 1, size: int = 10):
  summaries = template_service.list_local_templates()
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


@router.get('/remote', response_model=Page[TemplateSummary])
async def list_remote_templates(page: int = 1, size: int = 10):
  summaries = await template_service.list_remote_templates()
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


@router.get('/local/{template_id}', response_model=Template)
async def get_local_template(template_id: str):
  return template_service.get_local_template(template_id)


@router.get('/remote/{template_id}', response_model=Template)
async def get_remote_template(template_id: str):
  return await template_service.get_remote_template(template_id)


@router.post('/render')
async def render_template(
  template: Annotated[Template, Body()],
  sections: Annotated[list[Section], Body()],
  profile: Annotated[Profile, Body()],
  format: str,
):
  # TODO: Deprecate html rendering
  if format == 'html':
    html = template_service.render_html(template.content, profile, sections)
    return {'html': html}

  if format == 'pdf':
    pdf_bytes = await template_service.render_pdf(template.content, profile, sections)
    return Response(
      content=pdf_bytes,
      media_type='application/pdf',
      headers={
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    )

  raise NotFoundError(f'Unsupported format: {format}')


@router.post('/remote/{template_id}/download')
async def download_remote_template(template_id: str):
  await template_service.download_remote_template(template_id)
  return {'message': f"Template '{template_id}' downloaded successfully"}


@router.get('/default')
async def get_default_template():
  """Get the ID of the default template with self-healing."""
  default_template_id = settings.config.resume.default_template

  # Verify that the configured default template actually exists
  try:
    template_service.get_local_template(default_template_id)
  except Exception:
    # If it doesn't exist, reset to system default and save
    default_template_id = template_service.SYSTEM_DEFAULT_TEMPLATE_ID
    settings.save({'resume': {'default_template': template_service.SYSTEM_DEFAULT_TEMPLATE_ID}})

  return {'template_id': default_template_id}


@router.put('/default')
async def set_default_template(template_id: Annotated[str, Body(embed=True)]):
  template_service.get_local_template(template_id)

  settings.config.resume.default_template = template_id
  settings.save({'resume': {'default_template': template_id}})
  return {'template_id': template_id}
