from typing import Annotated

from fastapi import APIRouter, Body
from fastapi.responses import Response

from app.schemas import Profile, Section
from app.services import template_service
from app.utils.errors import NotFoundError

router = APIRouter(
  prefix='/templates',
  tags=['Templates'],
)


@router.get('/local')
async def list_local_templates() -> list[str]:
  return template_service.list_local_templates()


@router.get('/local/{template_name}')
async def get_local_template(template_name: str):
  content = template_service.get_template_content(template_name)
  return {'content': content}


@router.get('/remote')
async def list_remote_templates() -> list[str]:
  return await template_service.list_remote_templates()


@router.get('/remote/{template_name}')
async def get_remote_template(template_name: str):
  content = await template_service.get_remote_template(template_name)
  return {'content': content}


@router.post('/render')
async def render_template(
  template: Annotated[str, Body()],
  sections: Annotated[list[Section], Body()],
  profile: Annotated[Profile, Body()],
  format: str,
):
  if format == 'html':
    html = template_service.render_html(template, profile, sections)
    return {'html': html}

  if format == 'pdf':
    pdf_bytes = template_service.render_pdf(template, profile, sections)
    return Response(
      content=pdf_bytes,
      media_type='application/pdf',
      headers={
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    )

  raise NotFoundError(f'Unsupported format: {format}')


@router.post('/remote/{template_name}/download')
async def download_remote_template(template_name: str) -> dict[str, str]:
  await template_service.download_remote_template(template_name)
  return {'message': f"Template '{template_name}' downloaded successfully"}
