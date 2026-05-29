from typing import assert_never

from app.schemas.listing import Listing
from app.schemas.resume import DetailedSection, ParagraphSection, Resume, Section, SimpleSection
from app.utils.text import to_bullets


def build_listing_analysis_text(listing: Listing) -> str:
  text = f'{listing.description}\n'
  if listing.skills:
    text += f'Skills:\n{to_bullets(listing.skills)}\n'
  if listing.keywords:
    text += f'Keywords:\n{to_bullets([keyword.word for keyword in listing.keywords])}\n'
  if listing.requirements:
    text += 'Requirements:\n'
    text += f'{to_bullets(listing.requirements)}\n'
  return text.strip()


def build_resume_analysis_text(resume: Resume) -> str:
  text = ''

  for section in resume.sections:
    text += f'{section.title.content}\n'
    text += f'{build_section_analysis_text(section)}\n'

  return text.strip()


def build_section_analysis_text(section: Section) -> str:
  match section:
    case SimpleSection():
      return to_bullets([item.content for item in section.content])
    case DetailedSection():
      text = ''
      for item in section.content:
        text += f'{item.title.content}\n'
        if item.subtitle.content.strip():
          text += f'{item.subtitle.content}\n'
        text += f'{to_bullets([bullet.content for bullet in item.bullets])}\n'
      return text.strip()
    case ParagraphSection():
      return section.content.content
    case _:
      assert_never(section)
