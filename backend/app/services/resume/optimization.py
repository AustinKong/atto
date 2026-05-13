import asyncio

from app.clients.model import ModelClient
from app.schemas.resume import (
  DateRangeUnit,
  DetailedItem,
  DetailedSection,
  ParagraphSection,
  SimpleSection,
  TextUnit,
)
from app.utils.text import to_bullets

from .prompts import (
  OPTIMIZE_DETAILED_ITEM_PROMPT,
  OPTIMIZE_PARAGRAPH_SECTION_PROMPT,
  OPTIMIZE_SIMPLE_SECTION_PROMPT,
)
from .schemas import OptimizedDetailedItem, OptimizedParagraphSection, OptimizedSimpleSection


async def optimize_detailed_section(
  section: DetailedSection,
  listing_context: str,
  llm_client: ModelClient,
) -> DetailedSection:
  async def optimize_item(item: DetailedItem) -> DetailedItem:
    item_text = format_detailed_item_source(
      title=item.title.content,
      subtitle=item.subtitle.content,
      bullets=[bullet.content for bullet in item.bullets],
    )
    response = await llm_client.call_structured(
      input=OPTIMIZE_DETAILED_ITEM_PROMPT.format(
        listing_context=listing_context,
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


async def optimize_paragraph_section(
  section: ParagraphSection,
  listing_context: str,
  llm_client: ModelClient,
) -> ParagraphSection:
  response = await llm_client.call_structured(
    input=OPTIMIZE_PARAGRAPH_SECTION_PROMPT.format(
      listing_context=listing_context,
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


async def optimize_simple_section(
  section: SimpleSection,
  listing_context: str,
  llm_client: ModelClient,
) -> SimpleSection:
  response = await llm_client.call_structured(
    input=OPTIMIZE_SIMPLE_SECTION_PROMPT.format(
      listing_context=listing_context,
      section_id=section.id,
      section_title=section.title.content,
      items=to_bullets([item.content for item in section.content]),
    ),
    response_model=OptimizedSimpleSection,
  )
  return SimpleSection(
    id=section.id,
    title=section.title,
    content=merge_text_units(section.content, response.content),
  )


def format_detailed_item_source(title: str, subtitle: str, bullets: list[str]) -> str:
  return '\n'.join(
    [
      f'title: {title}',
      f'subtitle: {subtitle}',
      'Bullets:',
      to_bullets(bullets),
    ]
  )


def merge_text_units(existing: list[TextUnit], updated: list[str]) -> list[TextUnit]:
  merged: list[TextUnit] = []

  for index, content in enumerate(updated):
    if index < len(existing):
      merged.append(TextUnit(id=existing[index].id, content=content))
    else:
      merged.append(TextUnit(content=content))

  return merged
