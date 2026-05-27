from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.clients.model import ModelClient, get_model_client
from app.repositories import ListingRepository, ResumeRepository, TemplateRepository
from app.schemas.resume import Resume
from app.schemas.template import DEFAULT_TEMPLATE_ID
from app.services.resume import optimize_resume_sections
from app.utils.errors import NotFoundError, ValidationError

router = APIRouter(
  prefix='/resumes',
  tags=['Resumes'],
)


# TODO: This is not human-verified. Need to look into and review this logic again
@router.post('/')
async def create_resume(
  resume_repository: Annotated[ResumeRepository, Depends()],
  listing_repository: Annotated[ListingRepository, Depends()],
  llm_client: Annotated[ModelClient, Depends(get_model_client)],
  template_repository: Annotated[TemplateRepository, Depends()],
  mode: Literal['default', 'blank', 'optimized'] = 'blank',
  listing_id: Annotated[UUID | None, Query(alias='listing-id')] = None,
) -> Resume:
  # TODO: Maybe make this a decorator
  default_resume = resume_repository.ensure_default_global_resume_exists()

  if mode == 'default':
    return resume_repository.create(
      Resume(
        template_id=default_resume.template_id,
        sections=default_resume.sections,
      )
    )
  elif mode == 'blank':
    return resume_repository.create(
      Resume(
        template_id=default_resume.template_id,
        sections=[],
      )
    )
  elif mode == 'optimized':
    if listing_id is None:
      raise ValidationError('Choose a listing before creating an optimized resume.')

    listing = listing_repository.get(listing_id)
    optimized_sections = await optimize_resume_sections(
      sections=default_resume.sections,
      listing=listing,
      llm_client=llm_client,
    )

    return resume_repository.create(
      Resume(
        template_id=default_resume.template_id,
        sections=optimized_sections,
      )
    )
  else:
    raise ValidationError('Choose a valid resume creation mode.')


@router.get('/{resume_id}')
async def get_resume(
  resume_id: UUID,
  resume_repository: Annotated[ResumeRepository, Depends()],
  template_repository: Annotated[TemplateRepository, Depends()],
) -> Resume:
  resume = resume_repository.get(resume_id)

  # Self-healing
  try:
    template_repository.get_local_template(resume.template_id)
  except NotFoundError:
    resume.template_id = DEFAULT_TEMPLATE_ID
    resume = resume_repository.update(resume)

  return resume


@router.put('/{resume_id}')
async def update_resume(
  resume_id: UUID,
  resume: Resume,
  resume_repository: Annotated[ResumeRepository, Depends()],
) -> Resume:
  resume.id = resume_id
  return resume_repository.update(resume)


@router.delete('/{resume_id}')
async def delete_resume(
  resume_id: UUID,
  resume_repository: Annotated[ResumeRepository, Depends()],
):
  resume_repository.delete(resume_id)
  return {'message': 'Resume deleted successfully'}
