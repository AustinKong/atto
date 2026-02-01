import asyncio
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Body
from fastapi.responses import Response

from app.resources.prompts import OPTIMIZATION_PROMPT
from app.schemas import (
  DetailedItem,
  DetailedSectionContent,
  Experience,
  LLMResponseExperience,
  Resume,
  ResumeData,
  Section,
)
from app.services import (
  applications_service,
  experience_service,
  listings_service,
  llm_service,
  profile_service,
  resume_service,
  template_service,
)
from app.utils.errors import NotFoundError

router = APIRouter(
  prefix='/resumes',
  tags=['Resumes'],
)


@router.get('/{resume_id}')
async def get_resume(resume_id: UUID) -> Resume:
  return resume_service.get(resume_id)


@router.post('/html')
async def get_html(
  template: Annotated[str, Body()],
  data: Annotated[ResumeData, Body()],
):
  profile = profile_service.get()
  html = template_service.render(template, profile, data)

  return {'html': html}


@router.post('/{resume_id}/populate')
async def populate_resume_base_sections(resume_id: UUID):
  resume = resume_service.get(resume_id)

  profile = profile_service.get()
  base_sections = []
  for section in profile.base_sections:
    base_sections.append(
      Section(
        id=str(uuid4()),
        type=section.type,
        title=section.title,
        content=section.content,
      )
    )

  resume.data.sections = base_sections
  updated_resume = resume_service.update(resume)
  return updated_resume


@router.post('/{resume_id}/generate')
async def generate_resume_content(resume_id: UUID):
  resume = resume_service.get(resume_id)
  application = applications_service.get_by_resume_id(resume_id)
  listing = listings_service.get(application.listing_id)
  relevant_experiences: list[Experience] = experience_service.find_relevant(listing)
  responses = await asyncio.gather(
    *[
      llm_service.call_structured(
        input=OPTIMIZATION_PROMPT.format(
          listing_title=listing.title,
          listing_requirements=listing.requirements,
          listing_skills=listing.skills,
          exp_title=exp.title,
          exp_organization=exp.organization,
          exp_bullets='\n'.join(exp.bullets),
        ),
        response_model=LLMResponseExperience,
      )
      for exp in relevant_experiences
    ]
  )

  customised_experiences: list[Experience] = []
  for exp, resp in zip(relevant_experiences, responses, strict=False):
    exp.bullets = resp.bullets
    customised_experiences.append(exp)

  # Map pruned experiences to DetailedItem objects
  # Sort by end_date (desc), then start_date (desc)
  def sort_key(exp: Experience):
    # If end_date is None, treat as ongoing (sort first)
    end = exp.end_date or '9999-12'
    start = exp.start_date or '0000-00'
    return (end, start)

  sorted_experiences = sorted(customised_experiences, key=sort_key, reverse=True)
  detailed_items = [
    DetailedItem(
      title=exp.title,
      subtitle=exp.organization,
      start_date=exp.start_date,
      end_date=exp.end_date,
      bullets=exp.bullets,
    )
    for exp in sorted_experiences
  ]

  # Populate base sections from profile
  profile = profile_service.get()
  base_sections = []
  for section in profile.base_sections:
    base_sections.append(
      Section(
        id=str(uuid4()),
        type=section.type,
        title=section.title,
        content=section.content,
      )
    )

  # Create work experience section
  work_experience_section = Section(
    id=str(uuid4()),
    type='detailed',
    title='Work Experience',
    content=DetailedSectionContent(bullets=detailed_items),
  )

  # Set resume sections to base sections + work experience
  resume.data.sections = base_sections + [work_experience_section]
  updated_resume = resume_service.update(resume)
  return updated_resume


@router.put('/{resume_id}')
async def update_resume(resume_id: UUID, data: ResumeData) -> Resume:
  resume = resume_service.get(resume_id)
  resume.data = data
  updated_resume = resume_service.update(resume)
  return updated_resume


@router.delete('/{resume_id}')
async def delete_resume(resume_id: UUID):
  resume_service.delete(resume_id)
  return {'message': 'Resume deleted successfully'}


@router.get('/{resume_id}/export')
async def export_resume(resume_id: UUID) -> Response:
  resume = resume_service.get(resume_id)
  profile = profile_service.get()
  try:
    pdf_bytes = template_service.render_pdf(resume.template, profile, resume.data)
  except Exception as e:
    raise NotFoundError(f'Failed to render PDF: {e}') from e

  filename = f'resume_{resume.id}.pdf'
  return Response(
    content=pdf_bytes,
    media_type='application/pdf',
    headers={
      'Content-Disposition': f'attachment; filename="{filename}"',
    },
  )
