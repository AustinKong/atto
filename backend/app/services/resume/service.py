import asyncio
from typing import cast

from app.clients.model import ModelClient
from app.schemas.listing import Listing
from app.schemas.resume import (
  DetailedSection,
  ParagraphSection,
  Section,
  SectionTypeEnum,
  SimpleSection,
)
from app.utils.text import to_bullets

from .optimization import (
  optimize_detailed_section,
  optimize_paragraph_section,
  optimize_simple_section,
)
from .prompts import LISTING_CONTEXT


async def optimize_resume_sections(
  sections: list[Section],
  listing: Listing,
  llm_client: ModelClient,
) -> list[Section]:
  listing_context = LISTING_CONTEXT.format(
    listing_title=listing.title,
    listing_requirements=to_bullets(listing.requirements),
    listing_skills=', '.join(listing.skills),
  )

  async def optimize_section(section: Section) -> Section:
    match section.type:
      case SectionTypeEnum.DETAILED:
        return await optimize_detailed_section(
          section=cast(DetailedSection, section),
          listing_context=listing_context,
          llm_client=llm_client,
        )
      case SectionTypeEnum.PARAGRAPH:
        return await optimize_paragraph_section(
          section=cast(ParagraphSection, section),
          listing_context=listing_context,
          llm_client=llm_client,
        )
      case SectionTypeEnum.SIMPLE:
        return await optimize_simple_section(
          section=cast(SimpleSection, section),
          listing_context=listing_context,
          llm_client=llm_client,
        )
      case _:
        return section

  return await asyncio.gather(*[optimize_section(section) for section in sections])
