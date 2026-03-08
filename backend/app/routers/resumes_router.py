import asyncio
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Query

from app.resources.prompts import (
  LISTING_CONTEXT,
  OPTIMIZE_DETAILED_ITEM_PROMPT,
  OPTIMIZE_PARAGRAPH_SECTION_PROMPT,
  OPTIMIZE_SIMPLE_SECTION_PROMPT,
)
from app.schemas import (
  DEFAULT_TEMPLATE_ID,
  DetailedItem,
  DetailedSection,
  ParagraphSection,
  Resume,
  Section,
  SectionTypeEnum,
  SimpleSection,
)
from app.services import (
  listings_service,
  llm_service,
  resumes_service,
  templates_service,
)

router = APIRouter(
  prefix='/resumes',
  tags=['Resumes'],
)


@router.post('/')
async def create_resume(
  mode: Literal['default', 'blank', 'optimized'] = 'blank',
  listing_id: Annotated[UUID | None, Query(alias='listing-id')] = None,
) -> Resume:
  # TODO: Maybe make this a decorator
  default_resume = resumes_service.ensure_default_global_resume_exists()

  if mode == 'default':
    return resumes_service.create(
      Resume(
        template_id=default_resume.template_id,
        sections=default_resume.sections,
      )
    )
  elif mode == 'blank':
    return resumes_service.create(
      Resume(
        template_id=default_resume.template_id,
        sections=[],
      )
    )
  elif mode == 'optimized':
    if listing_id is None:
      raise ValueError('listing_id is required when mode is "optimized"')

    listing = listings_service.get(listing_id)

    listing_context_kwargs = dict(
      listing_context=LISTING_CONTEXT.format(
        listing_title=listing.title,
        listing_requirements='\n'.join(f'- {r}' for r in listing.requirements),
        listing_skills=', '.join(listing.skills),
      ),
    )

    async def optimize_section(section: Section) -> Section:
      if section.type == SectionTypeEnum.DETAILED:

        async def optimize_item(item: DetailedItem) -> DetailedItem:
          item_text = f'  title: {item.title}\n  subtitle: {item.subtitle}\n' + '\n'.join(
            f'    - {b}' for b in item.bullets
          )
          response = await llm_service.call_structured(
            input=OPTIMIZE_DETAILED_ITEM_PROMPT.format(
              **listing_context_kwargs,
              item_title=item.title,
              item_subtitle=item.subtitle,
              item_bullets=item_text,
            ),
            response_model=DetailedItem,
          )
          return DetailedItem(
            title=response.title,
            subtitle=response.subtitle,
            start_date=item.start_date,
            end_date=item.end_date,
            bullets=response.bullets,
          )

        optimized_items = await asyncio.gather(*[optimize_item(item) for item in section.content])
        return DetailedSection(
          id=section.id,
          title=section.title,
          content=optimized_items,
        )
      elif section.type == SectionTypeEnum.PARAGRAPH:
        response = await llm_service.call_structured(
          input=OPTIMIZE_PARAGRAPH_SECTION_PROMPT.format(
            **listing_context_kwargs,
            section_id=section.id,
            section_title=section.title,
            content=section.content,
          ),
          response_model=ParagraphSection,
        )
        return ParagraphSection(
          id=section.id,
          title=section.title,
          content=response.content,
        )
      elif section.type == SectionTypeEnum.SIMPLE:
        response = await llm_service.call_structured(
          input=OPTIMIZE_SIMPLE_SECTION_PROMPT.format(
            **listing_context_kwargs,
            section_id=section.id,
            section_title=section.title,
            items='\n'.join(f'- {item}' for item in section.content),
          ),
          response_model=SimpleSection,
        )
        return SimpleSection(
          id=section.id,
          title=section.title,
          content=response.content,
        )
      else:
        return section

    optimized_sections = await asyncio.gather(
      *[optimize_section(s) for s in default_resume.sections]
    )

    return resumes_service.create(
      Resume(
        template_id=default_resume.template_id,
        sections=optimized_sections,
      )
    )
  else:
    raise ValueError(f'Invalid mode: {mode}')


@router.get('/{resume_id}')
async def get_resume(resume_id: UUID) -> Resume:
  resume = resumes_service.get(resume_id)

  # Self-healing
  try:
    templates_service.get_local_template(resume.template_id)
  except FileNotFoundError:
    resume.template_id = DEFAULT_TEMPLATE_ID
    resume = resumes_service.update(resume)

  return resume


@router.put('/{resume_id}')
async def update_resume(resume_id: UUID, resume: Resume) -> Resume:
  resume.id = resume_id
  return resumes_service.update(resume)


@router.delete('/{resume_id}')
async def delete_resume(resume_id: UUID):
  resumes_service.delete(resume_id)
  return {'message': 'Resume deleted successfully'}
