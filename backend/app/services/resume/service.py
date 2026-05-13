import asyncio
from typing import assert_never

from app.clients.model import ModelClient
from app.schemas.listing import Listing
from app.schemas.resume import DetailedSection, ParagraphSection, Section, SimpleSection
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
    match section:
      case SimpleSection():
        return await optimize_simple_section(
          section=section,
          listing_context=listing_context,
          llm_client=llm_client,
        )
      case DetailedSection():
        return await optimize_detailed_section(
          section=section,
          listing_context=listing_context,
          llm_client=llm_client,
        )
      case ParagraphSection():
        return await optimize_paragraph_section(
          section=section,
          listing_context=listing_context,
          llm_client=llm_client,
        )
      case _:
        assert_never(section)

  return await asyncio.gather(*[optimize_section(section) for section in sections])
