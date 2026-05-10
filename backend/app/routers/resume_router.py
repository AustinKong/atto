import asyncio
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.clients.model import ModelClient, get_model_client
from app.repositories import ListingRepository, ResumeRepository, TemplateRepository
from app.resources.prompts import (
  LISTING_CONTEXT,
  OPTIMIZE_DETAILED_ITEM_PROMPT,
  OPTIMIZE_PARAGRAPH_SECTION_PROMPT,
  OPTIMIZE_SIMPLE_SECTION_PROMPT,
)
from app.schemas import (
  DEFAULT_TEMPLATE_ID,
  CamelModel,
  DateRangeUnit,
  DetailedItem,
  DetailedSection,
  ParagraphSection,
  Resume,
  Section,
  SectionTypeEnum,
  SimpleSection,
  TextUnit,
)

router = APIRouter(
  prefix='/resumes',
  tags=['Resumes'],
)


class OptimizedDetailedItem(CamelModel):
  title: str
  subtitle: str = ''
  bullets: list[str]


class OptimizedSimpleSection(CamelModel):
  content: list[str]


class OptimizedParagraphSection(CamelModel):
  content: str


def merge_text_units(existing: list[TextUnit], updated: list[str]) -> list[TextUnit]:
  merged: list[TextUnit] = []

  for index, content in enumerate(updated):
    if index < len(existing):
      merged.append(TextUnit(id=existing[index].id, content=content))
    else:
      merged.append(TextUnit(content=content))

  return merged


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
      raise ValueError('listing_id is required when mode is "optimized"')

    listing = listing_repository.get(listing_id)

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
          item_text = (
            f'  title: {item.title.content}\n  subtitle: {item.subtitle.content}\n'
            + '\n'.join(f'    - {b.content}' for b in item.bullets)
          )
          response = await llm_client.call_structured(
            input=OPTIMIZE_DETAILED_ITEM_PROMPT.format(
              **listing_context_kwargs,
              item_title=item.title.content,
              item_subtitle=item.subtitle.content,
              item_bullets=item_text,
            ),
            response_model=OptimizedDetailedItem,
          )
          return DetailedItem(
            id=item.id,
            title=TextUnit(id=item.title.id, content=response.title),
            subtitle=TextUnit(id=item.subtitle.id, content=response.subtitle),
            date_range=DateRangeUnit(
              id=item.date_range.id,
              start_date=item.date_range.start_date,
              end_date=item.date_range.end_date,
            ),
            bullets=merge_text_units(item.bullets, response.bullets),
          )

        optimized_items = await asyncio.gather(*[optimize_item(item) for item in section.content])
        return DetailedSection(
          id=section.id,
          title=section.title,
          content=optimized_items,
        )
      elif section.type == SectionTypeEnum.PARAGRAPH:
        response = await llm_client.call_structured(
          input=OPTIMIZE_PARAGRAPH_SECTION_PROMPT.format(
            **listing_context_kwargs,
            section_id=section.id,
            section_title=section.title.content,
            content=section.content.content,
          ),
          response_model=OptimizedParagraphSection,
        )
        return ParagraphSection(
          id=section.id,
          title=section.title,
          content=TextUnit(id=section.content.id, content=response.content),
        )
      elif section.type == SectionTypeEnum.SIMPLE:
        response = await llm_client.call_structured(
          input=OPTIMIZE_SIMPLE_SECTION_PROMPT.format(
            **listing_context_kwargs,
            section_id=section.id,
            section_title=section.title.content,
            items='\n'.join(f'- {item.content}' for item in section.content),
          ),
          response_model=OptimizedSimpleSection,
        )
        return SimpleSection(
          id=section.id,
          title=section.title,
          content=merge_text_units(section.content, response.content),
        )
      else:
        return section

    optimized_sections = await asyncio.gather(
      *[optimize_section(s) for s in default_resume.sections]
    )

    return resume_repository.create(
      Resume(
        template_id=default_resume.template_id,
        sections=optimized_sections,
      )
    )
  else:
    raise ValueError(f'Invalid mode: {mode}')


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
  except FileNotFoundError:
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
