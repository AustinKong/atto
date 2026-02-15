import asyncio
from uuid import UUID, uuid4

from fastapi import APIRouter

from app.resources.prompts import OPTIMIZATION_PROMPT
from app.schemas import (
  DetailedItem,
  DetailedSection,
  Experience,
  LLMResponseExperience,
  Resume,
  Section,
)
from app.services import (
  applications_service,
  experience_service,
  listings_service,
  llm_service,
  profile_service,
  resume_service,
)

router = APIRouter(
  prefix='/resumes',
  tags=['Resumes'],
)


@router.get('/{resume_id}')
async def get_resume(resume_id: UUID) -> Resume:
  return resume_service.get(resume_id)


@router.post('/{resume_id}/populate')
async def populate_resume_base_sections(resume_id: UUID):
  resume = resume_service.get(resume_id)

  profile = profile_service.get()
  resume.sections = profile.base_sections
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
    # If end_date is 'present', treat as ongoing (sort first).
    # If end_date is None, the user hasn't filled it yet; don't treat as ongoing.
    if exp.end_date == 'present':
      end = '9999-12'
    elif exp.end_date is None:
      end = '0000-00'
    else:
      end = exp.end_date
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
  resume.sections = profile.base_sections

  # Append work experience section
  resume.sections.append(
    DetailedSection(
      id=str(uuid4()),
      title='Work Experience',
      content=detailed_items,
    )
  )

  updated_resume = resume_service.update(resume)
  return updated_resume


@router.put('/{resume_id}')
async def update_resume(resume_id: UUID, sections: list[Section]) -> Resume:
  resume = resume_service.get(resume_id)
  resume.sections = sections
  updated_resume = resume_service.update(resume)
  return updated_resume


@router.delete('/{resume_id}')
async def delete_resume(resume_id: UUID):
  resume_service.delete(resume_id)
  return {'message': 'Resume deleted successfully'}
